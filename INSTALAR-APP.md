# 📲 Gestor de Gastos — App instalable (Windows · macOS · Linux · Android · iOS)

> 🟢 **HTTPS ACTIVO AHORA MISMO** — abre `URL-HTTPS.txt` (o escanea `QR-APP.png`
> con el iPhone) e instala desde ahí. Se mantiene con `npm run https`.
> Mientras ese túnel esté abierto, Windows y iPhone comparten los mismos datos.

Tienes **3 formas** de usar la app. Elige la que prefieras:

| Opción | Archivo / carpeta | Instalación | Offline | Ideal para |
|---|---|---|---|---|
| **A. PWA instalable (recomendada)** | `public/` servida por HTTPS o `http://localhost:3000` | Botón “Instalar app” del navegador | ✅ Sí (Service Worker) | Windows, Mac, Linux, Android, iPhone/iPad |
| **B. HTML portable (doble clic)** | `dist/GestorGastos-App.html` | Sin instalación, doble clic | ✅ Sí (localStorage) | Llevar en USB, abrir sin servidor |
| **C. App nativa** | `electron-app/` (PC) · Capacitor/TWA (móvil) | `.exe` / `.dmg` / `.AppImage` / `.apk` / App Store | ✅ Sí | Distribuir como programa tradicional |

---

## Opción A — PWA instalable (5 minutos, sin compilar nada)

### 1. Pon la app en HTTPS (obligatorio para instalar, salvo localhost)
Cualquiera de estas vale:
- **Local:** `npm start` → abre `http://localhost:3000` (Chrome/Edge permiten instalar desde localhost).
- **Gratis en internet:** arrastra la carpeta `public/` a **Netlify Drop, Vercel, Cloudflare Pages, GitHub Pages o tu hosting**. Obtendrás `https://tu-app...` instalable desde cualquier dispositivo.
- **Al instante (temporal):** `npm run https` → publica este PC en un HTTPS de Cloudflare
  (sin cuentas). La URL sale en `URL-HTTPS.txt` + `QR-APP.png`. Vale para instalar
  en Windows y iPhone hoy mismo; caduca si apagas el PC o reinicias el comando.

### 2. Instalar según sistema
- **Windows (Chrome / Edge):** abre la URL → icono ⬇️ en la barra de direcciones → *Instalar* (o menú ⋮ → *Guardar y compartir → Instalar*). Queda en Inicio y Escritorio, con ventana propia y desinstalable desde *Configuración → Aplicaciones*.
- **Linux (Chrome / Edge):** mismo proceso que Windows. Queda como `.desktop` en el lanzador.
- **macOS (Chrome / Edge / Safari 17+):** Chrome/Edge: mismo botón *Instalar*. Safari: *Archivo → Añadir al Dock*. Funciona como app independiente.
- **Android (Chrome):** abre la URL → menú ⋮ → *Añadir a pantalla de inicio* o *Instalar app*. Icono propio, pantalla completa, funciona offline.
- **iPhone / iPad (Safari, iOS 16.4+):** abre la URL **en Safari** → *Compartir ⬆️ → Añadir a pantalla de inicio* → *Añadir*. La app muestra un aviso automático con estas instrucciones. Nota Apple: las PWA en iOS usan WebKit (límite ~50 MB, notificaciones limitadas), pero esta app está optimizada para ello (localStorage + cache).

> La app ya incluye `manifest.json` completo (iconos 72–512 + maskable), `sw.js` offline-first, `browserconfig.xml` para Windows, `apple-touch-icon` para Apple y banner de instalación + aviso de actualización automáticos.

### 3. Actualizar la PWA
Basta con volver a desplegar `public/` con un `sw.js` con nueva versión (`CACHE_VERSION`). La app muestra *“Hay una nueva versión → Actualizar”* sola.

---

## Opción B — HTML portable (el archivo descargable)

**Archivo:** `dist/GestorGastos-App.html` (660 KB aprox., un solo archivo) + instaladores de 1 clic en `dist/`.

