/**
 * Gestor de Gastos Familiar Avanzado
 * Arquitectura Local-First: Funciona 100% autónomo (offline, sin servidor o con servidor en la nube).
 */

// ==========================================================================
// Constantes y Configuración de Categorías
// ==========================================================================

const CATEGORIAS_CONFIG = {
    "Alimentación": { icon: "🛒", color: "#10b981", desc: "Supermercados, frutería, carnicería" },
    "Vivienda": { icon: "🏠", color: "#6366f1", desc: "Alquiler, hipoteca, comunidad" },
    "Transporte": { icon: "🚗", color: "#0284c7", desc: "Gasolina, coche, transporte público" },
    "Suministros": { icon: "💡", color: "#f59e0b", desc: "Luz, agua, gas, internet, móvil" },
    "Moda y Estética": { icon: "👗", color: "#ec4899", desc: "Ropa, calzado, peluquería" },
    "Ocio y Actividades": { icon: "🍿", color: "#8b5cf6", desc: "Restaurantes, viajes, cine, suscripciones" },
    "Salud y Cuidado": { icon: "💊", color: "#14b8a6", desc: "Farmacia, médico, dentista, gimnasio" },
    "Banco y Seguros": { icon: "🏦", color: "#64748b", desc: "Nóminas, comisiones, pólizas" },
    "Otros": { icon: "📦", color: "#a855f7", desc: "Compras varias, regalos, imprevistos" },
    "General": { icon: "📁", color: "#94a3b8", desc: "Categoría general" }
};

const DATOS_INICIALES = { usuarios: {}, metasPorMes: {}, recurrentes: [], transacciones: [] };

