/* ==========================================================================
   NUBE FAMILIAR — sincronización opcional con código de hogar (Supabase).
   - Sin configurar o sin vincular: la app sigue 100% local, no cambia nada.
   - Vinculado: cada cambio local se sube (con fusión) y la nube se consulta
     al arrancar, cada 30 s, al volver a la app y en vivo si hay red.
   - Los borrados viajan como "lápidas" para que no resuciten en otros móviles.
   ========================================================================== */
(function () {
'use strict';

var LS_HOGAR = 'gestor_hogar_v1';
var POLL_MS = 30000;
var PRUNE_MS = 90 * 24 * 3600 * 1000;
var timerSubida = null;
var reemplazarProxima = false;
var rtClient = null;
var rtCanal = null;
var arranqueListo = false;
var ultimoErrorNube = null;

/* ---------------- config y vínculo ---------------- */

function nubeConfig() {
  try {
    var c = (typeof window !== 'undefined' && window.NUBE_CONFIG) || {};
    if (c.SUPABASE_URL && c.SUPABASE_KEY) return c;
  } catch (e) {}
  return null;
}

function nubeConfigurada() { return !!nubeConfig(); }

function leerVinculo() {
  try {
    var raw = localStorage.getItem(LS_HOGAR);
    if (!raw) return null;
    var v = JSON.parse(raw);
    if (v && v.codigo && v.miembroTelefono) return v;
  } catch (e) {}
  return null;
}

function guardarVinculo(v) {
  try {
    if (!v) localStorage.removeItem(LS_HOGAR);
    else localStorage.setItem(LS_HOGAR, JSON.stringify(v));
  } catch (e) {}
}

/* ---------------- REST (solo funciones RPC seguras) ---------------- */

async function rpc(nombre, params) {
  var c = nubeConfig();
  if (!c) throw new Error('nube sin configurar');
  var ctrl = null;
  var t = null;
  try {
    if (typeof AbortController !== 'undefined') {
      ctrl = new AbortController();
      t = setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, 12000);
    }
    var res = await fetch(c.SUPABASE_URL + '/rest/v1/rpc/' + nombre, {
      method: 'POST',
      headers: {
        'apikey': c.SUPABASE_KEY,
        'Authorization': 'Bearer ' + c.SUPABASE_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params || {}),
      signal: ctrl ? ctrl.signal : undefined
    });
    if (t) clearTimeout(t);
    if (!res.ok) {
      var txt = '';
      try { txt = await res.text(); } catch (e) {}
      throw new Error('nube ' + res.status + ' ' + String(txt).slice(0, 200));
    }
    var texto = await res.text();
    if (!texto) return null;
    try { return JSON.parse(texto); } catch (e) { return texto; }
  } catch (e) {
    if (t) clearTimeout(t);
    throw e;
  }
}

/* ---------------- estado y fusión ---------------- */

function estadoActual() {
  var borr = {};
  try {
    if (typeof estado !== 'undefined' && estado._borrados && typeof estado._borrados === 'object') borr = estado._borrados;
  } catch (e) {}
  return {
    transacciones: (typeof estado !== 'undefined' && estado.transacciones) || [],
    recurrentes: (typeof estado !== 'undefined' && estado.recurrentes) || [],
    metasPorMes: (typeof estado !== 'undefined' && estado.metasPorMes) || {},
    usuarios: (typeof estado !== 'undefined' && estado.usuarios) || {},
    _borrados: borr
  };
}

function tsItem(x) {
  if (!x) return 0;
  if (typeof x._mod === 'number') return x._mod;
  if (typeof x.id === 'number') return x.id;
  var n = parseInt(x.id, 10);
  return isNaN(n) ? 0 : n;
}

function podarBorrados(borrados) {
  var out = {};
  var limite = Date.now() - PRUNE_MS;
  Object.keys(borrados || {}).forEach(function (k) {
    if (borrados[k] > limite) out[k] = borrados[k];
  });
  return out;
}

function filtrarBorradosMapa(obj, borrados, clase) {
  var out = {};
  Object.keys(obj || {}).forEach(function (k) {
    if (!borrados[clase + ':' + String(k)]) out[k] = obj[k];
  });
  return out;
}

// Fusión convergente: por id gana el más recientemente modificado;
// en mapas (usuarios/metas) gana la nube en caso de conflicto.
function mergeEstados(local, remoto) {
  local = local || {};
  remoto = remoto || {};
  var borrados = podarBorrados(Object.assign({}, local._borrados, remoto._borrados));
  function unirListas(a, b, clase) {
    var mapa = new Map();
    (a || []).concat(b || []).forEach(function (x) {
      if (!x || x.id === undefined || x.id === null) return;
      var sid = String(x.id);
      if (borrados[clase + ':' + sid]) return;
      var prev = mapa.get(sid);
      if (!prev || tsItem(x) >= tsItem(prev)) mapa.set(sid, x);
    });
    return Array.from(mapa.values());
  }
  function unirMapas(a, b, clase) {
    var out = {};
    var fa = filtrarBorradosMapa(a, borrados, clase);
    var fb = filtrarBorradosMapa(b, borrados, clase);
    Object.keys(fa).forEach(function (k) { out[k] = fa[k]; });
    Object.keys(fb).forEach(function (k) { out[k] = fb[k]; });
    return out;
  }
  return {
    transacciones: unirListas(local.transacciones, remoto.transacciones, 'tx'),
    recurrentes: unirListas(local.recurrentes, remoto.recurrentes, 'rec'),
    metasPorMes: unirMapas(local.metasPorMes, remoto.metasPorMes, 'meta'),
    usuarios: unirMapas(local.usuarios, remoto.usuarios, 'usr'),
    _borrados: borrados
  };
}

function huella(est) {
  function normList(a) {
    return (a || []).slice().sort(function (p, q) {
      var x = String(p.id), y = String(q.id);
      return x < y ? -1 : (x > y ? 1 : 0);
    });
  }
  function normMap(o) {
    var r = {};
    Object.keys(o || {}).sort().forEach(function (k) { r[k] = o[k]; });
    return r;
  }
  return JSON.stringify({
    t: normList(est.transacciones),
    r: normList(est.recurrentes),
    m: normMap(est.metasPorMes),
    u: normMap(est.usuarios)
  });
}

function aplicarEstado(est) {
  try {
    if (typeof estado === 'undefined') return;
    estado.transacciones = est.transacciones || [];
    estado.recurrentes = est.recurrentes || [];
    estado.metasPorMes = est.metasPorMes || {};
    estado.usuarios = est.usuarios || {};
    estado._borrados = est._borrados || {};
    try { window.__NUBE_SUPRIMIR__ = true; guardarLocalmente(); }
    finally { try { window.__NUBE_SUPRIMIR__ = false; } catch (e) {} }
    try { if (typeof inicializarSelectorMeses === 'function') inicializarSelectorMeses(); } catch (e) {}
    try { if (typeof actualizarSelectUsuarios === 'function') actualizarSelectUsuarios(); } catch (e) {}
    try { if (typeof actualizarVistas === 'function') actualizarVistas(); } catch (e) {}
  } catch (e) {}
}

/* ---------------- subida / bajada ---------------- */

function hayRed() {
  try {
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean') return navigator.onLine;
  } catch (e) {}
  return true;
}

function programarSubidaNube(reemplazar) {
  try {
    if (reemplazar) reemplazarProxima = true;
    if (!leerVinculo() || !nubeConfigurada()) return;
    if (timerSubida) clearTimeout(timerSubida);
    timerSubida = setTimeout(function () { subidaNube(false); }, 1500);
  } catch (e) {}
}

async function subidaNube(manual) {
  timerSubida = null;
  var v = leerVinculo();
  if (!v || !nubeConfigurada()) return false;
  if (!hayRed()) { if (manual) toastNube('Sin conexión a internet.', 'danger'); return false; }
  var reemplazar = reemplazarProxima;
  reemplazarProxima = false;
  try {
    var remoto = await rpc('obtener_hogar', { codigo: v.codigo });
    var merged = (reemplazar || !remoto) ? estadoActual() : mergeEstados(estadoActual(), remoto);
    await rpc('guardar_hogar', { codigo: v.codigo, nuevo: merged });
    aplicarEstado(merged);
    marcarSync('ok');
    refrescarHogarUI();
    return true;
  } catch (e) {
    marcarSync('error', e);
    if (manual) toastNube('No se pudo subir: ' + mensajeCorto(e), 'danger');
    return false;
  }
}

async function bajadaNube(manual) {
  var v = leerVinculo();
  if (!v || !nubeConfigurada()) return false;
  if (!hayRed()) { if (manual) toastNube('Sin conexión a internet.', 'danger'); return false; }
  try {
    var remoto = await rpc('obtener_hogar', { codigo: v.codigo });
    if (!remoto) { if (manual) toastNube('El hogar aún no tiene datos en la nube.', 'info'); return false; }
    var antes = huella(estadoActual());
    var merged = mergeEstados(estadoActual(), remoto);
    var cambio = huella(merged) !== antes;
    aplicarEstado(merged);
    marcarSync('ok');
    refrescarHogarUI();
    if (cambio) toastNube('Novedades del hogar aplicadas.', 'success');
    else if (manual) toastNube('Ya estabas al día.', 'info');
    return cambio;
  } catch (e) {
    marcarSync('error', e);
    if (manual) toastNube('No se pudo sincronizar: ' + mensajeCorto(e), 'danger');
    return false;
  }
}

async function sincronizarAhora() {
  toastNube('Sincronizando con el hogar…', 'info');
  await bajadaNube(false);
  var ok = await subidaNube(true);
  if (ok) toastNube('Hogar sincronizado.', 'success');
}

function mensajeCorto(e) {
  var m = String((e && e.message) || e || 'error');
  if (/Could not find the function|404/.test(m)) return 'falta ejecutar el SQL en Supabase';
  return m.slice(0, 120);
}

function toastNube(msg, tipo) {
  try {
    if (typeof mostrarToast === 'function') mostrarToast(msg, tipo || 'info');
  } catch (e) {}
}

function marcarSync(cual, err) {
  ultimoErrorNube = err || null;
  try {
    if (typeof document === 'undefined') return;
    var el = document.getElementById('hogSyncTxt');
    if (!el) return;
    if (cual === 'ok') {
      var h = new Date();
      var hh = ('0' + h.getHours()).slice(-2);
      var mm = ('0' + h.getMinutes()).slice(-2);
      el.textContent = 'Sincronizado con la nube a las ' + hh + ':' + mm + '.';
    } else {
      el.textContent = 'Sin conexión con la nube: se reintentará solo.';
    }
  } catch (e) {}
}

/* ---------------- lápidas de borrado ---------------- */

function NUBE_marcarBorrado(clase, id) {
  try {
    if (typeof estado === 'undefined') return;
    if (!estado._borrados || typeof estado._borrados !== 'object') estado._borrados = {};
    estado._borrados[clase + ':' + String(id)] = Date.now();
  } catch (e) {}
}

/* ---------------- crear / unirse / salir ---------------- */

function leerFormularioHogar() {
  function val(id) {
    try {
      var el = document.getElementById(id);
      return el ? String(el.value || '').trim() : '';
    } catch (e) { return ''; }
  }
  return {
    nombre: val('hogNombre'),
    telefono: val('hogTelefono'),
    codigo: val('hogCodigo').toUpperCase().replace(/\s+/g, '')
  };
}

function generarCodigo() {
  var ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  var out = '';
  try {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      var r = new Uint32Array(8);
      crypto.getRandomValues(r);
      for (var i = 0; i < 8; i++) out += ABC[r[i] % ABC.length];
      return 'FAM-' + out;
    }
  } catch (e) {}
  for (var j = 0; j < 8; j++) out += ABC[Math.floor(Math.random() * ABC.length)];
  return 'FAM-' + out;
}