- Haz **doble clic** en Windows, macOS o Linux, o ábrelo desde Android con Chrome o desde iOS con Archivos. **No necesita servidor ni internet** (solo la primera vez para la fuente Google; sin internet usa la fuente del sistema).
- Guarda los datos en `localStorage` del propio dispositivo/navegador.
- Dentro de la app, el botón **📲 Instalar** detecta tu dispositivo, te dice por qué Chrome oculta su menú con archivos locales y deja descargar instaladores y copias de la app.
- Para “instalarlo”:
  - **Windows (1 clic):** pon `dist/Instalar-GestorGastos-Windows.bat` junto al `.html` y haz doble clic: crea *Gestor de Gastos* en Escritorio e Inicio (ventana propia con Chrome/Edge). O en Edge: `··· → Aplicaciones → Instalar este sitio como una aplicación`. Nota: con archivos locales Chrome **oculta** su menú *Instalar/Crear acceso directo*; no es un fallo de la app.
  - **Mac:** abre el `.html` con Safari → *Archivo → Añadir al Dock* (Sonoma 14+). O doble clic en `dist/Instalar-GestorGastos-Mac.command`.
  - **Linux:** junto al `.html`: `chmod +x instalar-gestorgastos-linux.sh && ./instalar-gestorgastos-linux.sh` (usa `dist/instalar-gestorgastos-linux.sh`).
  - **Android:** cópialo al móvil y ábrelo **eligiendo Chrome** (si se abre en otro visor: *Compartir → Abrir con → Chrome*) → ⋮ → *Añadir a pantalla de inicio* (esta opción sí existe siempre).
  - **iPhone:** Apple **no permite** instalar archivos locales (desde *Archivos* no sale *Añadir a pantalla de inicio*). Camino con icono real: desde un PC sube `dist/GestorGastos-PWA-instalable.zip` a Netlify Drop → abre el enlace https en Safari → *Compartir → Añadir a pantalla de inicio*. Sin publicar: úsalo abriéndolo desde *Archivos*.
- **Copias de seguridad:** usa *Ajustes → Descargar Copia (JSON)* y *Exportar CSV* dentro de la propia app. Para pasar datos de un dispositivo a otro, importa ese JSON.
- **Regenerar tras cambios:** `node tools/build-single-html.js`

---

## Opción C — Compilar app nativa (.exe / .dmg / .AppImage / .apk / .ipa)

### C1. Escritorio Windows / Linux / Mac (Electron)
```bash
cd electron-app
npm install
npm start          # probar como app de escritorio
npm run dist:win   # → .exe instalador + portable (en Windows)
npm run dist:linux # → .AppImage + .deb (en Linux)
npm run dist:mac   # → .dmg + .zip (en macOS)
```
Los instaladores salen en `electron-app/dist-electron/`. Ya está preconfigurado (`electron-builder.yml`, icono, menú, apertura de enlaces externos en navegador).

### C2. Android — 2 caminos
**Rápido (TWA / PWABuilder, sin código):**
1. Sube `public/` a HTTPS.
2. Ve a [pwabuilder.com](https://www.pwabuilder.com) → introduce tu URL → *Package for Android* → descarga el `.aab` firmado → súbelo a Google Play.
3. Sube `public/.well-known/assetlinks.json` con tu SHA-256 de Play Console (el archivo ya existe como plantilla).

**Nativo (Capacitor, control total):**
```bash
npm i @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Gestor de Gastos" com.familia.gestorgastos --web-dir=public
npx cap add android
npx cap sync
npx cap open android   # compila el APK/AAB en Android Studio
```
Config base ya incluida en `capacitor.config.json`.

### C3. iOS / macOS App Store (Apple)
```bash
npm i @capacitor/core @capacitor/cli @capacitor/ios
npx cap add ios
npx cap sync
npx cap open ios   # abre Xcode (requiere Mac + cuenta Apple Developer 99 $/año)
```
En Xcode: firma con tu equipo → *Archive* → sube a App Store Connect / TestFlight. Alternativa sin Xcode: PWABuilder → *Package for iOS* (requiere igualmente cuenta Apple para publicar).

---

## ❓ Preguntas rápidas

- **¿Mis datos se sincronizan entre dispositivos?** La PWA guarda en `localStorage` (por dispositivo) y sincroniza con el backend `server.js` (`/api/*`) cuando está disponible. Si usas solo el HTML portable o solo HTTPS estático sin backend, cada dispositivo es independiente: usa *Exportar/Importar JSON* para moverlos.
- **¿Necesito HTTPS en local?** No: `http://localhost:3000` cuenta como contexto seguro y permite instalar + Service Worker.
- **¿Cómo compruebo que es instalable?** Chrome → F12 → *Application → Manifest / Service Workers*. Debes ver el manifest sin errores y el SW en verde. También pasa el test de [pwabuilder.com](https://www.pwabuilder.com).
- **¿Qué iconos usa cada plataforma?** `public/icons/` (72–512 + maskable) + `apple-touch-icon.png` (iOS) + `favicon.ico.png` + `browserconfig.xml` (tiles Windows). No hace falta regenerar nada salvo que cambies el logo.

## 📁 Estructura entregada
```
public/                  → PWA instalable (súbela a HTTPS)
  index.html             → app + banners Instalar/Actualizar/Offline/iOS
  manifest.json          → spec completa multi-plataforma
  sw.js                  → offline-first versionado
  offline.html           → fallback sin conexión
  icons/                 → 72…512 + maskable
  app.js / style.css
dist/GestorGastos-App.html → portable de un clic (Windows/Mac/Linux/Android/iOS)
electron-app/            → .exe/.dmg/.AppImage (Electron + electron-builder)
capacitor.config.json    → base Android/iOS nativo
tools/build-single-html.js → regenera el HTML portable
server.js                → sirve la PWA con cabeceras correctas (SW + manifest)
```