// Datos de ejemplo (botón "Cargar Datos de Demostración"). Ya NO se cargan solos.
const DATOS_DEMO = {
    usuarios: {
        "600111222": "Alejandro",
        "600333444": "Laura (Pareja)"
    },
    metasPorMes: {
        "2026-01": 250, "2026-02": 250, "2026-03": 300,
        "2026-04": 300, "2026-05": 300, "2026-06": 350,
        "2026-07": 400, "2026-08": 300, "2026-09": 350
    },
    recurrentes: [
        { id: 1, concepto: "Hipoteca / Alquiler Piso", tipo: "gasto", dia: 1, cantidad: 850, categoria: "Vivienda", activo: true },
        { id: 2, concepto: "Nómina Fija Alejandro", tipo: "ingreso", dia: 1, cantidad: 2150, categoria: "Banco y Seguros", activo: true },
        { id: 3, concepto: "Nómina Fija Laura", tipo: "ingreso", dia: 2, cantidad: 1850, categoria: "Banco y Seguros", activo: true },
        { id: 4, concepto: "Seguro de Hogar & Coche", tipo: "gasto", dia: 5, cantidad: 55, categoria: "Banco y Seguros", activo: true },
        { id: 5, concepto: "Fibra Óptica 1Gb + Móviles", tipo: "gasto", dia: 10, cantidad: 45, categoria: "Suministros", activo: true },
        { id: 6, concepto: "Factura Eléctrica", tipo: "gasto", dia: 15, cantidad: 75, categoria: "Suministros", activo: true },
        { id: 7, concepto: "Suscripciones (Streaming/Gym)", tipo: "gasto", dia: 20, cantidad: 38, categoria: "Ocio y Actividades", activo: true }
    ],
    transacciones: [
        { id: 101, telefono: "600111222", tipo: "ingreso", concepto: "Bonus puntual", categoria: "Banco y Seguros", cantidad: 300, esCompartido: false, fecha: "2026-03-05T09:30:00.000Z" },
        { id: 102, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Mensual Mercadona", categoria: "Alimentación", cantidad: 280, esCompartido: true, fecha: "2026-03-08T11:00:00.000Z" },
        { id: 103, telefono: "600333444", tipo: "gasto", concepto: "Compra Frutería y Pescado", categoria: "Alimentación", cantidad: 95, esCompartido: true, fecha: "2026-03-12T17:20:00.000Z" },
        { id: 104, telefono: "600111222", tipo: "gasto", concepto: "Gasolina Repsol", categoria: "Transporte", cantidad: 65, esCompartido: false, fecha: "2026-03-15T18:00:00.000Z" },
        { id: 105, telefono: "600333444", tipo: "gasto", concepto: "Cena Aniversario", categoria: "Ocio y Actividades", cantidad: 110, esCompartido: true, fecha: "2026-03-20T21:30:00.000Z" },
        { id: 106, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Carrefour", categoria: "Alimentación", cantidad: 320, esCompartido: true, fecha: "2026-04-06T10:15:00.000Z" },
        { id: 107, telefono: "600333444", tipo: "gasto", concepto: "Revisión Coche ITV", categoria: "Transporte", cantidad: 140, esCompartido: true, fecha: "2026-04-14T12:00:00.000Z" },
        { id: 108, telefono: "600111222", tipo: "gasto", concepto: "Farmacia y Vitaminas", categoria: "Salud y Cuidado", cantidad: 42, esCompartido: false, fecha: "2026-04-18T18:45:00.000Z" },
        { id: 109, telefono: "600333444", tipo: "gasto", concepto: "Ropa entretiempo Zara", categoria: "Moda y Estética", cantidad: 85, esCompartido: false, fecha: "2026-04-22T16:30:00.000Z" },
        { id: 110, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Semanal", categoria: "Alimentación", cantidad: 310, esCompartido: true, fecha: "2026-05-04T11:00:00.000Z" },
        { id: 111, telefono: "600333444", tipo: "gasto", concepto: "Escapada fin de semana", categoria: "Ocio y Actividades", cantidad: 220, esCompartido: true, fecha: "2026-05-16T19:00:00.000Z" },
        { id: 112, telefono: "600111222", tipo: "gasto", concepto: "Gasolina Repsol", categoria: "Transporte", cantidad: 70, esCompartido: false, fecha: "2026-05-20T08:30:00.000Z" },
        { id: 113, telefono: "600111222", tipo: "ingreso", concepto: "Paga Extra Verano Alejandro", categoria: "Banco y Seguros", cantidad: 1200, esCompartido: false, fecha: "2026-06-25T10:00:00.000Z" },
        { id: 114, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Grande Mercadona", categoria: "Alimentación", cantidad: 340, esCompartido: true, fecha: "2026-06-08T12:00:00.000Z" },
        { id: 115, telefono: "600333444", tipo: "gasto", concepto: "Billetes de tren vacaciones", categoria: "Transporte", cantidad: 160, esCompartido: true, fecha: "2026-06-18T14:30:00.000Z" },
        { id: 116, telefono: "600111222", tipo: "gasto", concepto: "Gafas de sol y óptica", categoria: "Salud y Cuidado", cantidad: 95, esCompartido: false, fecha: "2026-06-22T17:15:00.000Z" },
        { id: 117, telefono: "600333444", tipo: "ingreso", concepto: "Paga Extra Laura", categoria: "Banco y Seguros", cantidad: 1100, esCompartido: false, fecha: "2026-07-02T10:00:00.000Z" },
        { id: 118, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Vacacional", categoria: "Alimentación", cantidad: 390, esCompartido: true, fecha: "2026-07-07T11:00:00.000Z" },
        { id: 119, telefono: "600333444", tipo: "gasto", concepto: "Hotel y Alojamiento Playa", categoria: "Ocio y Actividades", cantidad: 550, esCompartido: true, fecha: "2026-07-15T12:00:00.000Z" },
        { id: 120, telefono: "600111222", tipo: "gasto", concepto: "Comidas fuera de casa", categoria: "Ocio y Actividades", cantidad: 210, esCompartido: true, fecha: "2026-07-22T22:00:00.000Z" },
        { id: 121, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Mercadona", categoria: "Alimentación", cantidad: 295.40, esCompartido: true, fecha: "2026-08-03T11:30:00.000Z" },
        { id: 122, telefono: "600111222", tipo: "gasto", concepto: "Vestido Vintage Thrifting", categoria: "Moda y Estética", cantidad: 65.00, esCompartido: false, fecha: "2026-08-04T12:00:00.000Z" },
        { id: 123, telefono: "600333444", tipo: "gasto", concepto: "Cena terraza con amigos", categoria: "Ocio y Actividades", cantidad: 115.50, esCompartido: true, fecha: "2026-08-08T22:15:00.000Z" },
        { id: 124, telefono: "600111222", tipo: "gasto", concepto: "Gasolina Repsol viaje", categoria: "Transporte", cantidad: 82.00, esCompartido: true, fecha: "2026-08-12T09:45:00.000Z" },
        { id: 125, telefono: "600333444", tipo: "gasto", concepto: "Compra semanal Lidl", categoria: "Alimentación", cantidad: 124.30, esCompartido: true, fecha: "2026-08-16T18:20:00.000Z" },
        { id: 126, telefono: "600111222", tipo: "ingreso", concepto: "Venta objetos segunda mano Wallapop", categoria: "Otros", cantidad: 140.00, esCompartido: false, fecha: "2026-08-19T17:00:00.000Z" },
        { id: 127, telefono: "600333444", tipo: "gasto", concepto: "Clínica Dental Higiene", categoria: "Salud y Cuidado", cantidad: 60.00, esCompartido: false, fecha: "2026-08-23T16:00:00.000Z" },
        { id: 128, telefono: "600111222", tipo: "gasto", concepto: "Cine de verano y palomitas", categoria: "Ocio y Actividades", cantidad: 32.00, esCompartido: true, fecha: "2026-08-28T21:00:00.000Z" },
        { id: 129, telefono: "600111222", tipo: "gasto", concepto: "Material oficina y vuelta al cole", categoria: "Otros", cantidad: 85.00, esCompartido: true, fecha: "2026-09-02T10:30:00.000Z" },
        { id: 130, telefono: "600333444", tipo: "gasto", concepto: "Supermercado Mensual Septiembre", categoria: "Alimentación", cantidad: 245.80, esCompartido: true, fecha: "2026-09-05T12:00:00.000Z" },
        { id: 131, telefono: "600111222", tipo: "gasto", concepto: "Abono transporte mensual", categoria: "Transporte", cantidad: 32.50, esCompartido: false, fecha: "2026-09-07T08:15:00.000Z" }
    ]
};

// ==========================================================================
// Estado Global Reactivo
// ==========================================================================

const estado = {
    transacciones: [],
    recurrentes: [],
    metasPorMes: {},
    usuarios: {},
    _borrados: {},
    mesSeleccionado: claveMesActual(),
    mesCalendario: calendarioMesActual(),
    tabActiva: "resumen",
    filtros: {
        busqueda: "",
        tipo: "todos",
        categoria: "todas",
        usuario: "todos"
    }
};

// ==========================================================================
// Persistencia Local-First (Funciona sin servidor local)
// ==========================================================================

function guardarLocalmente() {
    try {
        const payload = {
            transacciones: estado.transacciones,
            recurrentes: estado.recurrentes,
            metasPorMes: estado.metasPorMes,
            usuarios: estado.usuarios
        };
        localStorage.setItem('gestor_gastos_db', JSON.stringify(payload));
    } catch (e) {
        console.warn("No se pudo guardar en localStorage:", e);
    }
    try { if (typeof programarSubidaNube === 'function' && (typeof window === 'undefined' || !window.__NUBE_SUPRIMIR__)) programarSubidaNube(); } catch (e) {}
}

function cargarLocalmente() {
    try {
        const raw = localStorage.getItem('gestor_gastos_db');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed.transacciones)) estado.transacciones = parsed.transacciones;
            if (Array.isArray(parsed.recurrentes)) estado.recurrentes = parsed.recurrentes;
            if (parsed.metasPorMes && typeof parsed.metasPorMes === 'object') estado.metasPorMes = parsed.metasPorMes;
            if (parsed.usuarios && typeof parsed.usuarios === 'object') estado.usuarios = parsed.usuarios;
            if (parsed._borrados && typeof parsed._borrados === 'object') estado._borrados = parsed._borrados;
            return true;
        }
    } catch (e) {
        console.warn("No se pudo leer localStorage:", e);
    }
    return false;
}

// ==========================================================================
// Backend opcional + independencia total del servidor local
// La app es 100% autónoma: localStorage es la fuente de verdad.
// El servidor (server.js / /api/*) solo se usa si está disponible, en segundo
// plano y sin bloquear nunca la interfaz. Funciona igual con o sin conexión,
// en file://, en hosting estático o con el backend apagado.
// ==========================================================================
let backendDisponible = null; // null=sin probar, true=hay servidor, false=modo 100% local

function esModoPortable() {
    try {
        if (typeof window !== 'undefined' && window.__MODO_PORTABLE__) return true;
        const p = window.location.protocol;
        if (p === 'file:' || p === 'content:' || p === 'app:') return true;
    } catch (e) {}
    return false;
}

function debeIntentarBackend() {
    if (esModoPortable()) return false;
    if (backendDisponible === false) return false;
    try {
        if (!window.navigator.onLine) return false;
    } catch (e) {}
    return true;
}

function actualizarIndicadorModo() {
    try { if (typeof NUBE_hogarVinculado === 'function' && NUBE_hogarVinculado()) return; } catch (e) {}
    try {
        const el = document.getElementById('modoBadge');
        if (!el) return;
        if (backendDisponible === true) {
            el.textContent = '● Conectado al servidor';
            el.dataset.modo = 'server';
        } else if (backendDisponible === false) {
            el.textContent = '● Modo local (autónomo)';
            el.dataset.modo = 'local';
        } else {
            el.textContent = '● Modo local';
            el.dataset.modo = 'local';
        }
    } catch (e) {}
}

// Envío opcional a servidor si está disponible (nunca bloquea ni lanza errores)
async function api(endpoint, method = 'GET', body = null) {
    if (!debeIntentarBackend()) return null;
    try {
        const controller = new AbortController();
        const t = setTimeout(() => controller.abort(), 2500);
        const options = { method, headers: { 'Content-Type': 'application/json' }, signal: controller.signal };
        if (body) options.body = JSON.stringify(body);
        const response = await fetch(endpoint, options);
        clearTimeout(t);
        if (!response.ok) {
            // Un 404 en hosting estático significa "no hay backend": memorizarlo
            if (response.status === 404) backendDisponible = false;
            return null;
        }
        // Marcar backend como disponible tras la primera respuesta válida
        if (backendDisponible !== true && endpoint === '/api/datos') {
            backendDisponible = true;
            actualizarIndicadorModo();
        }
        try { return await response.json(); } catch (e) { return null; }
    } catch (error) {
        // En modo local-first / offline / file://, los fallos son esperados y silenciosos
        return null;
    }
}

function fusionarPorId(local, remoto) {
    const mapa = new Map();
    (local || []).forEach(x => { if (x && x.id !== undefined) mapa.set(String(x.id), x); });
    (remoto || []).forEach(x => { if (x && x.id !== undefined && !mapa.has(String(x.id))) mapa.set(String(x.id), x); });
    // Conservar también elementos sin id (compatibilidad con datos antiguos)
    (local || []).forEach(x => { if (!x || x.id === undefined) mapa.set('local-' + Math.random(), x); });
    return Array.from(mapa.values());
}

async function probarBackendEnFondo() {
    if (!debeIntentarBackend()) {
        if (backendDisponible === null && esModoPortable()) backendDisponible = false;
        actualizarIndicadorModo();
        return;
    }
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
        const res = await fetch('/api/datos', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (!res.ok) {
            // No hay backend (hosting estático): quedarse 100% en local, sin reintentos ruidosos
            backendDisponible = false;
            actualizarIndicadorModo();
            return;
        }
        let datos = null;
        try { datos = await res.json(); } catch (e) { datos = null; }
        if (!datos || !Array.isArray(datos.transacciones)) {
            backendDisponible = false;
            actualizarIndicadorModo();
            return;
        }
        backendDisponible = true;
        // Fusión sin pérdida: lo local manda, solo se añaden novedades del servidor
        const antes = JSON.stringify({ t: estado.transacciones.length, r: estado.recurrentes.length });
        estado.transacciones = fusionarPorId(estado.transacciones, datos.transacciones);
        estado.recurrentes = fusionarPorId(estado.recurrentes, datos.recurrentes || []);
        estado.metasPorMes = Object.assign({}, datos.metasPorMes || {}, estado.metasPorMes);
        estado.usuarios = Object.assign({}, datos.usuarios || {}, estado.usuarios);
        const despues = JSON.stringify({ t: estado.transacciones.length, r: estado.recurrentes.length });
        if (antes !== despues) {
            guardarLocalmente();
            inicializarSelectorMeses();
            actualizarVistas();
        }
        actualizarIndicadorModo();
    } catch (e) {
        // Sin servidor / sin red: seguir en local sin molestar al usuario
        if (backendDisponible === null) backendDisponible = false;
        actualizarIndicadorModo();
    }
}

async function cargarDatosServidor() {
    // 1. LOCAL PRIMERO: render inmediato, sin esperar red. Independiente del servidor.
    const tieneLocal = cargarLocalmente();
    if (!tieneLocal) {
        // Inicializar con la base de datos rica por defecto
        estado.transacciones = JSON.parse(JSON.stringify(DATOS_INICIALES.transacciones));
        estado.recurrentes = JSON.parse(JSON.stringify(DATOS_INICIALES.recurrentes));
        estado.metasPorMes = JSON.parse(JSON.stringify(DATOS_INICIALES.metasPorMes));
        estado.usuarios = JSON.parse(JSON.stringify(DATOS_INICIALES.usuarios));
        guardarLocalmente();
    }

    inicializarSelectorMeses();
    actualizarVistas();
    actualizarIndicadorModo();

    // 2. Backend OPCIONAL en segundo plano (no bloquea, no sobrescribe, no es requisito)
    try {
        if ('requestIdleCallback' in window) requestIdleCallback(() => probarBackendEnFondo());
        else setTimeout(() => probarBackendEnFondo(), 800);
    } catch (e) {
        setTimeout(() => probarBackendEnFondo(), 800);
    }
    // Reintentar la detección al volver la conexión, por si el servidor aparece después
    try {
        window.addEventListener('online', () => {
            if (backendDisponible === false && !esModoPortable()) {
                backendDisponible = null;
                probarBackendEnFondo();
            }
        });
    } catch (e) {}
}

// ==========================================================================
// Inicialización y Control de Navegación
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    cargarSelectCategorias();
    cargarDatosServidor();
    inicializarPWA();
});

function initTheme() {
    const savedTheme = localStorage.getItem('gestor_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-mode');
        document.getElementById('themeIcon').textContent = '☀️';
    } else {
        document.body.classList.remove('dark-mode');
        document.getElementById('themeIcon').textContent = '🌙';
    }
}

