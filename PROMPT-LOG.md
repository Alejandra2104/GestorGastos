# PROMPT-LOG.md — Memoria de sesiones con IA

**Proyecto:** Gestor de Gastos Familiar (PWA instalable + local-first)
**Autora:** Alejandra Medina Bobadilla
**Curso:** Vibe Coding e IA Generativa
**Profesor:** José Antonio Delgado Alfonso
**Repositorio:** https://github.com/Alejandra2104/GestorGastos (público, rama `main`)
**MVP desplegado:** https://alejandra2104.github.io/GestorGastos/index.html?utm_source=pwa
**Versión documentada:** v1.7.7
**Fecha límite entrega:** 09/10/2026 23:59 · **Presentación:** 13/10/2026 (5 min)

> Este documento se reconstruye a partir del `git log` del repositorio (commits v1.4.0 → v1.7.7), del código en `public/` + `server.js` y de la memoria de la autora. No se conservaron los prompts literales, así que se describen por intención/resultado verificado en cada commit.

## Stack real (verificado en repo)

* Frontend: `public/index.html` (990 líneas), `public/app.js`, `public/style.css` — vanilla JS, sin framework.
* PWA instalable en cualquier sistema operativo (decisión pedida por Alejandra en Gemini): `public/manifest.json`, `public/sw.js`, `public/offline.html`, iconos en `public/icons/`, `browserconfig.xml`, `apple-touch-icon.png`. Permite instalar la misma app en Windows, macOS, Linux, Android e iOS, con ventana propia y funcionamiento offline (Service Worker + LocalStorage).
* Despliegue: GitHub Pages con workflow `.github/workflows/deploy-pages.yml` que publica solo la carpeta `public/` en cada push a `main`. Por eso el `index.html` de la raíz (`<h1>Actualizado</h1>`, 46 bytes) **no afecta** al despliegue.
* Opcional local: `server.js` (Express, API `/api/datos`, `/api/transaccion`, etc.) + `data.json`. La app funciona 100 % sin backend (LocalStorage).
* Distribuibles: `dist/GestorGastos-App.html`, `dist/GestorGastos-PWA-instalable.zip`, scripts `Instalar-*.bat/.sh/.command`.
* URLs temporales `trycloudflare.com` (`URL-HTTPS.txt`, `tunnel.url`, `https-launcher.log`) solo sirvieron para probar en móvil, **no son el entregable**.

## Aviso para el profesor: qué evaluar (no se tocó código, solo se documenta)

Sí, la app se centra solo en `public/`. El resto de carpetas son restos que se fueron generando con Gemini / pruebas locales antes de lanzarla, se dejan igual para no romper nada.

* **Índice válido:** `public/index.html` (990 líneas, 61 KB). Es lo que publica GitHub Pages vía `.github/workflows/deploy-pages.yml` (`path: public`). El `index.html` de la raíz (46 bytes, `<h1>Actualizado</h1>`) es un resto antiguo y **no se usa** en el despliegue.
* **Núcleo a evaluar:** `public/index.html` + `public/app.js` + `public/style.css` + `public/manifest.json` + `public/sw.js` + `public/offline.html` + `public/icons/`. Opcional en local: `server.js` + `data.json` (API Express, la app funciona sin él con LocalStorage).
* **Mapa de carpetas/archivos auxiliares (no evaluar como parte del MVP):**
  * `electron-app/` — prueba de empaquetado a .exe/.dmg con Electron, no se usa en Pages.
  * `capacitor.config.json` — prueba de app móvil nativa, no se usa en Pages.
  * `tools/` (`build-single-html.js`, `zip-pwa.py`, `https.js`, `cloudflared.exe`, `make-icons.py`) — scripts para generar `dist/`, probar HTTPS temporal y crear iconos.
  * `dist/` (`GestorGastos-App.html`, `GestorGastos-PWA-instalable.zip`, `Instalar-*.bat/.sh/.command`) — distribuibles portables generados, solo alternativa al enlace.
  * `Gastos/`, `INSTRUCC-INST/`, `index.txt` (39 KB), `INSTALAR-APP.md`, `QR-APP.png` — borradores, instrucciones y versión monolítica antigua de Gemini.
  * `node_modules/`, `package-lock.json` — dependencias de `express` para `server.js` local.
  * `URL-HTTPS.txt`, `tunnel.url`, `https-launcher.log` — túneles Cloudflare temporales para probar en el móvil.