function asegurarMiembro(tel, nom) {
  try {
    if (typeof estado === 'undefined') return;
    if (!estado.usuarios[tel]) estado.usuarios[tel] = nom;
  } catch (e) {}
}

async function crearHogar() {
  var f = leerFormularioHogar();
  if (!f.nombre || !f.telefono) { toastNube('Indica tu nombre y tu teléfono.', 'danger'); return; }
  if (!nubeConfigurada()) { toastNube('Nube sin configurar.', 'danger'); return; }
  if (!hayRed()) { toastNube('Sin conexión a internet.', 'danger'); return; }
  toastNube('Creando tu hogar…', 'info');
  try {
    asegurarMiembro(f.telefono, f.nombre);
    var codigo = null;
    for (var i = 0; i < 5; i++) {
      var c = generarCodigo();
      var existe = await rpc('obtener_hogar', { codigo: c });
      if (!existe) { codigo = c; break; }
    }
    if (!codigo) { toastNube('No se pudo generar el código, reintenta.', 'danger'); return; }
    guardarVinculo({ codigo: codigo, miembroTelefono: f.telefono, miembroNombre: f.nombre });
    await rpc('guardar_hogar', { codigo: codigo, nuevo: estadoActual() });
    try { guardarLocalmente(); } catch (e) {}
    marcarSync('ok');
    refrescarHogarUI();
    activarRealtime();
    try { if (typeof actualizarSelectUsuarios === 'function') actualizarSelectUsuarios(); } catch (e) {}
    try { if (typeof actualizarVistas === 'function') actualizarVistas(); } catch (e) {}
    toastNube('Hogar ' + codigo + ' creado. Compártelo con tu familia.', 'success');
  } catch (e) {
    guardarVinculo(null);
    toastNube('No se pudo crear: ' + mensajeCorto(e), 'danger');
  }
}