function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('gestor_theme', isDark ? 'dark' : 'light');
    document.getElementById('themeIcon').textContent = isDark ? '☀️' : '🌙';
    renderCharts();
}

function cambiarTab(tabId) {
    estado.tabActiva = tabId;
    document.querySelectorAll('.tab-btn').forEach((btn, idx) => {
        const tabs = ['resumen', 'calendario', 'recurrentes', 'split', 'ajustes'];
        btn.classList.toggle('active', tabs[idx] === tabId);
    });

    document.querySelectorAll('.tab-content').forEach(section => {
        section.classList.remove('active');
    });

    const target = document.getElementById(`tab-${tabId}`);
    if (target) target.classList.add('active');
    try {
        if (typeof window !== 'undefined' && window.innerWidth <= 680) {
            var __nav = document.querySelector('.tabs-nav');
            if (__nav && __nav.getBoundingClientRect().top < 0) __nav.scrollIntoView();
        }
    } catch (e) {}

    if (tabId === 'calendario') {
        renderCalendario();
    } else if (tabId === 'recurrentes') {
        renderRecurrentes();
    } else if (tabId === 'split') {
        renderSplit();
    }
}

// ==========================================================================
// Gestión de Meses
// ==========================================================================

function claveMesActual() {
    const h = new Date();
    return h.getFullYear() + '-' + String(h.getMonth() + 1).padStart(2, '0');
}
function calendarioMesActual() {
    const h = new Date();
    return { anio: h.getFullYear(), mes: h.getMonth() };
}
function fechaHoyISO() {
    const h = new Date();
    return h.getFullYear() + '-' + String(h.getMonth() + 1).padStart(2, '0') + '-' + String(h.getDate()).padStart(2, '0');
}
function inicializarSelectorMeses() {
    const select = document.getElementById('globalMonthSelect');
    if (!select) return;

    const mesesSet = new Set();
    const h = new Date();
    for (let i = 0; i < 12; i++) {
        const d = new Date(h.getFullYear(), h.getMonth() - i, 1);
        mesesSet.add(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'));
    }

    estado.transacciones.forEach(t => {
        if (t.fecha) {
            mesesSet.add(t.fecha.substring(0, 7));
        }
    });

    const mesesOrdenados = Array.from(mesesSet).sort().reverse();
    select.innerHTML = '';

    const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    mesesOrdenados.forEach(claveMes => {
        const [anio, mesNum] = claveMes.split('-').map(Number);
        const opt = document.createElement('option');
        opt.value = claveMes;
        opt.textContent = `${nombresMeses[mesNum - 1]} ${anio}`;
        if (claveMes === estado.mesSeleccionado) opt.selected = true;
        select.appendChild(opt);
    });
}

function seleccionarMes(nuevoMes) {
    estado.mesSeleccionado = nuevoMes;
    const [anio, mesNum] = nuevoMes.split('-').map(Number);
    estado.mesCalendario = { anio, mes: mesNum - 1 };
    actualizarVistas();
}

function navegarMes(delta) {
    const select = document.getElementById('globalMonthSelect');
    if (!select) return;
    const currentIndex = select.selectedIndex;
    const newIndex = currentIndex - delta;
    if (newIndex >= 0 && newIndex < select.options.length) {
        select.selectedIndex = newIndex;
        seleccionarMes(select.value);
    }
}

// ==========================================================================
// Cálculo de Operaciones y Métricas
// ==========================================================================

function obtenerOperacionesMes(anio, mesNum1Indexed) {
    const ops = [];

    estado.transacciones.forEach(t => {
        const d = new Date(t.fecha);
        if (d.getFullYear() === anio && (d.getMonth() + 1) === mesNum1Indexed) {
            ops.push(t);
        }
    });

    estado.recurrentes.forEach(r => {
        if (r.activo !== false) {
            const fechaFijo = new Date(anio, mesNum1Indexed - 1, r.dia, 12, 0, 0);
            ops.push({
                id: `rec-${r.id}`,
                telefono: "Fijo",
                tipo: r.tipo || "gasto",
                concepto: r.concepto,
                categoria: r.categoria || "Vivienda",
                cantidad: r.cantidad,
                esCompartido: true,
                esFijo: true,
                fecha: fechaFijo.toISOString()
            });
        }
    });

    return ops;
}

function actualizarVistas() {
    renderHeroAndKpis();
    renderMetaAhorro();
    renderSpikeBanner();
    renderCharts();
    renderTransacciones();
    renderCalendario();
    renderRecurrentes();
    renderSplit();
}

// ==========================================================================
// Renderizador: Hero Balance y KPIs
// ==========================================================================

function renderHeroAndKpis() {
    const [anio, mesNum] = estado.mesSeleccionado.split('-').map(Number);
    const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    document.getElementById('lblHeroMonth').textContent = `${nombresMeses[mesNum - 1]} ${anio}`;
    document.getElementById('lblKpiAnio').textContent = anio;

    const opsMes = obtenerOperacionesMes(anio, mesNum);
    let totalIngresos = 0;
    let totalGastos = 0;

    opsMes.forEach(op => {
        if (op.tipo === 'ingreso') totalIngresos += op.cantidad;
        else totalGastos += op.cantidad;
    });

    const balance = totalIngresos - totalGastos;
    const elBalance = document.getElementById('valHeroBalance');
    elBalance.textContent = balance.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    
    document.getElementById('valHeroIngresos').textContent = `+${totalIngresos.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
    document.getElementById('valHeroGastos').textContent = `-${totalGastos.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

    // Ahorro Anual Acumulado
    let totalIngresosAnio = 0;
    let totalGastosAnio = 0;
    for (let m = 1; m <= 12; m++) {
        const opsM = obtenerOperacionesMes(anio, m);
        opsM.forEach(op => {
            if (op.tipo === 'ingreso') totalIngresosAnio += op.cantidad;
            else totalGastosAnio += op.cantidad;
        });
    }
    const ahorroAnual = totalIngresosAnio - totalGastosAnio;
    const elKpiAhorro = document.getElementById('valKpiAhorroAnual');
    elKpiAhorro.textContent = `${ahorroAnual.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
    elKpiAhorro.style.color = ahorroAnual >= 0 ? 'var(--success)' : 'var(--danger)';

    // Medias 12 Meses
    let sumaIngresos12m = 0;
    let sumaGastos12m = 0;
    let mesesContados = 0;

    const cursorFecha = new Date(anio, mesNum - 1, 1);
    for (let i = 0; i < 12; i++) {
        const a = cursorFecha.getFullYear();
        const m = cursorFecha.getMonth() + 1;
        const ops = obtenerOperacionesMes(a, m);
        if (ops.length > 0) {
            mesesContados++;
            ops.forEach(op => {
                if (op.tipo === 'ingreso') sumaIngresos12m += op.cantidad;
                else sumaGastos12m += op.cantidad;
            });
        }
        cursorFecha.setMonth(cursorFecha.getMonth() - 1);
    }

    const divisor = mesesContados > 0 ? mesesContados : 1;
    document.getElementById('valKpiMediaIngresos').textContent = `${(sumaIngresos12m / divisor).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
    document.getElementById('valKpiMediaGastos').textContent = `${(sumaGastos12m / divisor).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;

    // Total de Gastos Fijos
    let totalFijos = 0;
    let countFijos = 0;
    estado.recurrentes.forEach(r => {
        if (r.tipo === 'gasto' && r.activo !== false) {
            totalFijos += r.cantidad;
            countFijos++;
        }
    });
    document.getElementById('valKpiFijosTotal').textContent = `${totalFijos.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
    document.getElementById('lblKpiFijosCount').textContent = `${countFijos} conceptos al mes`;
    document.getElementById('badgeRecurrentesCount').textContent = estado.recurrentes.length;
}

// ==========================================================================
// Renderizador: Meta de Ahorro y Plan de Prorrateo
// ==========================================================================

function renderMetaAhorro() {
    const metaGuardada = estado.metasPorMes[estado.mesSeleccionado];
    const tieneMeta = metaGuardada !== undefined && metaGuardada > 0;
    const meta = tieneMeta ? metaGuardada : 0;
    document.getElementById('inputMetaAhorro').value = tieneMeta ? meta : '';

    const [anio, mesNum] = estado.mesSeleccionado.split('-').map(Number);
    const ops = obtenerOperacionesMes(anio, mesNum);
    let totalIng = 0;
    let totalGas = 0;
    ops.forEach(t => {
        if (t.tipo === 'ingreso') totalIng += t.cantidad;
        else totalGas += t.cantidad;
    });

    const balanceActual = totalIng - totalGas;
    const progressEl = document.getElementById('progressMetaFill');
    const lblAhorrado = document.getElementById('lblMetaAhorrado');
    const lblPorcentaje = document.getElementById('lblMetaPorcentaje');
    const bannerCelebracion = document.getElementById('bannerCelebracion');
    const bannerDeficit = document.getElementById('bannerDeficit');

    if (!tieneMeta) {
        progressEl.style.width = '0%';
        progressEl.classList.remove('overachieved');
        lblAhorrado.textContent = `Ahorro del mes: ${balanceActual.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € · fija tu meta arriba`;
        lblPorcentaje.textContent = 'Sin meta fijada';
        bannerCelebracion.style.display = 'none';
        bannerDeficit.style.display = 'none';
        return;
    }

    const porcentaje = meta > 0 ? Math.max(0, Math.round((balanceActual / meta) * 100)) : 100;
    progressEl.style.width = `${Math.min(100, Math.max(0, porcentaje))}%`;
    progressEl.classList.toggle('overachieved', balanceActual >= meta);

    lblAhorrado.textContent = `Ahorro conseguido: ${balanceActual.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € / ${meta} €`;
    lblPorcentaje.textContent = `${porcentaje}% del objetivo`;

    if (balanceActual >= meta) {
        bannerCelebracion.style.display = 'block';
        bannerDeficit.style.display = 'none';
    } else {
        bannerCelebracion.style.display = 'none';
        bannerDeficit.style.display = 'block';
        const deficit = meta - balanceActual;
        document.getElementById('lblDeficitImporte').textContent = `${deficit.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`;
        actualizarCalculoProrrateo();
    }
}

function actualizarCalculoProrrateo() {
    const meta = parseFloat(document.getElementById('inputMetaAhorro').value);
    if (isNaN(meta) || meta <= 0) {
        document.getElementById('lblProrrateoDetalle').innerHTML = 'Fija primero una meta válida para calcular el plan de recuperación.';
        return;
    }
    const [anio, mesNum] = estado.mesSeleccionado.split('-').map(Number);
    const ops = obtenerOperacionesMes(anio, mesNum);
    let totalIng = 0;
    let totalGas = 0;
    ops.forEach(t => {
        if (t.tipo === 'ingreso') totalIng += t.cantidad;
        else totalGas += t.cantidad;
    });
    const balance = totalIng - totalGas;
    const deficit = meta - balance;

    const meses = parseInt(document.getElementById('selectMesesProrrateo').value) || 6;
    const cuotaExtra = deficit / meses;
    const nuevaMetaSugerida = meta + cuotaExtra;

    document.getElementById('lblProrrateoDetalle').innerHTML = 
        `💡 Para absorber el desfase en <strong>${meses} meses</strong>, sugerimos sumar <strong>+${cuotaExtra.toFixed(2)} €/mes</strong> a vuestras metas futuras (total: <strong>${nuevaMetaSugerida.toFixed(2)} €/mes</strong>).`;
}

async function aplicarPlanProrrateo() {
    const meta = parseFloat(document.getElementById('inputMetaAhorro').value);
    if (isNaN(meta) || meta <= 0) {
        mostrarToast('Fija primero una meta válida', 'danger');
        return;
    }
    const [anio, mesNum] = estado.mesSeleccionado.split('-').map(Number);
    const ops = obtenerOperacionesMes(anio, mesNum);
    let totalIng = 0, totalGas = 0;
    ops.forEach(t => t.tipo === 'ingreso' ? totalIng += t.cantidad : totalGas += t.cantidad);
    const deficit = meta - (totalIng - totalGas);

    const meses = parseInt(document.getElementById('selectMesesProrrateo').value) || 6;
    const cuotaExtra = deficit / meses;
    const nuevaMeta = Math.round(meta + cuotaExtra);

    const metasActualizadas = {};
    let cursorAnio = anio;
    let cursorMes = mesNum;

    for (let i = 1; i <= meses; i++) {
        cursorMes++;
        if (cursorMes > 12) {
            cursorMes = 1;
            cursorAnio++;
        }
        const clave = `${cursorAnio}-${String(cursorMes).padStart(2, '0')}`;
        metasActualizadas[clave] = nuevaMeta;
        estado.metasPorMes[clave] = nuevaMeta;
    }

    guardarLocalmente();
    api('/api/metas-lote', 'POST', { metas: metasActualizadas }).catch(() => {});
    mostrarToast(`¡Plan aplicado! Nueva meta de ${nuevaMeta} € fijada para los próximos ${meses} meses.`, 'success');
    renderMetaAhorro();
}

async function guardarMetaAhorro() {
    const nuevaMeta = parseFloat(document.getElementById('inputMetaAhorro').value);
    if (isNaN(nuevaMeta) || nuevaMeta <= 0) {
        mostrarToast('Introduce una meta mayor que 0', 'danger');
        return;
    }

    estado.metasPorMes[estado.mesSeleccionado] = nuevaMeta;
    guardarLocalmente();
    api('/api/meta', 'POST', { mes: estado.mesSeleccionado, meta: nuevaMeta }).catch(() => {});
    mostrarToast('Meta de ahorro actualizada', 'success');
    renderMetaAhorro();
}

// ==========================================================================
// Banner Inteligente: Pico de Gasto
// ==========================================================================

function renderSpikeBanner() {
    const [anio, mesNum] = estado.mesSeleccionado.split('-').map(Number);
    const opsActuales = obtenerOperacionesMes(anio, mesNum);

    let mesAnt = mesNum - 1;
    let anioAnt = anio;
    if (mesAnt === 0) { mesAnt = 12; anioAnt--; }
    const opsAnteriores = obtenerOperacionesMes(anioAnt, mesAnt);

    const gastosCatActual = {};
    opsActuales.forEach(op => {
        if (op.tipo === 'gasto') {
            gastosCatActual[op.categoria] = (gastosCatActual[op.categoria] || 0) + op.cantidad;
        }
    });

    const gastosCatAnterior = {};
    opsAnteriores.forEach(op => {
        if (op.tipo === 'gasto') {
            gastosCatAnterior[op.categoria] = (gastosCatAnterior[op.categoria] || 0) + op.cantidad;
        }
    });

    let catMayorDiff = null;
    let maxDiff = 0;

    for (const [cat, gastado] of Object.entries(gastosCatActual)) {
        const gastadoAnt = gastosCatAnterior[cat] || 0;
        const diff = gastado - gastadoAnt;
        if (diff > maxDiff && diff >= 40) {
            maxDiff = diff;
            catMayorDiff = cat;
        }
    }

    const bannerSpike = document.getElementById('bannerSpike');
    if (catMayorDiff) {
        bannerSpike.style.display = 'block';
        const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        document.getElementById('lblSpikeTexto').innerHTML = 
            `En <strong>"${catMayorDiff}"</strong> habéis gastado <strong>${gastosCatActual[catMayorDiff].toFixed(2)} €</strong> (+${maxDiff.toFixed(2)} € más que en ${nombresMeses[mesAnt - 1]}).`;
    } else {
        bannerSpike.style.display = 'none';
    }
}

// ==========================================================================
// Gráficos Interactivos con SVG Nativo
// ==========================================================================

function renderCharts() {
    const [anio, mesNum] = estado.mesSeleccionado.split('-').map(Number);
    const ops = obtenerOperacionesMes(anio, mesNum);

    // 1. Gráfico de Dona: Gastos por Categoría
    const gastosCat = {};
    let totalGastos = 0;

    ops.forEach(op => {
        if (op.tipo === 'gasto') {
            gastosCat[op.categoria] = (gastosCat[op.categoria] || 0) + op.cantidad;
            totalGastos += op.cantidad;
        }
    });

    document.getElementById('lblTotalGastosCat').textContent = `Total: ${totalGastos.toFixed(2)} €`;

    const containerDonut = document.getElementById('containerChartCategorias');
    const containerLegend = document.getElementById('legendCategoriasList');
    containerLegend.innerHTML = '';

    if (totalGastos === 0) {
        containerDonut.innerHTML = `<div style="color: var(--text-muted); font-size: 0.88rem; text-align: center; padding: 40px;">Sin gastos registrados en este mes</div>`;
    } else {
        const sortedCats = Object.entries(gastosCat).sort((a, b) => b[1] - a[1]);
        const radius = 60;
        const circumference = 2 * Math.PI * radius;
        let accumulatedDash = 0;
        let svgPaths = '';

        sortedCats.forEach(([cat, amount]) => {
            const percent = amount / totalGastos;
            const strokeDash = percent * circumference;
            const strokeOffset = -accumulatedDash;
            accumulatedDash += strokeDash;

            const config = CATEGORIAS_CONFIG[cat] || { icon: "📁", color: "#94a3b8" };
            svgPaths += `
                <circle cx="80" cy="80" r="${radius}" fill="transparent" 
                    stroke="${config.color}" stroke-width="24"
                    stroke-dasharray="${strokeDash} ${circumference}"
                    stroke-dashoffset="${strokeOffset}"
                    stroke-linecap="round"
                    style="transition: stroke-width 0.2s;"
                >
                    <title>${cat}: ${amount.toFixed(2)} € (${(percent * 100).toFixed(1)}%)</title>
                </circle>
            `;

            containerLegend.innerHTML += `
                <div class="legend-item">
                    <div style="display: flex; align-items: center;">
                        <span class="legend-color-dot" style="background: ${config.color};"></span>
                        <span>${config.icon} ${cat}</span>
                    </div>
                    <div>
                        <strong>${amount.toFixed(2)} €</strong> 
                        <small style="color: var(--text-muted); margin-left: 4px;">(${(percent * 100).toFixed(0)}%)</small>
                    </div>
                </div>
            `;
        });

        containerDonut.innerHTML = `
            <svg viewBox="0 0 160 160" width="180" height="180" style="transform: rotate(-90deg); filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));">
                ${svgPaths}
            </svg>
            <div style="position: absolute; text-align: center; pointer-events: none;">
                <span style="font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Gastos</span>
                <div style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary);">${Math.round(totalGastos)} €</div>
            </div>
        `;
    }

    // 2. Gráfico de Barras: Evolución Temporal
    const containerEvol = document.getElementById('containerChartEvolucion');
    const ultimosMeses = [];
    const fechaCursor = new Date(anio, mesNum - 1, 1);

    for (let i = 0; i < 6; i++) {
        const a = fechaCursor.getFullYear();
        const m = fechaCursor.getMonth() + 1;
        const opsM = obtenerOperacionesMes(a, m);
        let ingM = 0;
        let gasM = 0;
        opsM.forEach(op => op.tipo === 'ingreso' ? ingM += op.cantidad : gasM += op.cantidad);

        const nombresCortos = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        ultimosMeses.unshift({
            etiqueta: nombresCortos[m - 1],
            clave: `${a}-${String(m).padStart(2, '0')}`,
            ingresos: ingM,
            gastos: gasM
        });
        fechaCursor.setMonth(fechaCursor.getMonth() - 1);
    }

    let maxVal = 1000;
    ultimosMeses.forEach(m => {
        if (m.ingresos > maxVal) maxVal = m.ingresos;
        if (m.gastos > maxVal) maxVal = m.gastos;
    });

    const svgWidth = 320;
    const svgHeight = 160;
    const barWidth = 14;
    const groupWidth = svgWidth / ultimosMeses.length;
    let barsHtml = '';

    ultimosMeses.forEach((m, idx) => {
        const xGroup = idx * groupWidth + (groupWidth - (barWidth * 2 + 4)) / 2;
        const hIng = Math.max(4, (m.ingresos / maxVal) * (svgHeight - 40));
        const hGas = Math.max(4, (m.gastos / maxVal) * (svgHeight - 40));
        const yIng = svgHeight - 25 - hIng;
        const yGas = svgHeight - 25 - hGas;
        const isCurrent = m.clave === estado.mesSeleccionado;

        barsHtml += `
            <g class="bar-group" style="cursor: pointer;" onclick="seleccionarMes('${m.clave}')">
                <title>${m.etiqueta}: Ingresos ${m.ingresos.toFixed(2)}€ | Gastos ${m.gastos.toFixed(2)}€</title>
                <rect x="${xGroup}" y="${yIng}" width="${barWidth}" height="${hIng}" rx="4" fill="var(--success)" opacity="${isCurrent ? '1' : '0.8'}"/>
                <rect x="${xGroup + barWidth + 4}" y="${yGas}" width="${barWidth}" height="${hGas}" rx="4" fill="var(--danger)" opacity="${isCurrent ? '1' : '0.8'}"/>
                <text x="${xGroup + barWidth}" y="${svgHeight - 8}" text-anchor="middle" font-size="11" font-weight="${isCurrent ? '800' : '600'}" fill="${isCurrent ? 'var(--primary)' : 'var(--text-secondary)'}">
                    ${m.etiqueta}
                </text>
            </g>
        `;
    });

    containerEvol.innerHTML = `
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="180">
            <line x1="10" y1="${svgHeight - 25}" x2="${svgWidth - 10}" y2="${svgHeight - 25}" stroke="var(--border-color)" stroke-width="1"/>
            <line x1="10" y1="${svgHeight - 25 - (svgHeight - 40) / 2}" x2="${svgWidth - 10}" y2="${svgHeight - 25 - (svgHeight - 40) / 2}" stroke="var(--border-color)" stroke-dasharray="4 4" stroke-width="1"/>
            ${barsHtml}
        </svg>
    `;
}

// ==========================================================================
// Renderizador: Listado de Transacciones
// ==========================================================================

function filtrarTransacciones() {
    estado.filtros.busqueda = document.getElementById('inputSearchTx').value.toLowerCase().trim();
    estado.filtros.tipo = document.getElementById('filterTipo').value;
    estado.filtros.categoria = document.getElementById('filterCategoria').value;
    estado.filtros.usuario = document.getElementById('filterUsuario').value;
    renderTransacciones();
}

function renderTransacciones() {
    const [anio, mesNum] = estado.mesSeleccionado.split('-').map(Number);
    const todasOps = obtenerOperacionesMes(anio, mesNum);
    const container = document.getElementById('txListContainer');
    const counterEl = document.getElementById('lblTxCounter');

    const filtradas = todasOps.filter(t => {
        if (estado.filtros.busqueda && !t.concepto.toLowerCase().includes(estado.filtros.busqueda)) return false;
        if (estado.filtros.tipo === 'gasto' && t.tipo !== 'gasto') return false;
        if (estado.filtros.tipo === 'ingreso' && t.tipo !== 'ingreso') return false;
        if (estado.filtros.tipo === 'compartido' && !t.esCompartido) return false;
        if (estado.filtros.categoria !== 'todas' && t.categoria !== estado.filtros.categoria) return false;
        if (estado.filtros.usuario !== 'todos' && t.telefono !== estado.filtros.usuario) return false;
        return true;
    });

    filtradas.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    counterEl.textContent = `Mostrando ${filtradas.length} de ${todasOps.length} movimientos`;
    container.innerHTML = '';

    if (filtradas.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px; color: var(--text-muted);">
                <span style="font-size: 2rem; display: block; margin-bottom: 8px;">🔍</span>
                <p>No se han encontrado movimientos con los filtros seleccionados.</p>
            </div>
        `;
        return;
    }

    filtradas.forEach(t => {
        const catConfig = CATEGORIAS_CONFIG[t.categoria] || { icon: "📁", color: "#94a3b8" };
        const nombreUsuario = estado.usuarios[t.telefono] || t.telefono;
        const fechaFormat = new Date(t.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
        const esIngreso = t.tipo === 'ingreso';

        const row = document.createElement('div');
        row.className = 'transaction-item';

        row.innerHTML = `
            <div class="tx-left">
                <div class="tx-cat-icon" style="background: ${catConfig.color}15; color: ${catConfig.color};">
                    ${catConfig.icon}
                </div>
                <div class="tx-meta">
                    <div class="tx-title">${t.concepto}</div>
                    <div class="tx-badges-row">
                        <span class="pill-tag pill-user">📅 ${fechaFormat}</span>
                        <span class="pill-tag pill-user">👤 ${nombreUsuario}</span>
                        <span class="pill-tag" style="background: ${catConfig.color}15; color: ${catConfig.color};">${t.categoria}</span>
                        ${t.esCompartido ? '<span class="pill-tag pill-shared">👥 Compartido</span>' : ''}
                        ${t.esFijo ? '<span class="pill-tag pill-recurring">📌 Fijo Periódico</span>' : ''}
                    </div>
                </div>
            </div>
            <div class="tx-right">
                <div class="tx-amount ${esIngreso ? 'ingreso' : 'gasto'}">
                    ${esIngreso ? '+' : '-'}${t.cantidad.toFixed(2)} €
                </div>
                <div class="tx-actions">
                    ${!t.esFijo ? `
                        <button class="btn-action-icon" title="Editar" onclick="editarOperacion(${t.id})">✏️</button>
                        <button class="btn-action-icon delete" title="Eliminar" onclick="confirmarEliminarOperacion(${t.id})">🗑️</button>
                    ` : `
                        <button class="btn-action-icon" title="Ver en Fijos" onclick="cambiarTab('recurrentes')">📌</button>
                    `}
                </div>
            </div>
        `;

        container.appendChild(row);
    });
}

// ==========================================================================
// Renderizador: Calendario Mensual
// ==========================================================================

function navegarMesCalendario(delta) {
    estado.mesCalendario.mes += delta;
    if (estado.mesCalendario.mes > 11) {
        estado.mesCalendario.mes = 0;
        estado.mesCalendario.anio++;
    } else if (estado.mesCalendario.mes < 0) {
        estado.mesCalendario.mes = 11;
        estado.mesCalendario.anio--;
    }
    renderCalendario();
}

function renderCalendario() {
    const anio = estado.mesCalendario.anio;
    const mes = estado.mesCalendario.mes;
    const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    
    document.getElementById('lblCalendarioTitle').textContent = `${nombresMeses[mes]} ${anio}`;

    const container = document.getElementById('calendarGridContainer');
    container.innerHTML = '';

    const diasSemana = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
    diasSemana.forEach(d => {
        const el = document.createElement('div');
        el.className = 'cal-day-header';
        el.textContent = d;
        container.appendChild(el);
    });

    let primerDiaIndex = new Date(anio, mes, 1).getDay();
    primerDiaIndex = primerDiaIndex === 0 ? 6 : primerDiaIndex - 1;
    const totalDias = new Date(anio, mes + 1, 0).getDate();

    for (let i = 0; i < primerDiaIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.className = 'cal-cell is-empty';
        container.appendChild(emptyCell);
    }

    const opsMes = obtenerOperacionesMes(anio, mes + 1);
    const transPorDia = {};
    opsMes.forEach(op => {
        const diaNum = new Date(op.fecha).getDate();
        if (!transPorDia[diaNum]) transPorDia[diaNum] = [];
        transPorDia[diaNum].push(op);
    });

    const hoy = new Date();
    const esMesActual = hoy.getFullYear() === anio && hoy.getMonth() === mes;

    for (let dia = 1; dia <= totalDias; dia++) {
        const transDia = transPorDia[dia] || [];
        const cell = document.createElement('div');
        cell.className = 'cal-cell';
        if (esMesActual && hoy.getDate() === dia) cell.classList.add('is-today');

        let badgesHtml = '';
        transDia.slice(0, 3).forEach(t => {
            const signo = t.tipo === 'ingreso' ? '+' : '-';
            const clase = t.esFijo ? 'cal-event-fijo' : (t.tipo === 'ingreso' ? 'cal-event-ingreso' : 'cal-event-gasto');
            badgesHtml += `
                <span class="cal-event-pill ${clase}" title="${t.concepto}: ${signo}${t.cantidad}€">
                    ${t.esFijo ? '📌 ' : ''}${t.concepto}: ${signo}${t.cantidad}€
                </span>
            `;
        });

        if (transDia.length > 3) {
            badgesHtml += `<span style="font-size: 0.6rem; color: var(--text-muted); font-weight: 700;">+${transDia.length - 3} más</span>`;
        }

        cell.innerHTML = `
            <div class="cal-cell-top">
                <span class="cal-day-number">${dia}</span>
                ${transDia.length > 0 ? `<span style="font-size: 0.65rem; font-weight: 700; color: var(--primary);">${transDia.length} op</span>` : ''}
            </div>
            <div class="cal-cell-badges">
                ${badgesHtml}
            </div>
        `;

        cell.onclick = () => abrirModalDia(dia, mes, anio, transDia);
        container.appendChild(cell);
    }
}

function abrirModalDia(dia, mes, anio, transacciones) {
    const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    document.getElementById('lblModalDiaFecha').textContent = `${dia} de ${nombresMeses[mes]} de ${anio}`;
    
    const container = document.getElementById('modalDiaListContainer');
    container.innerHTML = '';

    let totalDiaIng = 0;
    let totalDiaGas = 0;

    if (!transacciones || transacciones.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 24px; color: var(--text-muted);">
                <p>No hay operaciones registradas en este día.</p>
            </div>
        `;
    } else {
        transacciones.forEach(t => {
            if (t.tipo === 'ingreso') totalDiaIng += t.cantidad;
            else totalDiaGas += t.cantidad;

            const config = CATEGORIAS_CONFIG[t.categoria] || { icon: "📁", color: "#94a3b8" };
            container.innerHTML += `
                <div class="transaction-item" style="padding: 8px 10px;">
                    <div class="tx-left">
                        <span style="font-size: 1.2rem;">${config.icon}</span>
                        <div>
                            <strong>${t.concepto}</strong> ${t.esFijo ? '📌 [Fijo]' : ''}<br>
                            <small style="color: var(--text-muted);">${t.categoria} · ${estado.usuarios[t.telefono] || t.telefono}</small>
                        </div>
                    </div>
                    <div class="tx-amount ${t.tipo === 'ingreso' ? 'ingreso' : 'gasto'}">
                        ${t.tipo === 'ingreso' ? '+' : '-'}${t.cantidad.toFixed(2)} €
                    </div>
                </div>
            `;
        });

        container.innerHTML += `
            <div style="margin-top: 10px; padding: 10px; background: var(--bg-card-hover); border-radius: var(--radius-sm); font-size: 0.85rem; display: flex; justify-content: space-between;">
                <span>Balance del día:</span>
                <strong style="color: ${(totalDiaIng - totalDiaGas) >= 0 ? 'var(--success)' : 'var(--danger)'}">
                    ${(totalDiaIng - totalDiaGas) >= 0 ? '+' : ''}${(totalDiaIng - totalDiaGas).toFixed(2)} €
                </strong>
            </div>
        `;
    }

    const fechaISO = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
    document.getElementById('btnModalDiaAddOp').onclick = () => {
        cerrarModal('modalDiaDetalle');
        abrirModalOperacion({ fecha: fechaISO });
    };

    abrirModal('modalDiaDetalle');
}

// ==========================================================================
// Renderizador: Gastos e Ingresos Fijos (Recurrentes)
// ==========================================================================

function renderRecurrentes() {
    const container = document.getElementById('recurringGridContainer');
    container.innerHTML = '';

    let totalGastosFijos = 0;
    let totalIngresosFijos = 0;

    estado.recurrentes.forEach(r => {
        if (r.activo !== false) {
            if (r.tipo === 'ingreso') totalIngresosFijos += r.cantidad;
            else totalGastosFijos += r.cantidad;
        }

        const catConfig = CATEGORIAS_CONFIG[r.categoria] || { icon: "📁", color: "#94a3b8" };
        const card = document.createElement('div');
        card.className = 'recurring-card';

        card.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div class="tx-cat-icon" style="background: ${catConfig.color}15; color: ${catConfig.color};">
                    ${catConfig.icon}
                </div>
                <div>
                    <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-primary); margin-bottom: 2px;">
                        ${r.concepto}
                    </h4>
                    <span style="font-size: 0.78rem; color: var(--text-muted);">
                        Día ${r.dia} de cada mes · ${r.categoria}
                    </span>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 1.15rem; font-weight: 800; color: ${r.tipo === 'ingreso' ? 'var(--success)' : 'var(--danger)'};">
                    ${r.tipo === 'ingreso' ? '+' : '-'}${r.cantidad.toFixed(2)} €
                </div>
                <div style="margin-top: 4px; display: flex; gap: 6px; justify-content: flex-end;">
                    <button class="btn-action-icon" title="Editar" onclick="editarRecurrente(${r.id})">✏️</button>
                    <button class="btn-action-icon delete" title="Eliminar" onclick="eliminarRecurrente(${r.id})">🗑️</button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });

    document.getElementById('lblTotalFijosGastos').textContent = `${totalGastosFijos.toFixed(2)} €/mes`;
    document.getElementById('lblTotalFijosIngresos').textContent = `${totalIngresosFijos.toFixed(2)} €/mes`;
}

// ==========================================================================
// Renderizador: Reparto Familiar (Split & Múltiples Miembros)
// ==========================================================================

function renderSplit() {
    const [anio, mesNum] = estado.mesSeleccionado.split('-').map(Number);
    const ops = obtenerOperacionesMes(anio, mesNum);

    const compartidos = ops.filter(op => op.tipo === 'gasto' && op.esCompartido);
    const aportesPorUsuario = {};

    Object.keys(estado.usuarios).forEach(tel => {
        aportesPorUsuario[tel] = 0;
    });

    let totalGastoCompartido = 0;
    compartidos.forEach(op => {
        totalGastoCompartido += op.cantidad;
        const tel = op.telefono;
        aportesPorUsuario[tel] = (aportesPorUsuario[tel] || 0) + op.cantidad;
    });

    // Tarjetas de Miembros
    const containerMiembros = document.getElementById('splitMembersContainer');
    containerMiembros.innerHTML = '';

    const usuariosKeys = Object.keys(aportesPorUsuario);
    usuariosKeys.forEach(tel => {
        const pagado = aportesPorUsuario[tel];
        const porcentaje = totalGastoCompartido > 0 ? ((pagado / totalGastoCompartido) * 100).toFixed(1) : '0.0';
        const nombre = estado.usuarios[tel] || tel;

        containerMiembros.innerHTML += `
            <div class="split-member-card">
                <span style="font-size: 0.8rem; opacity: 0.8; text-transform: uppercase;">Aportación</span>
                <h3 style="font-size: 1.15rem; margin: 4px 0;">${nombre}</h3>
                <div style="font-size: 1.4rem; font-weight: 800; color: #e9d5ff;">${pagado.toFixed(2)} €</div>
                <small style="opacity: 0.8;">${porcentaje}% del total compartido</small>
            </div>
        `;
    });

    // Liquidación para N miembros
    const lblSettlement = document.getElementById('lblSettlementMessage');
    const N = usuariosKeys.length;

    if (N === 0 || totalGastoCompartido === 0) {
        lblSettlement.textContent = `Total compartido este mes: ${totalGastoCompartido.toFixed(2)} €. Registra gastos con la casilla "Gasto compartido" para calcular el balance.`;
    } else if (N === 2) {
        const u1 = usuariosKeys[0];
        const u2 = usuariosKeys[1];
        const p1 = aportesPorUsuario[u1];
        const p2 = aportesPorUsuario[u2];
        const nom1 = estado.usuarios[u1] || u1;
        const nom2 = estado.usuarios[u2] || u2;

        const mitad = totalGastoCompartido / 2;
        const dif = p1 - mitad;

        if (Math.abs(dif) < 0.5) {
            lblSettlement.innerHTML = `⚖️ <strong>Gastos al 50% equilibrados:</strong> Las aportaciones de ${nom1} y ${nom2} están compensadas este mes.`;
        } else if (dif > 0) {
            lblSettlement.innerHTML = `💸 <strong>${nom2}</strong> debe transferir <strong>${dif.toFixed(2)} €</strong> a <strong>${nom1}</strong> para equilibrar los gastos compartidos de este mes.`;
        } else {
            lblSettlement.innerHTML = `💸 <strong>${nom1}</strong> debe transferir <strong>${Math.abs(dif).toFixed(2)} €</strong> a <strong>${nom2}</strong> para equilibrar los gastos compartidos de este mes.`;
        }
    } else {
        const cuotaEquitativa = totalGastoCompartido / N;
        const deudores = [];
        const acreedores = [];

        usuariosKeys.forEach(tel => {
            const saldo = aportesPorUsuario[tel] - cuotaEquitativa;
            const nombre = estado.usuarios[tel] || tel;
            if (saldo < -0.01) deudores.push({ tel, nombre, debe: -saldo });
            else if (saldo > 0.01) acreedores.push({ tel, nombre, cobra: saldo });
        });

        if (deudores.length === 0) {
            lblSettlement.innerHTML = `⚖️ <strong>Gastos perfectamente equilibrados:</strong> Todos los miembros (${N}) han aportado su cuota (${cuotaEquitativa.toFixed(2)} € por persona).`;
        } else {
            const transferencias = [];
            let i = 0, j = 0;
            while (i < deudores.length && j < acreedores.length) {
                const d = deudores[i];
                const a = acreedores[j];
                const cantidad = Math.min(d.debe, a.cobra);

                if (cantidad > 0.01) {
                    transferencias.push(`💸 <strong>${d.nombre}</strong> debe transferir <strong>${cantidad.toFixed(2)} €</strong> a <strong>${a.nombre}</strong>`);
                }

                d.debe -= cantidad;
                a.cobra -= cantidad;

                if (d.debe <= 0.01) i++;
                if (a.cobra <= 0.01) j++;
            }

            lblSettlement.innerHTML = `
                <div>
                    ⚖️ <strong>Cuota equitativa:</strong> ${cuotaEquitativa.toFixed(2)} € por miembro (${N} miembros).
                    <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 4px;">
                        ${transferencias.join('')}
                    </div>
                </div>
            `;
        }
    }

    // Directorio de Miembros
    const dirContainer = document.getElementById('usersDirectoryContainer');
    dirContainer.innerHTML = '';
    Object.entries(estado.usuarios).forEach(([tel, nombre]) => {
        dirContainer.innerHTML += `
            <div style="display: flex; gap: 10px; align-items: center; background: var(--bg-card-hover); padding: 10px 14px; border-radius: var(--radius-md); flex-wrap: wrap;">
                <span style="font-weight: 700; color: var(--primary); min-width: 120px;">📱 ${tel}</span>
                <input type="text" value="${nombre}" id="nameInput_${tel}" class="form-control" style="flex: 1; min-width: 140px; padding: 6px 10px; font-size: 0.88rem;" placeholder="Nombre...">
                <div style="display: flex; gap: 6px;">
                    <button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem;" onclick="guardarNombreUsuario('${tel}')">💾 Guardar</button>
                    <button class="btn btn-outline" style="padding: 6px 10px; font-size: 0.8rem; color: var(--danger); border-color: var(--danger-light);" title="Eliminar miembro" onclick="eliminarUsuario('${tel}')">🗑️</button>
                </div>
            </div>
        `;
    });
}

// Añadir nuevo teléfono / miembro
async function agregarNuevoUsuario(e) {
    e.preventDefault();
    const telInput = document.getElementById('newTelInput');
    const nameInput = document.getElementById('newNameInput');
    const telefono = telInput.value.trim();
    const nombre = nameInput.value.trim();

    if (!telefono || !nombre) {
        mostrarToast('Por favor, indica teléfono y nombre', 'danger');
        return;
    }

    if (estado.usuarios[telefono]) {
        mostrarToast('Este número de teléfono ya está registrado', 'danger');
        return;
    }

    estado.usuarios[telefono] = nombre;
    guardarLocalmente();
    api('/api/usuarios', 'POST', { telefono, nombre }).catch(() => {});

    telInput.value = '';
    nameInput.value = '';
    mostrarToast(`¡Miembro "${nombre}" añadido con éxito!`, 'success');
    actualizarSelectUsuarios();
    actualizarVistas();
}

// Eliminar teléfono / miembro
async function eliminarUsuario(telefono) {
    // Se permite quedar a cero (inicio limpio para nuevos usuarios).
    const nombre = estado.usuarios[telefono] || telefono;
    if (confirm(`¿Seguro que deseas eliminar a "${nombre}" (${telefono}) del reparto familiar?`)) {
        delete estado.usuarios[telefono];
        try { if (typeof NUBE_marcarBorrado === 'function') NUBE_marcarBorrado('usr', telefono); } catch (e) {}
        guardarLocalmente();
        api(`/api/usuarios/${telefono}`, 'DELETE').catch(() => {});

        mostrarToast(`Miembro "${nombre}" eliminado`, 'info');
        actualizarSelectUsuarios();
        actualizarVistas();
    }
}

async function guardarNombreUsuario(telefono) {
    const input = document.getElementById(`nameInput_${telefono}`);
    if (!input) return;
    const nuevoNombre = input.value.trim();
    if (!nuevoNombre) return;

    estado.usuarios[telefono] = nuevoNombre;
    guardarLocalmente();
    api('/api/usuarios', 'POST', { telefono, nombre: nuevoNombre }).catch(() => {});

    mostrarToast('Nombre actualizado correctamente', 'success');
    actualizarSelectUsuarios();
    actualizarVistas();
}

function registrarLiquidacion() {
    mostrarToast('¡Ajuste anotado! Los miembros han saldado su deuda.', 'success');
}

// ==========================================================================
// Formularios y Gestión de Modales
// ==========================================================================

function cargarSelectCategorias() {
    const selectOp = document.getElementById('opCategoria');
    const selectFiltro = document.getElementById('filterCategoria');
    const selectRec = document.getElementById('recCategoria');

    selectOp.innerHTML = '';
    selectRec.innerHTML = '';
    selectFiltro.innerHTML = '<option value="todas">Todas las Categorías</option>';

    Object.entries(CATEGORIAS_CONFIG).forEach(([nombre, conf]) => {
        const opt = `<option value="${nombre}">${conf.icon} ${nombre}</option>`;
        selectOp.innerHTML += opt;
        selectRec.innerHTML += opt;
        selectFiltro.innerHTML += opt;
    });

    actualizarSelectUsuarios();
}

function actualizarSelectUsuarios() {
    const selectOpUser = document.getElementById('opTelefono');
    const selectFilterUser = document.getElementById('filterUsuario');

    selectOpUser.innerHTML = '';
    selectFilterUser.innerHTML = '<option value="todos">Todos los Miembros</option>';

    Object.entries(estado.usuarios).forEach(([tel, nom]) => {
        selectOpUser.innerHTML += `<option value="${tel}">${nom} (${tel})</option>`;
        selectFilterUser.innerHTML += `<option value="${tel}">${nom}</option>`;
    });
    try { if (typeof refrescarHogarUI === 'function') refrescarHogarUI(); } catch (e) {}
}

function abrirModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function cerrarModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}

function cerrarModalFuera(e, modalId) {
    if (e.target.id === modalId) {
        cerrarModal(modalId);
    }
}

function abrirModalOperacion(prefill = {}) {
    document.getElementById('formOperacion').reset();
    document.getElementById('opId').value = prefill.id || '';
    document.getElementById('modalOperacionTitle').textContent = prefill.id ? 'Editar Operación' : 'Nueva Operación';
    
    document.getElementById('opTipo').value = prefill.tipo || 'gasto';
    document.getElementById('opCantidad').value = prefill.cantidad || '';
    document.getElementById('opConcepto').value = prefill.concepto || '';
    document.getElementById('opCategoria').value = prefill.categoria || 'Alimentación';
    document.getElementById('opTelefono').value = prefill.telefono || Object.keys(estado.usuarios)[0] || '600111222';
    document.getElementById('opEsCompartido').checked = prefill.esCompartido !== undefined ? prefill.esCompartido : true;

    const fechaDefecto = prefill.fecha || fechaHoyISO();
    document.getElementById('opFecha').value = fechaDefecto.substring(0, 10);

    document.getElementById('groupEsFijoCheckbox').style.display = prefill.id ? 'none' : 'block';
    document.getElementById('opEsFijo').checked = false;
    document.getElementById('opcionesFijoContainer').style.display = 'none';

    abrirModal('modalOperacion');
}

function toggleOpcionesFijo() {
    const checked = document.getElementById('opEsFijo').checked;
    document.getElementById('opcionesFijoContainer').style.display = checked ? 'block' : 'none';
    if (checked) {
        const dia = new Date(document.getElementById('opFecha').value || new Date()).getDate();
        document.getElementById('opDiaFijo').value = dia;
    }
}

function actualizarCategoriasSegunTipo() {
    const tipo = document.getElementById('opTipo').value;
    if (tipo === 'ingreso') {
        document.getElementById('opCategoria').value = 'Banco y Seguros';
    }
}

async function guardarOperacion(e) {
    e.preventDefault();
    const id = document.getElementById('opId').value;
    const tipo = document.getElementById('opTipo').value;
    const cantidad = parseFloat(document.getElementById('opCantidad').value);
    const concepto = document.getElementById('opConcepto').value.trim();
    const categoria = document.getElementById('opCategoria').value;
    const fecha = document.getElementById('opFecha').value;
    const telefono = document.getElementById('opTelefono').value;
    if (!telefono) {
        mostrarToast('Añade primero un miembro en "Reparto Familiar".', 'danger');
        cerrarModal('modalOperacion');
        cambiarTab('split');
        return;
    }
    const esCompartido = document.getElementById('opEsCompartido').checked;
    const esFijo = document.getElementById('opEsFijo').checked;

    if (!concepto || isNaN(cantidad) || cantidad <= 0) {
        mostrarToast('Indica un concepto y una cantidad válida.', 'danger');
        return;
    }

    const payload = {
        telefono,
        tipo,
        concepto,
        categoria,
        cantidad,
        esCompartido,
        fecha: new Date(fecha).toISOString()
    };

    if (id) {
        const index = estado.transacciones.findIndex(t => t.id == id);
        if (index !== -1) {
            estado.transacciones[index] = { ...estado.transacciones[index], ...payload };
            estado.transacciones[index]._mod = Date.now();
        }
        guardarLocalmente();
        api(`/api/transaccion/${id}`, 'PUT', payload).catch(() => {});
        mostrarToast('Operación actualizada con éxito', 'success');
    } else {
        const nuevaOp = {
            id: Date.now(),
            ...payload
        };
        estado.transacciones.push(nuevaOp);

        if (esFijo) {
            const diaFijo = parseInt(document.getElementById('opDiaFijo').value) || 1;
            const nuevoRec = {
                id: Date.now() + 1,
                concepto,
                tipo,
                dia: diaFijo,
                cantidad,
                categoria,
                activo: true
            };
            estado.recurrentes.push(nuevoRec);
            api('/api/recurrente', 'POST', nuevoRec).catch(() => {});
        }

        guardarLocalmente();
        api('/api/transaccion', 'POST', payload).catch(() => {});
        mostrarToast('Operación guardada con éxito', 'success');
    }

    cerrarModal('modalOperacion');
    actualizarVistas();
}

function editarOperacion(id) {
    const op = estado.transacciones.find(t => t.id === id);
    if (!op) return;
    abrirModalOperacion(op);
}

async function confirmarEliminarOperacion(id) {
    if (confirm('¿Seguro que deseas eliminar este movimiento?')) {
        estado.transacciones = estado.transacciones.filter(t => t.id !== id);
        try { if (typeof NUBE_marcarBorrado === 'function') NUBE_marcarBorrado('tx', id); } catch (e) {}
        guardarLocalmente();
        api(`/api/transaccion/${id}`, 'DELETE').catch(() => {});
        mostrarToast('Movimiento eliminado', 'success');
        actualizarVistas();
    }
}

// Modales de Recurrentes
function abrirModalRecurrente(prefill = {}) {
    document.getElementById('formRecurrente').reset();
    document.getElementById('recId').value = prefill.id || '';
    document.getElementById('modalRecurrenteTitle').textContent = prefill.id ? 'Editar Concepto Fijo' : 'Nuevo Concepto Fijo';

    document.getElementById('recTipo').value = prefill.tipo || 'gasto';
    document.getElementById('recCantidad').value = prefill.cantidad || '';
    document.getElementById('recConcepto').value = prefill.concepto || '';
    document.getElementById('recDia').value = prefill.dia || 1;
    document.getElementById('recCategoria').value = prefill.categoria || 'Vivienda';

    abrirModal('modalRecurrente');
}

async function guardarRecurrente(e) {
    e.preventDefault();
    const id = document.getElementById('recId').value;
    const tipo = document.getElementById('recTipo').value;
    const cantidad = parseFloat(document.getElementById('recCantidad').value);
    const concepto = document.getElementById('recConcepto').value.trim();
    const dia = parseInt(document.getElementById('recDia').value);
    const categoria = document.getElementById('recCategoria').value;

    const payload = { tipo, cantidad, concepto, dia, categoria, activo: true };

    if (id) {
        const index = estado.recurrentes.findIndex(r => r.id == id);
        if (index !== -1) {
            estado.recurrentes[index] = { ...estado.recurrentes[index], ...payload };
            estado.recurrentes[index]._mod = Date.now();
        }
        guardarLocalmente();
        api(`/api/recurrente/${id}`, 'PUT', payload).catch(() => {});
        mostrarToast('Concepto fijo actualizado', 'success');
    } else {
        const nuevo = { id: Date.now(), ...payload };
        estado.recurrentes.push(nuevo);
        guardarLocalmente();
        api('/api/recurrente', 'POST', payload).catch(() => {});
        mostrarToast('Concepto fijo registrado', 'success');
    }

    cerrarModal('modalRecurrente');
    actualizarVistas();
}

function editarRecurrente(id) {
    const r = estado.recurrentes.find(item => item.id === id);
    if (!r) return;
    abrirModalRecurrente(r);
}

async function eliminarRecurrente(id) {
    if (confirm('¿Eliminar este concepto fijo periódico?')) {
        estado.recurrentes = estado.recurrentes.filter(r => r.id !== id);
        try { if (typeof NUBE_marcarBorrado === 'function') NUBE_marcarBorrado('rec', id); } catch (e) {}
        guardarLocalmente();
        api(`/api/recurrente/${id}`, 'DELETE').catch(() => {});
        mostrarToast('Gasto fijo eliminado', 'success');
        actualizarVistas();
    }
}

// ==========================================================================
// Copias de Seguridad, Exportación & Simulación
// ==========================================================================

function exportarJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
        transacciones: estado.transacciones,
        recurrentes: estado.recurrentes,
        metasPorMes: estado.metasPorMes,
        usuarios: estado.usuarios
    }, null, 2));
    
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `gestor_gastos_backup_${new Date().toISOString().substring(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    mostrarToast('Copia de seguridad JSON descargada', 'info');
}

function exportarCSV() {
    const encabezados = ["ID", "Fecha", "Tipo", "Concepto", "Categoría", "Cantidad (€)", "Miembro/Teléfono", "Compartido"];
    const filas = estado.transacciones.map(t => [
        t.id,
        t.fecha.substring(0, 10),
        t.tipo,
        `"${t.concepto.replace(/"/g, '""')}"`,
        `"${t.categoria}"`,
        t.cantidad.toFixed(2),
        `"${estado.usuarios[t.telefono] || t.telefono}"`,
        t.esCompartido ? "Sí" : "No"
    ]);

    const csvContent = "\uFEFF" + [encabezados.join(";"), ...filas.map(f => f.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `movimientos_gastos_${new Date().toISOString().substring(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    mostrarToast('Archivo CSV para Excel generado con éxito', 'info');
}

async function importarJSON(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const contenido = JSON.parse(event.target.result);
            if (contenido.transacciones) estado.transacciones = contenido.transacciones;
            if (contenido.recurrentes) estado.recurrentes = contenido.recurrentes;
            if (contenido.metasPorMes) estado.metasPorMes = contenido.metasPorMes;
            if (contenido.usuarios) estado.usuarios = contenido.usuarios;

            guardarLocalmente();
            try { if (typeof programarSubidaNube === 'function') programarSubidaNube(true); } catch (e) {}
            api('/api/importar', 'POST', contenido).catch(() => {});
            mostrarToast('¡Datos importados con éxito!', 'success');
            inicializarSelectorMeses();
            actualizarSelectUsuarios();
            actualizarVistas();
        } catch (err) {
            mostrarToast('Archivo JSON no válido', 'danger');
        }
    };
    reader.readAsText(file);
}

async function restablecerDatosSimulados() {
    if (confirm('¿Restablecer datos de prueba?')) {
        estado.transacciones = JSON.parse(JSON.stringify(DATOS_DEMO.transacciones));
        estado.recurrentes = JSON.parse(JSON.stringify(DATOS_DEMO.recurrentes));
        estado.metasPorMes = JSON.parse(JSON.stringify(DATOS_DEMO.metasPorMes));
        estado.usuarios = JSON.parse(JSON.stringify(DATOS_DEMO.usuarios));
        guardarLocalmente();
        try { if (typeof programarSubidaNube === 'function') programarSubidaNube(true); } catch (e) {}
        api('/api/simular', 'POST').catch(() => {});
        mostrarToast('¡Datos de prueba cargados correctamente!', 'success');
        inicializarSelectorMeses();
        actualizarSelectUsuarios();
        actualizarVistas();
    }
}

// ==========================================================================
// Notificaciones Toast Flotantes
// ==========================================================================

function mostrarToast(mensaje, tipo = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    const iconos = { success: '✅', danger: '⚠️', info: 'ℹ️' };
    toast.innerHTML = `<span>${iconos[tipo] || 'ℹ️'}</span> <span>${mensaje}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.3s, transform 0.3s';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

// ==========================================================================
// Service Worker & Soporte PWA
// ==========================================================================

function inicializarPWA() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            // Ruta relativa: funciona en /, subcarpetas, GitHub Pages, file hosting, etc.
            // En file:// o contextos no seguros el registro falla de forma silenciosa (modo portable).
            navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(err => {
                console.log('SW no registrado (modo portable/offline):', err);
            });
        });
    }
}
