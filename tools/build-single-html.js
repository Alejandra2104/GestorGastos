/**
 * Genera dist/GestorGastos-App.html — PWA portable de UN SOLO ARCHIVO.
 * - 100% autónomo: doble clic (file://), sin servidor, sin internet, sin build.
 * - Datos en localStorage del dispositivo.
 * - Incluye sistema de Descarga / Instalación / Compartir para
 *   Windows, macOS, Linux, Android e iOS.
 * - Manifiesto inyectado vía Blob para que Chromium ofrezca "Instalar como app".
 * Uso: node tools/build-single-html.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PUB = path.join(ROOT, 'public');
const DIST = path.join(ROOT, 'dist');
if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });

let html = fs.readFileSync(path.join(PUB, 'index.html'), 'utf8');
let css = fs.readFileSync(path.join(PUB, 'style.css'), 'utf8');
let js = fs.readFileSync(path.join(PUB, 'app.js'), 'utf8');

// ---------- 1. Modo portable: forzar local, sin backend, sin SW ruidoso ----------
if (!js.includes('window.__MODO_PORTABLE__ = true')) {
  js += "\nwindow.__MODO_PORTABLE__ = true;\n";
}
// Guard: no intentar registrar SW desde file:// o contexto no seguro (early return, sin tocar el resto)
if (js.includes('function inicializarPWA()')) {
  js = js.replace(
    'function inicializarPWA() {',
    `function inicializarPWA() {
    try {
      const proto = (location && location.protocol) || '';
      if (!proto.startsWith('http') || !window.isSecureContext) return; // file:// -> sin SW, 100% local
    } catch (e) { return; }`
  );
}

// ---------- 2. Iconos embebidos (data URI) ----------
let icon192 = '', icon512 = '', appleIcon = '';
try { icon192 = 'data:image/png;base64,' + fs.readFileSync(path.join(PUB, 'icons', 'icon-192.png')).toString('base64'); } catch (e) { console.warn('icon-192:', e.message); }
try { icon512 = 'data:image/png;base64,' + fs.readFileSync(path.join(PUB, 'icons', 'icon-512.png')).toString('base64'); } catch (e) { console.warn('icon-512:', e.message); }
try { appleIcon = 'data:image/png;base64,' + fs.readFileSync(path.join(PUB, 'apple-touch-icon.png')).toString('base64'); } catch (e) { appleIcon = icon192; }
const favIcon = icon192 || appleIcon;

// ---------- 3. CSS extra del instalador (autónomo) ----------
const installerCSS = `
/* ===== Instalador portable (inyectado por build) ===== */
#portableBar{background:#2b2144;color:#ede4ff;text-align:center;font-size:.78rem;padding:8px 12px;line-height:1.5}
#portableBar code{background:rgba(255,255,255,.12);padding:1px 6px;border-radius:6px}
#portableBar button{margin-left:8px;border:none;border-radius:999px;padding:6px 14px;font-weight:800;cursor:pointer;background:#fff;color:#2b2144}
.btn-install{background:linear-gradient(135deg,#6d28d9,#a855f7)!important;color:#fff!important;border:none!important;box-shadow:0 4px 14px rgba(124,58,237,.4)}
#modalInstalar .modal-container{max-width:640px}
.inst-tabs{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0}
.inst-tabs button{border:1px solid var(--border-color);background:var(--bg-card-hover);color:var(--text-primary);border-radius:999px;padding:7px 13px;font-size:.8rem;font-weight:700;cursor:pointer}
.inst-tabs button.active{background:#7c3aed;border-color:#7c3aed;color:#fff}
.inst-panel{display:none;background:var(--bg-card-hover);border:1px solid var(--border-color);border-radius:12px;padding:14px 16px;font-size:.86rem;line-height:1.65}
.inst-panel.active{display:block}
.inst-panel ol{margin:6px 0 6px 20px;padding:0}
.inst-panel kbd{background:#2b2144;color:#fff;border-radius:6px;padding:1px 7px;font-size:.76rem;font-family:inherit}
.inst-actions{display:flex;gap:10px;flex-wrap:wrap;margin:14px 0 4px}
.inst-actions .btn{flex:1;min-width:160px;justify-content:center;display:inline-flex;align-items:center;gap:8px}
.inst-note{font-size:.78rem;color:var(--text-secondary);line-height:1.6;background:var(--primary-surface);border-radius:10px;padding:10px 12px;margin-top:12px}
`;

// ---------- 3b. Instaladores de 1 clic (fuente única: botones in-app + archivos en dist/) ----------
// Sin contrabarras literales a propósito (compatibles con el template literal de abajo).
const BAT_LINES = [
'@echo off',
'setlocal',
'cd /d "%~dp0"',
'set "HTML=%~dp0GestorGastos-App.html"',
'if not exist "%HTML%" (',
'echo [ERROR] Pon este instalador en la MISMA carpeta que GestorGastos-App.html',
'pause',
'exit /b 1',
')',
'set "BROWSER="',
'if exist "%ProgramFiles%/Google/Chrome/Application/chrome.exe" set "BROWSER=%ProgramFiles%/Google/Chrome/Application/chrome.exe"',
'if exist "%ProgramFiles(x86)%/Google/Chrome/Application/chrome.exe" set "BROWSER=%ProgramFiles(x86)%/Google/Chrome/Application/chrome.exe"',
'if not defined BROWSER if exist "%ProgramFiles%/Microsoft/Edge/Application/msedge.exe" set "BROWSER=%ProgramFiles%/Microsoft/Edge/Application/msedge.exe"',
'if not defined BROWSER if exist "%ProgramFiles(x86)%/Microsoft/Edge/Application/msedge.exe" set "BROWSER=%ProgramFiles(x86)%/Microsoft/Edge/Application/msedge.exe"',
'if not defined BROWSER (',
'echo [ERROR] No se encontro Chrome ni Edge. Instala uno y vuelve a intentarlo.',
'pause',
'exit /b 1',
')',
'set "GG_HTML=%HTML%"',
'set "GG_BROWSER=%BROWSER%"',
'set "PS1=%TEMP%/gg_instalar_tmp.ps1"',
'echo $ws = New-Object -ComObject WScript.Shell> "%PS1%"',
'echo $url = ([uri]$env:GG_HTML).AbsoluteUri>> "%PS1%"',
'echo $d1 = "$env:USERPROFILE/Desktop/Gestor de Gastos.lnk">> "%PS1%"',
'echo $d2 = "$env:APPDATA/Microsoft/Windows/Start Menu/Programs/Gestor de Gastos.lnk">> "%PS1%"',
'echo $s1 = $ws.CreateShortcut($d1)>> "%PS1%"',
'echo $s1.TargetPath = $env:GG_BROWSER>> "%PS1%"',
'echo $s1.Arguments = "--app=" + $url>> "%PS1%"',
'echo $s1.WorkingDirectory = $env:USERPROFILE>> "%PS1%"',
'echo $s1.IconLocation = $env:GG_BROWSER + ",0">> "%PS1%"',
'echo $s1.Save()>> "%PS1%"',
'echo $s2 = $ws.CreateShortcut($d2)>> "%PS1%"',
'echo $s2.TargetPath = $env:GG_BROWSER>> "%PS1%"',
'echo $s2.Arguments = "--app=" + $url>> "%PS1%"',
'echo $s2.WorkingDirectory = $env:USERPROFILE>> "%PS1%"',
'echo $s2.IconLocation = $env:GG_BROWSER + ",0">> "%PS1%"',
'echo $s2.Save()>> "%PS1%"',
'echo Start-Process $d1>> "%PS1%"',
'powershell -NoProfile -ExecutionPolicy Bypass -File "%PS1%"',
'del "%PS1%" >nul 2>&1',
'echo.',
'echo Listo. Accesos directos creados en el Escritorio y en el menu Inicio.',
'pause'
];
const SH_LINES = [
'#!/bin/sh',
'DIR="$(cd "$(dirname "$0")" && pwd)"',
'HTML="$DIR/GestorGastos-App.html"',
'if [ ! -f "$HTML" ]; then',
'echo "[ERROR] Pon este script en la MISMA carpeta que GestorGastos-App.html"',
'exit 1',
'fi',
'BIN=""',
'for b in google-chrome google-chrome-stable chromium chromium-browser microsoft-edge microsoft-edge-stable; do',
'if command -v "$b" >/dev/null 2>&1; then BIN="$b"; break; fi',
'done',
'if [ -z "$BIN" ]; then',
'echo "[ERROR] Instala Chrome, Chromium o Edge y vuelve a intentarlo."',
'exit 1',
'fi',
'APPDIR="$HOME/.local/share/applications"',
'mkdir -p "$APPDIR"',
'DESK="$APPDIR/gestorgastos.desktop"',
'URL=$(printf "%s" "$HTML" | sed "s/ /%20/g")',
'echo "[Desktop Entry]"> "$DESK"',
'echo "Name=Gestor de Gastos">> "$DESK"',
'echo "Comment=Gestor de gastos familiar (funciona sin internet)">> "$DESK"',
'echo "Exec=$BIN --app=file://$URL">> "$DESK"',
'echo "Terminal=false">> "$DESK"',
'echo "Type=Application">> "$DESK"',
'echo "Categories=Office;Finance;">> "$DESK"',
'echo "StartupWMClass=Gestor de Gastos">> "$DESK"',
'chmod +x "$DESK"',
'if [ -d "$HOME/Desktop" ]; then cp "$DESK" "$HOME/Desktop/gestorgastos.desktop"; fi',
'if [ -d "$HOME/Escritorio" ]; then cp "$DESK" "$HOME/Escritorio/gestorgastos.desktop"; fi',
'update-desktop-database "$APPDIR" >/dev/null 2>&1 || true',
'echo "Listo. Busca Gestor de Gastos en el lanzador de aplicaciones."'
];
const MAC_LINES = [
'#!/bin/sh',
'DIR="$(cd "$(dirname "$0")" && pwd)"',
'HTML="$DIR/GestorGastos-App.html"',
'if [ ! -f "$HTML" ]; then',
'echo "[ERROR] Pon este lanzador junto a GestorGastos-App.html"',
'exit 1',
'fi',
'URL=$(printf "%s" "file://$HTML" | sed "s/ /%20/g")',
'if [ -d "/Applications/Google Chrome.app" ]; then',
'open -a "Google Chrome" --args --app="$URL"',
'elif [ -d "/Applications/Microsoft Edge.app" ]; then',
'open -a "Microsoft Edge" --args --app="$URL"',
'else',
'open -a "Safari" "$HTML"',
'echo "Abierto en Safari. Para fijarlo usa el menu Archivo - Anadir al Dock."',
'fi'
];
// ---------- 4. HTML del modal instalador ----------
const installerModalHTML = `
    <!-- =====================================================================
         MODAL INSTALAR / DESCARGAR APP (solo versión portable de un archivo)
         ===================================================================== -->
    <div id="modalInstalar" class="modal-backdrop" onclick="cerrarModalFuera(event, 'modalInstalar')">
        <div class="modal-container">
            <div class="modal-header">
                <h3 class="modal-title">📲 Instalar / Descargar la app</h3>
                <button class="modal-close-btn" onclick="cerrarModal('modalInstalar')">✕</button>
            </div>
            <p style="font-size:.86rem;color:var(--text-secondary);line-height:1.6;margin-bottom:6px">
                Este archivo <strong>ES la app completa</strong>: funciona sin internet, sin servidor y sin instalación.
                Guárdalo, cópialo por USB, envíalo por WhatsApp / email y ábrelo con doble clic en cualquier dispositivo.
            </p>
            <div class="inst-note" id="instDiag">Detectando tu dispositivo…</div>
            <div class="inst-actions">
                <button class="btn btn-primary" onclick="descargarAppHTML()">⬇️ Descargar copia .html</button>
                <button class="btn btn-outline" onclick="compartirApp()">📤 Compartir la app</button>
            </div>
            <div class="inst-tabs" role="tablist">
                <button class="active" data-os="windows" onclick="cambiarTabInstalar('windows')">🪟 Windows</button>
                <button data-os="mac" onclick="cambiarTabInstalar('mac')">🍎 Mac</button>
                <button data-os="linux" onclick="cambiarTabInstalar('linux')">🐧 Linux</button>
                <button data-os="android" onclick="cambiarTabInstalar('android')">🤖 Android</button>
                <button data-os="ios" onclick="cambiarTabInstalar('ios')">📱 iPhone/iPad</button>
            </div>
            <div class="inst-panel active" id="inst-windows">
                <strong>Windows — recomendado (1 clic, funciona siempre):</strong>
                <ol>
                    <li>Pulsa <strong>Descargar instalador Windows</strong> y guarda el <kbd>.bat</kbd> en la <strong>misma carpeta</strong> que <kbd>GestorGastos-App.html</kbd>.</li>
                    <li>Haz <strong>doble clic</strong> en el <kbd>.bat</kbd>. Crea <strong>Gestor de Gastos</strong> en el Escritorio y en el menú Inicio: abre la app en su propia ventana con Chrome o Edge.</li>
                </ol>
                <button class="btn btn-primary" style="margin:4px 0 8px" onclick="descargarInstaladorWindows()">Descargar instalador Windows (.bat)</button>
                <div><strong>Por qué no ves el menú de Chrome:</strong> con archivos locales (<kbd>file://</kbd>) Chrome <strong>oculta</strong> las opciones de instalar. No es un fallo de la app. El instalador de arriba lo resuelve. Alternativa manual: en <strong>Edge</strong> abre el archivo y ve a <kbd>··· → Aplicaciones → Instalar este sitio como una aplicación</kbd>.</div>
            </div>
            <div class="inst-panel" id="inst-mac">
                <strong>macOS:</strong>
                <ol>
                    <li><strong>Safari (nativo, recomendado):</strong> abre <kbd>GestorGastos-App.html</kbd> con Safari → menú <kbd>Archivo → Añadir al Dock</kbd> (macOS Sonoma 14 o posterior). Queda como app independiente en el Dock.</li>
                    <li><strong>Con Chrome/Edge:</strong> descarga el lanzador, ponlo junto al <kbd>.html</kbd> y haz doble clic: abre la app en su propia ventana. En Edge también vale <kbd>··· → Aplicaciones → Instalar este sitio como una aplicación</kbd>.</li>
                </ol>
                <button class="btn btn-primary" style="margin:4px 0 8px" onclick="descargarInstaladorMac()">Descargar lanzador Mac (.command)</button>
            </div>
            <div class="inst-panel" id="inst-linux">
                <strong>Linux:</strong>
                <ol>
                    <li>Descarga el instalador y ponlo en la <strong>misma carpeta</strong> que <kbd>GestorGastos-App.html</kbd>.</li>
                    <li>En una terminal: <kbd>chmod +x instalar-gestorgastos-linux.sh && ./instalar-gestorgastos-linux.sh</kbd>. Crea el lanzador <strong>Gestor de Gastos</strong> en el menú de aplicaciones (usa Chrome, Chromium o Edge).</li>
                    <li>Sin terminal: doble clic en el <kbd>.html</kbd> para usarla directamente en el navegador.</li>
                </ol>
                <button class="btn btn-primary" style="margin:4px 0 8px" onclick="descargarInstaladorLinux()">Descargar instalador Linux (.sh)</button>
            </div>
            <div class="inst-panel" id="inst-android">
                <strong>Android (Chrome):</strong>
                <ol>
                    <li>Envíate <kbd>GestorGastos-App.html</kbd> (WhatsApp a ti mismo, Drive, USB…) y <strong>ábrelo eligiendo Chrome</strong> (si se abre en otro visor, usa <kbd>Compartir → Abrir con → Chrome</kbd>).</li>
                    <li>En Chrome pulsa <kbd>⋮ → Añadir a pantalla de inicio → Añadir</kbd>. Esta opción <strong>sí existe siempre</strong> en Chrome para Android. Icono propio, pantalla completa y offline.</li>
                    <li>También puedes pulsar <kbd>📤 Compartir</kbd> aquí arriba para enviártela a otro móvil.</li>
                </ol>
            </div>
            <div class="inst-panel" id="inst-ios">
                <strong>iPhone / iPad — importante:</strong> Apple <strong>no permite</strong> instalar archivos locales: al abrir el <kbd>.html</kbd> desde Archivos no sale <kbd>Añadir a pantalla de inicio</kbd> o el icono no funciona. No es un fallo de la app. Hay 2 caminos que sí funcionan:
                <ol>
                    <li><strong>Camino 1 — icono real (gratis, se hace una vez desde un PC):</strong> en el ordenador sube el contenido de <kbd>GestorGastos-PWA-instalable.zip</kbd> a <kbd>Netlify Drop</kbd> (app.netlify.com/drop: arrastra la carpeta y listo) o a Cloudflare Pages / GitHub Pages. Te dará un enlace <kbd>https://…</kbd>: ábrelo en el <strong>Safari</strong> del iPhone → <kbd>Compartir ⬆️ → Añadir a pantalla de inicio → Añadir</kbd>. Instalada con icono, completa y offline.</li>
                    <li><strong>Camino 2 — usarla sin instalar:</strong> envíate el <kbd>.html</kbd> (AirDrop, WhatsApp, email), guárdalo en <strong>Archivos</strong> y ábrelo desde allí cuando la necesites. Funciona, pero sin icono en el inicio.</li>
                </ol>
                <div>Para llevar tus datos al iPhone usa <kbd>Ajustes → Descargar Copia (JSON)</kbd> en el otro dispositivo e impórtala en el iPhone.</div>
            </div>
            <div class="inst-note">
                🔒 <strong>Privacidad total:</strong> no hay cuentas ni nube; los datos se guardan en <strong>localStorage</strong> de cada dispositivo/navegador.
                Para mover datos entre dispositivos usa <strong>Ajustes → Descargar Copia (JSON)</strong> e <strong>Importar Copia</strong> en el destino.
                Si algún día la subes a un hosting HTTPS con la carpeta <code>public/</code>, el mismo código funciona como PWA instalable con Service Worker offline.
            </div>
            <div class="modal-footer" style="margin-top:14px">
                <button type="button" class="btn btn-outline" onclick="cerrarModal('modalInstalar')">Cerrar</button>
                <button type="button" class="btn btn-primary" onclick="descargarAppHTML()">⬇️ Descargar app</button>
            </div>
        </div>
    </div>
`;

// ---------- 5. JS del instalador (descargar / compartir / manifest blob) ----------
let installerJS = `
/* ===== Instalador portable: descargar, compartir, manifest, pestañas ===== */
(function(){
  // Manifiesto dinámico vía Blob para que Chromium pueda ofrecer "Instalar como app"
  try {
    if (!document.querySelector('link[rel="manifest"]')) {
      var __icon192 = ${JSON.stringify(icon192)};
      var __icon512 = ${JSON.stringify(icon512 || icon192)};
      var __manifest = {
        name: "Gestor de Gastos Familiar",
        short_name: "GestorGastos",
        description: "Control de gastos familiares. Funciona 100% offline.",
        start_url: ".",
        scope: ".",
        display: "standalone",
        orientation: "portrait-primary",
        background_color: "#f6f2ff",
        theme_color: "#7c3aed",
        lang: "es",
        icons: [
          { src: __icon192, sizes: "192x192", type: "image/png", purpose: "any" },
          { src: __icon512, sizes: "512x512", type: "image/png", purpose: "any" },
          { src: __icon512, sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      };
      var __blob = new Blob([JSON.stringify(__manifest)], { type: "application/manifest+json" });
      var __link = document.createElement("link");
      __link.rel = "manifest";
      __link.href = URL.createObjectURL(__blob);
      document.head.appendChild(__link);
    }
  } catch (e) { console.warn("manifest portable:", e); }

  // Capturar prompt de instalación cuando el navegador lo ofrece (http/https o file instalado como app)
  var __deferred = null;
  window.addEventListener("beforeinstallprompt", function(e){
    e.preventDefault(); __deferred = e;
    try {
      var b = document.getElementById("pwaInstallBar");
      if (b) b.style.display = "block";
      var btn = document.getElementById("btnInstalarPortable");
      if (btn) btn.innerHTML = "⬇️ Instalar app";
    } catch (err) {}
  });
  window.__instalarNativo = function(){
    if (__deferred) {
      __deferred.prompt();
      __deferred.userChoice.then(function(){ __deferred = null; }).catch(function(){});
      return true;
    }
    return false;
  };
})();

var BAT_INSTALADOR = __BAT_JSON__;
var SH_INSTALADOR = __SH_JSON__;
var MAC_INSTALADOR = __MAC_JSON__;
var SALTO_WIN = String.fromCharCode(13) + String.fromCharCode(10);
var SALTO_UNIX = String.fromCharCode(10);

function descargarArchivo(nombre, contenido, tipo){
  try {
    var blob = new Blob([contenido], { type: tipo || "text/plain;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){ try { URL.revokeObjectURL(a.href); a.remove(); } catch(e){} }, 800);
    try { mostrarToast("Descargado: " + nombre, "success"); } catch(e){}
  } catch(e){ alert("No se pudo descargar en este navegador."); }
}
function descargarInstaladorWindows(){ descargarArchivo("Instalar-GestorGastos-Windows.bat", BAT_INSTALADOR.join(SALTO_WIN), "text/plain;charset=utf-8"); }
function descargarInstaladorLinux(){ descargarArchivo("instalar-gestorgastos-linux.sh", SH_INSTALADOR.join(SALTO_UNIX), "text/plain;charset=utf-8"); }
function descargarInstaladorMac(){ descargarArchivo("Instalar-GestorGastos-Mac.command", MAC_INSTALADOR.join(SALTO_UNIX), "text/plain;charset=utf-8"); }

function detectarSONavegador(){
  var ua = navigator.userAgent || "";
  var os = "Windows";
  if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Macintosh|Mac OS/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  var nav = "tu navegador";
  if (/Edg/i.test(ua)) nav = "Edge";
  else if (/SamsungBrowser/i.test(ua)) nav = "Samsung Internet";
  else if (/Chrome/i.test(ua)) nav = "Chrome";
  else if (/Firefox/i.test(ua)) nav = "Firefox";
  else if (/Safari/i.test(ua)) nav = "Safari";
  return { os: os, nav: nav };
}
function tabDeSO(os){
  if (os === "iOS") return "ios";
  if (os === "Android") return "android";
  if (os === "macOS") return "mac";
  if (os === "Linux") return "linux";
  return "windows";
}
function actualizarDiagInstalar(){
  var el = document.getElementById("instDiag");
  if (!el) return;
  var d = detectarSONavegador();
  var proto = "desconocido";
  try { proto = location.protocol; } catch(e){}
  var como = (proto === "file:") ? "archivo local" : proto;
  var msg = "Estás en <b>" + d.nav + "</b> (" + d.os + "), abriendo la app como <b>" + como + "</b>. ";
  if (proto === "file:" && d.os === "Windows") {
    msg += "Por eso Chrome no muestra el botón Instalar: con archivos locales lo oculta. Usa el <b>instalador de 1 clic</b> de abajo.";
  } else if (d.os === "iOS") {
    msg += "Apple no permite instalar archivos locales: para el icono real sigue el <b>Camino 1</b> de la pestaña iPhone/iPad.";
  } else if (d.os === "Android") {
    msg += "En Android sí se puede añadir: sigue los pasos de la pestaña Android.";
  } else {
    msg += "Sigue los pasos de tu pestaña para dejarla instalada.";
  }
  el.innerHTML = msg;
  try { cambiarTabInstalar(tabDeSO(d.os)); } catch(e){}
}
function cambiarTabInstalar(os){
  document.querySelectorAll(".inst-tabs button").forEach(function(b){
    b.classList.toggle("active", b.dataset.os === os);
  });
  ["windows","mac","linux","android","ios"].forEach(function(k){
    var p = document.getElementById("inst-" + k);
    if (p) p.classList.toggle("active", k === os);
  });
  // Preselección automática según el dispositivo actual
  // (no hace falta llamar manualmente)
}
(function preselectInstTab(){
  try {
    var ua = navigator.userAgent || "";
    var os = "windows";
    if (/iPhone|iPad|iPod/i.test(ua)) os = "ios";
    else if (/Android/i.test(ua)) os = "android";
    else if (/Mac/i.test(ua)) os = "mac";
    else if (/Linux/i.test(ua)) os = "linux";
    setTimeout(function(){ try { cambiarTabInstalar(os); } catch(e){} }, 300);
  } catch(e){}
})();

function abrirModalInstalar(){
  // Si el navegador ofrece instalación nativa PWA, usarla primero
  try { if (window.__instalarNativo && window.__instalarNativo()) return; } catch(e){}
  setTimeout(function(){ try { actualizarDiagInstalar(); } catch(e){} }, 60);
  try { abrirModal("modalInstalar"); } catch(e) {
    var m = document.getElementById("modalInstalar");
    if (m) m.classList.add("show");
  }
}

// Descarga el propio archivo HTML (clonado, sin URLs blob efímeras) -> compartible por WhatsApp/USB/email
function descargarAppHTML(){
  try {
    var clone = document.documentElement.cloneNode(true);
    // Quitar enlaces blob: (manifest dinámico) que no sobrevivirían a la descarga
    clone.querySelectorAll('link[href^="blob:"]').forEach(function(l){ l.remove(); });
    var doc = "<!DOCTYPE html>\\n" + clone.outerHTML;
    var blob = new Blob([doc], { type: "text/html;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "GestorGastos-App.html";
    document.body.appendChild(a);
    a.click();
    setTimeout(function(){ try { URL.revokeObjectURL(a.href); a.remove(); } catch(e){} }, 800);
    try { mostrarToast("App descargada: compártela donde quieras", "success"); } catch(e){}
  } catch (e) {
    alert("No se pudo generar la descarga en este navegador. Usa el botón Compartir del sistema.");
  }
}

// Compartir el archivo real (móviles) o el enlace (escritorio)
async function compartirApp(){
  var titulo = "Gestor de Gastos — App";
  var texto = "Te comparto mi app de gastos: abre GestorGastos-App.html con doble clic. Funciona offline en Windows, Mac, Linux, Android e iPhone.";
  try {
    var clone = document.documentElement.cloneNode(true);
    clone.querySelectorAll('link[href^="blob:"]').forEach(function(l){ l.remove(); });
    var doc = "<!DOCTYPE html>\\n" + clone.outerHTML;
    var file = null;
    try { file = new File([doc], "GestorGastos-App.html", { type: "text/html" }); } catch(e){ file = null; }
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: titulo, text: texto });
      return;
    }
    if (navigator.share) {
      await navigator.share({ title: titulo, text: texto, url: location.href });
      return;
    }
  } catch (e) {
    if (e && e.name === "AbortError") return; // usuario canceló
  }
  // Fallback: descarga
  descargarAppHTML();
}
`;

// ---------- 6. Transformar HTML ----------
html = html.replace(
  '<link rel="stylesheet" href="style.css">',
  '<style>\n/* ===== style.css inline (portable, offline) ===== */\n' + css + '\n' + installerCSS + '\n</style>'
);

// Quitar manifest externo (no válido en file://) — se inyecta vía Blob en runtime
html = html.replace('<link rel="manifest" href="manifest.json">', '<!-- portable: manifest inyectado vía Blob en runtime -->');

// Quitar iconos externos y poner favicon + apple-touch embebidos
html = html.replace(/<link rel="apple-touch-icon"[^>]*>/g, '');
html = html.replace(/<link rel="icon"[^>]*>/g, '');
html = html.replace(/<link rel="shortcut icon"[^>]*>/g, '');
html = html.replace(/<link rel="mask-icon"[^>]*>/g, '');
if (favIcon) {
  html = html.replace('</title>', '</title>\n    <link rel="icon" type="image/png" href="' + favIcon + '">\n    <link rel="apple-touch-icon" href="' + (appleIcon || favIcon) + '">\n    <meta name="apple-mobile-web-app-capable" content="yes">\n    <meta name="mobile-web-app-capable" content="yes">');
}

// Fuentes Google: mantener con fallback (si no hay internet usa fuente del sistema). Añadir display=swap ya lo tiene.
// Añadir precarga opcional no bloqueante: nada que hacer.

// Botón Instalar en el header (junto a Nueva Operación)
html = html.replace(
  '<div class="header-actions">',
  `<div class="header-actions">
                <button class="btn btn-install" id="btnInstalarPortable" title="Descargar o instalar la app en este dispositivo" onclick="abrirModalInstalar()">
                    <span>📲</span> Instalar
                </button>`
);

// Barra superior portable con botón Instalar
html = html.replace(
  '<div id="pwaInstallBar"',
  '<div id="portableBar">📦 <strong>GestorGastos-App.html</strong> — este archivo ES la app (sin internet ni servidor) · Tus datos se guardan en este dispositivo · <button onclick="abrirModalInstalar()">📲 Instalar / Descargar</button></div>\n    <div id="pwaInstallBar"'
);

// Modal instalador antes del toast container
html = html.replace(
  '<div class="toast-container"',
  installerModalHTML + '\n    <div class="toast-container"'
);

installerJS = installerJS.split('__BAT_JSON__').join(JSON.stringify(BAT_LINES));
installerJS = installerJS.split('__SH_JSON__').join(JSON.stringify(SH_LINES));
installerJS = installerJS.split('__MAC_JSON__').join(JSON.stringify(MAC_LINES));
// Inline app.js + installerJS (reemplazar script externo)
html = html.replace(
  '<script src="app.js"></script>',
  '<script>\n/* ===== app.js inline (modo portable localStorage, autónomo) ===== */\n' + js + '\n' + installerJS + '\n</script>'
);

// Blindar el script inline de instalación PWA original para file:// (evita errores ruidosos):
// - El bloque original hace navigator.serviceWorker.ready.then... que en file:// nunca resuelve: OK, no rompe.
// - Solo nos aseguramos de no registrar SW fuera de https. El registro vive en app.js (ya parcheado).
// - Además el banner beforeinstallprompt del index original sigue funcionando cuando se sirve por http.

// ---------- 7. Escribir salida ----------
const out = path.join(DIST, 'GestorGastos-App.html');
fs.writeFileSync(out, html, 'utf8');
const kb = (fs.statSync(out).size / 1024).toFixed(1);
console.log(`OK -> ${out} (${kb} KB)`);
// Instaladores de 1 clic (misma fuente que los botones dentro de la app)
fs.writeFileSync(path.join(DIST, 'Instalar-GestorGastos-Windows.bat'), BAT_LINES.join('\r\n'), 'utf8');
fs.writeFileSync(path.join(DIST, 'instalar-gestorgastos-linux.sh'), SH_LINES.join('\n'), 'utf8');
fs.writeFileSync(path.join(DIST, 'Instalar-GestorGastos-Mac.command'), MAC_LINES.join('\n'), 'utf8');
console.log('OK -> instaladores Windows/Linux/Mac en dist/');

// ---------- 8. ZIP PWA instalable ----------
// El ZIP con rutas portables se genera aparte con: python3 tools/zip-pwa.py
// (Se mantiene separado para no romper el build en Windows/Linux/Mac.)
console.log('NOTA: para regenerar el ZIP usa: python3 tools/zip-pwa.py');