async function unirseHogar() {
  var f = leerFormularioHogar();
  if (!f.nombre || !f.telefono || !f.codigo) { toastNube('Indica tu nombre, tu teléfono y el código.', 'danger'); return; }
  if (!nubeConfigurada()) { toastNube('Nube sin configurar.', 'danger'); return; }
  if (!hayRed()) { toastNube('Sin conexión a internet.', 'danger'); return; }
  toastNube('Uniéndote al hogar…', 'info');
  try {
    var remoto = await rpc('obtener_hogar', { codigo: f.codigo });
    if (!remoto) { toastNube('Código no encontrado. Revísalo.', 'danger'); return; }
    asegurarMiembro(f.telefono, f.nombre);
    var merged = mergeEstados(estadoActual(), remoto);
    guardarVinculo({ codigo: f.codigo, miembroTelefono: f.telefono, miembroNombre: f.nombre });
    aplicarEstado(merged);
    await rpc('guardar_hogar', { codigo: f.codigo, nuevo: estadoActual() });
    marcarSync('ok');
    refrescarHogarUI();
    activarRealtime();
    toastNube('Unido al hogar ' + f.codigo + '. Ya ves los gastos de todos.', 'success');
  } catch (e) {
    toastNube('No se pudo unir: ' + mensajeCorto(e), 'danger');
  }
}