## Resumen de fases con IA

| Fase | Herramienta | Qué hizo la IA | Qué hizo Alejandra (dirección) |
|------|-------------|----------------|--------------------------------|
| 1. Código inicial en local + PWA | Gemini | Generó la APP base: balance mensual, añadir gasto/ingreso, categorías, LocalStorage, diseño inicial + la convirtió en PWA (`manifest.json`, `sw.js`, iconos) para instalar en cualquier SO | Pidió expresamente que fuera instalable en Windows/Mac/Linux/Android/iOS, probó en local, detectó que faltaba visión familiar |
| 2. Subida a GitHub + carpeta | Pi | Ayudó a correr el proyecto en GitHub, organizar `public/`, crear `deploy-pages.yml`, subir artefactos | Decidió estructura `public/` como publicable, verificó Pages |
| 3. Retoques finales v1.4 → v1.7.7 | Opencode | Aplicó cambios puntuales, temas, fixes, exportaciones | Dirigió cada bug y cada funcionalidad nueva, probó a mano, aceptó/rechazó |

## Sesiones reconstruidas desde `git log`

### S1 — Gemini: prototipo local (antes del log visible)
* **Objetivo pedido:** "crea una app de gastos familiares que corra en local".
* **Resultado IA:** `index.txt` (39 KB, versión monolítica antigua), luego `public/app.js`, formulario gasto/ingreso, balance.
* **Control humano:** prueba manual en navegador. Detectado: faltaba multi-miembro, recurrentes y persistencia clara.

### S2 — Pi: GitHub + PWA instalable + banners por SO
* Commits asociados: `eee211b Hogar compartido: sincronización familiar con código (Supabase)`, `4c6c558 Miembros ilimitados visibles + barra pestañas arriba en móvil`, `ccd56b2 Icono GG + mes/día actuales por defecto`, `0391634 Actualización automática sin reinstalar + versión visible + iconos anti-caché`, `a99a97d Add INSTRUCC-INST banner with OS-specific installation instructions`.
* **Resultado IA:** `manifest.json`, `sw.js`, `browserconfig.xml`, workflow Pages, `nube.js` / `nube-config.js` para hogar compartido.
* **Banners por sistema operativo (pedido por Alejandra a Pi):** `INSTRUCC-INST/banner-instrucciones.html` integrado en `public/index.html`. Detecta `userAgent` (Windows, Mac Safari/Chrome, iPhone/iPad, Android, Linux) y muestra pasos "Instalar app / Añadir a pantalla de inicio" + botones Instalar/Cerrar. Se oculta solo si ya está instalada (`display-mode: standalone`) o si el usuario la cierra. Objetivo: que el cliente sepa descargar la app según su sistema sin ayuda.
* **Bug dirigido por humana:** Hogar compartido Supabase no guardaba nombres repetidos → se pidió corrección de clave por teléfono + validación. La app no se ubicaba en el día exacto actual → se pidió que reconozca día y mes actuales por defecto (commit `ccd56b2`).
* **Verificación:** despliegue Pages OK, instalación como app en Android/Windows.

### S3 — Opencode: temas y categorías (v1.4.0 → v1.7.3)
* Commits: `f090ab6 Tema verde grisáceo (sage) + v1.4.0`, `22ea4a8 Meta sin valor por defecto + resto azules a verde grisáceo (v1.5.0)`, `44a8ab1 Revertir al morado original (v1.6.0)`, `998db49 Tema morado intenso + v1.7.0`, `9ba66c1 / a682459 / 880be84 Categorías con colores distintos, sin verde/rojo, Otros en rosa`.
* **Rol humano:** decisión estética (volver al morado), pedir que categorías no usen verde/rojo para no confundir con ingresos/gastos.
* **Error IA detectado:** usar verde/rojo en categorías confundía al usuario → detectado visualmente, corregido por instrucción explícita.

### S4 — Opencode: operaciones y reparto (v1.7.4 → v1.7.5)
* Commits: `eb459ca Nueva operación siempre visible en Movimientos del Mes (salto a su mes, limpia filtros, resalta) + v1.7.4`, `1bacaa7 Remove 50/50 text; meta shared checkboxes + %`, `dc90f1e Complete edits: efectivo/tarjeta, shared meta, déficit fix, member selection, banner`, `34b02b6 Puntos 1-4 + v1.7.5`.
* **Bugs que dirigió Alejandra:**
  1. Movimientos del mes no aparecían (había que regenerar código de esa parte desde 0).
  2. Texto "50/50" incorrecto cuando el reparto era proporcional → eliminado.
  3. Forma de pago efectivo/tarjeta no se guardaba bien.