function desvincularHogar() {
  var v = leerVinculo();
  if (!v) return;
  var ok = true;
  try { ok = confirm('¿Desvincular este dispositivo del hogar ' + v.codigo + '? Tus datos locales se conservan.'); } catch (e) {}
  if (!ok) return;
  guardarVinculo(null);
  try { if (rtCanal && rtCanal.unsubscribe) rtCanal.unsubscribe(); } catch (e) {}
  rtCanal = null;
  refrescarHogarUI();
  toastNube('Dispositivo desvinculado. Tus datos locales siguen aquí.', 'info');
}

async function probarConexionNube() {
  if (!nubeConfigurada()) { toastNube('Falta nube-config.js (nube sin configurar).', 'danger'); return; }
  toastNube('Probando conexión con la nube…', 'info');
  try {
    await rpc('obtener_hogar', { codigo: 'PRUEBA-CONEXION' });
    toastNube('Conexión con la nube OK.', 'success');
  } catch (e) {
    toastNube('Fallo: ' + mensajeCorto(e), 'danger');
  }
}

function copiarCodigoHogar() {
  var v = leerVinculo();
  if (!v) return;
  function ok() { toastNube('Código copiado: ' + v.codigo, 'success'); }
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(v.codigo).then(ok, function () { respaldo(); });
    } else {
      respaldo();
    }
  } catch (e) { respaldo(); }
  function respaldo() {
    try {
      var ta = document.createElement('textarea');
      ta.value = v.codigo;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      ok();
    } catch (e2) {
      toastNube('Tu código es: ' + v.codigo, 'info');
    }
  }
}

/* ---------------- interfaz ---------------- */

function refrescarHogarUI() {
  try {
    if (typeof document === 'undefined') return;
    var v = leerVinculo();
    var sin = document.getElementById('hogarSinVinculo');
    var con = document.getElementById('hogarVinculado');
    var est = document.getElementById('hogarEstado');
    if (sin) sin.style.display = v ? 'none' : '';
    if (con) con.style.display = v ? '' : 'none';
    if (v) {
      if (est) est.textContent = 'Vinculado al hogar ' + v.codigo + ' como ' + (v.miembroNombre || v.miembroTelefono) + '.';
      var cod = document.getElementById('hogCodigoTxt');
      if (cod) cod.textContent = v.codigo;
      var mie = document.getElementById('hogMiembroTxt');
      if (mie) mie.textContent = (v.miembroNombre || '') + (v.miembroTelefono ? ' (' + v.miembroTelefono + ')' : '');
      try {
        var badge = document.getElementById('modoBadge');
        if (badge) { badge.textContent = '● Hogar ' + v.codigo; badge.dataset.modo = 'server'; }
      } catch (e) {}
    } else {
      if (est) est.textContent = 'Sin vincular: cada dispositivo guarda lo suyo.';
      try {
        var b2 = document.getElementById('modoBadge');
        if (b2) { b2.textContent = '● Modo local'; b2.dataset.modo = 'local'; }
      } catch (e) {}
    }
    try {
      var chips = document.getElementById('hogMiembrosChips');
      if (chips && typeof estado !== 'undefined' && estado.usuarios) {
        var tels = Object.keys(estado.usuarios);
        var yo = v ? v.miembroTelefono : null;
        var h = '<div style="font-size:.8rem;font-weight:700;color:var(--text-secondary);margin-bottom:6px">' +
          tels.length + (tels.length === 1 ? ' persona en el hogar:' : ' personas en el hogar:') + '</div>' +
          '<div style="display:flex;gap:8px;flex-wrap:wrap">';
        if (!tels.length) h += '<span style="font-size:.82rem;color:var(--text-secondary)">Aún no hay miembros.</span>';
        tels.forEach(function (t) {
          var nm = estado.usuarios[t] || t;
          h += '<span style="font-size:.8rem;font-weight:700;padding:5px 12px;border-radius:999px;background:var(--primary-surface);border:1px solid var(--primary-light)">👤 ' + nm + (t === yo ? ' (este dispositivo)' : '') + '</span>';
        });
        chips.innerHTML = h + '</div>';
      }
    } catch (e) {}
  } catch (e) {}
}