* **Funcionalidades añadidas a petición humana:**
  * Reparto proporcional por % en metas compartidas (checkboxes + cálculo reactivo que siempre suma 100 %).
  * Meta editable aunque ya exista (antes quedaba predeterminada y no se podía cambiar).
  * Exportar a Excel/CSV por mes y por año + copia de seguridad JSON (`Descargar Copia`, `Importar Copia`).
  * Detección de "has gastado más en X categoría respecto al mes anterior" (comparativa mensual).

### S5 — Opencode: amortización y nube (hogar + respaldo personal, v1.7.6 → v1.7.7)
* Commits: `9888ebf Fix Quitar meta: no se repone sola la base de amortización + v1.7.6`, `2d3f366 Respaldo personal teléfono+PIN, reset solo-dispositivo + v1.7.7`.
* **Nube (trabajo reciente, va a Supabase, verificado en código):**
  * Hogar compartido: `public/nube.js` + `public/nube-config.js` (`SUPABASE_URL rvtpplccjdjmskatexun.supabase.co`, funciones `obtener_hogar` / `guardar_hogar`). Sincroniza con código de hogar al arrancar, cada 30 s y en vivo. Si no hay vínculo, la app sigue 100 % local.
  * Copia de seguridad personal: `public/app.js` líneas ~2683-2922 (`guardar_respaldo` / `obtener_respaldo`, `respaldoPersonalRPC`, `subidaRespaldoPersonal`). Guarda por teléfono + PIN de 4-8 dígitos y sobrevive al "Restablecer a 0". Se recupera con número + PIN aunque se borre la app.
  * Dónde aparece para el profesor: esto se documenta aquí (apartado 4, proceso con IA) y debe resumirse en el apartado 3 (`README.md` → funcionalidades "Hogar en la nube" y "Copia personal en la nube") y demostrarse en el apartado 5 (presentación).
* **Lógica dirigida por humana (núcleo del MVP):**
  * Si no se ahorra un mes, el mes siguiente pone de base `lo que falta del mes anterior + lo que quiera añadir el cliente`.
  * Plan de recuperación en 2, 4, 6, 8 o 12 meses con opción `Saldar Deuda Anticipadamente`.
  * Copia personal por teléfono + PIN (`Mi copia personal`) + `Restablecer a 0 solo este dispositivo` para no perder datos al borrar la app.
* **Error IA detectado:** al pulsar "Quitar meta" la base de amortización se reponía sola → detectado probando a mano, fix en v1.7.6.
* **Prompts tipo (reconstruidos):** "cuando quite la meta no la repongas", "guarda mi copia por teléfono y PIN para recuperarla si borro la app", "permite saldar la deuda antes de tiempo".

## Qué hizo la IA vs qué hizo la humana (para el informe)

* **IA:** generó ~90 % del código base, PWA, temas, CRUD, gráficos, Supabase, exports.
* **Humana:** definió problema familiar compartido, probó todo a mano, detectó 6+ bugs, diseñó 6 funcionalidades diferenciales (porcentaje metas, arrastre déficit, alerta por categoría, amortización flexible, Excel por mes/año, copia teléfono+PIN), decidió local-first y validó el despliegue Pages.
* **Cómo se detectaron errores:** prueba manual con datos de demostración (`Cargar Datos de Demostración` con meses marzo-septiembre 2026), comprobar filtros de mes, quitar/poner metas, probar con dos teléfonos (600111222 / 600333444).

## Para reproducir la evidencia

```bash
git log --oneline -20
npm start  # http://localhost:3000 (opcional, la app va sin backend)
```

Despliegue estable: `https://alejandra2104.github.io/GestorGastos/index.html` (GitHub Actions → Pages desde `public/`).
Pruebas temporales Cloudflare (no entregables): `tools/https.js` + `tools/cloudflared.exe` publican `http://localhost:3000` en una URL `https://*.trycloudflare.com` (guardada en `URL-HTTPS.txt` + `QR-APP.png`). Sirvió antes de Pages para probar/instalar la PWA en el móvil, porque instalar PWA exige HTTPS. Cambia en cada arranque y muere al apagar el PC o pulsar Ctrl+C. Hoy ya no hace falta.