function NUBE_hogarVinculado() { return leerVinculo(); }

/* ---------------- tiempo real (opcional) y sondeo ---------------- */

function activarRealtime() {
  var v = leerVinculo();
  if (!v || !nubeConfigurada()) return;
  try {
    if (rtCanal && rtCanal.unsubscribe) { try { rtCanal.unsubscribe(); } catch (e) {} rtCanal = null; }
    if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
      suscribir(window.supabase.createClient(nubeConfig().SUPABASE_URL, nubeConfig().SUPABASE_KEY), v.codigo);
    } else if (typeof document !== 'undefined') {
      var s = document.getElementById('supabase-rt');
      if (!s) {
        s = document.createElement('script');
        s.id = 'supabase-rt';
        s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
        s.onload = function () { activarRealtime(); };
        try { document.head.appendChild(s); } catch (e) {}
      }
    }
  } catch (e) {}
}

function suscribir(cliente, codigo) {
  try {
    rtClient = cliente;
    rtCanal = cliente.channel('hogar-' + codigo)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'hogares_estado', filter: 'hogar=eq.' + codigo }, function () {
        bajadaNube(false);
      })
      .subscribe();
  } catch (e) { rtCanal = null; }
}

function arranque() {
  if (arranqueListo) return;
  arranqueListo = true;
  try { refrescarHogarUI(); } catch (e) {}
  var v = leerVinculo();
  if (v && nubeConfigurada()) {
    setTimeout(function () { bajadaNube(false); activarRealtime(); }, 2500);
    try {
      setInterval(function () {
        try {
          var vis = (typeof document !== 'undefined' && document.visibilityState) || 'visible';
          if (vis === 'visible' && hayRed() && leerVinculo() && nubeConfigurada()) bajadaNube(false);
        } catch (e) {}
      }, POLL_MS);
    } catch (e) {}
  }
}

/* ---------------- exportaciones globales ---------------- */

try {
  var __g = (typeof window !== 'undefined') ? window : globalThis;
  __g.programarSubidaNube = programarSubidaNube;
  __g.NUBE_marcarBorrado = NUBE_marcarBorrado;
  __g.NUBE_hogarVinculado = NUBE_hogarVinculado;
  __g.crearHogar = crearHogar;
  __g.unirseHogar = unirseHogar;
  __g.desvincularHogar = desvincularHogar;
  __g.sincronizarAhora = sincronizarAhora;
  __g.copiarCodigoHogar = copiarCodigoHogar;
  __g.probarConexionNube = probarConexionNube;
  __g.refrescarHogarUI = refrescarHogarUI;
  __g.__NUBE_TEST__ = {
    mergeEstados: mergeEstados,
    estadoActual: estadoActual,
    huella: huella,
    generarCodigo: generarCodigo,
    leerVinculo: leerVinculo,
    guardarVinculo: guardarVinculo,
    subidaNube: subidaNube,
    bajadaNube: bajadaNube,
    rpc: rpc
  };
} catch (e) {}

if (typeof document !== 'undefined' && document.addEventListener) {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arranque);
  else { try { setTimeout(arranque, 500); } catch (e) {} }
  document.addEventListener('visibilitychange', function () {
    try {
      if (document.visibilityState === 'visible' && leerVinculo() && nubeConfigurada()) bajadaNube(false);
    } catch (e) {}
  });
}
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('online', function () {
    try {
      if (leerVinculo() && nubeConfigurada()) { bajadaNube(false); programarSubidaNube(); }
    } catch (e) {}
  });
}

})();
