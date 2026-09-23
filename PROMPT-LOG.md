# PROMPT-LOG.md — Memoria de sesiones con IA

**Proyecto:** Gestor de Gastos Familiar (PWA instalable + local-first)
**Autora:** Alejandra Medina Bobadilla
**Curso:** Vibe Coding e IA Generativa
**Profesor:** José Antonio Delgado Alfonso
**Repositorio:** https://github.com/Alejandra2104/GestorGastos (público, rama `main`)
**MVP desplegado:** https://alejandra2104.github.io/GestorGastos/index.html?utm_source=pwa
**Versión documentada:** v1.7.10
**Fecha límite entrega:** 09/10/2026 23:59 · **Presentación:** 13/10/2026 (5 min)

> Este documento se reconstruye a partir del `git log` del repositorio (commits v1.4.0 → v1.7.10), del código en `public/` + `server.js` y de la memoria de la autora. No se conservaron los prompts literales, así que se describen por intención/resultado verificado en cada commit.

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
| 3. Retoques finales v1.4 → v1.7.10 | Opencode | Aplicó cambios puntuales, temas, fixes, exportaciones | Dirigió cada bug y cada funcionalidad nueva, probó a mano, aceptó/rechazó |

## Sesiones reconstruidas desde `git log`

### S1 — Gemini: prototipo local (antes del log visible)
* **Objetivo pedido:** "crea una app de gastos familiares que corra en local".
* **Resultado IA:** `index.txt` (39 KB, versión monolítica antigua), luego `public/app.js`, formulario gasto/ingreso, balance.
* **Control humano:** prueba manual en navegador. Detectado: faltaba multi-miembro, recurrentes y persistencia clara.

### S2 — Pi: GitHub + PWA instalable + banners por SO
* Commits asociados: `eee211b Hogar compartido: sincronización familiar con código (Supabase)`, `4c6c558 Miembros ilimitados visibles + barra pestañas arriba en móvil`, `ccd56b2 Icono GG + mes/día actuales por defecto`, `0391634 Actualización automática sin reinstalar + versión visible + iconos anti-caché`, `a99a97d Add INSTRUCC-INST banner with OS-specific installation instructions`.
* **Resultado IA:** `manifest.json`, `sw.js`, `browserconfig.xml`, workflow Pages, `nube.js` / `nube-config.js` para hogar compartido.
* **Banners por sistema operativo (pedido por Alejandra a Pi):** `INSTRUCC-INST/banner-instrucciones.html` integrado en `public/index.html`. Detecta `userAgent` (Windows, Mac Safari/Chrome, iPhone/iPad, Android, Linux) y muestra pasos "Instalar app / Añadir a pantalla de inicio" + botones Instalar/Cerrar. Se oculta solo si ya está instalada (`display-mode: standalone`) o si el usuario la cierra. Objetivo: que el cliente sepa descargar la app según su sistema sin ayuda.
* **Bug dirigido por humana (el que más problemas dio):** el hogar compartido en Supabase no guardaba nombres repetidos y los miembros desaparecían al sincronizar —un móvil subía sus datos y borraba al miembro añadido desde el otro—. Causa: fusión por documento completo donde el último en subir ganaba, tanto en el SQL de Supabase (funciones `obtener_hogar` / `guardar_hogar`, que viven en el panel de Supabase: no hay `.sql` en el repo) como en el cliente. Corrección dirigida por Alejandra en dos frentes: SQL corregido en Supabase + fusión convergente en `public/nube.js` (`mergeEstados`, `unirMapas`, lápidas de borrado para que nada resucite, líneas ~128-183) con clave por teléfono + validación. Verificación: dos teléfonos añadiendo miembros a la vez. La app no se ubicaba en el día exacto actual → se pidió que reconozca día y mes actuales por defecto (commit `ccd56b2`).
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

### S6 — Demo actualizada a la lógica nueva (23/09/2026, solo datos, sin tocar código funcional)
* Pedido por Alejandra: los datos de prueba estaban bajo la lógica anterior (sin `efectivo/tarjeta` y sin ejemplo de déficit).
* Cambio: `formaPago` añadido a las 32 operaciones demo en `public/app.js` (`DATOS_DEMO`) y en `server.js` (`/api/simular`), mismo contenido en ambos. Nueva operación `id 132` (reforma baño 2.800 € en agosto) para que agosto dé balance −497,20 € frente a meta 300 € → déficit 797,20 € y se pueda probar el plan de recuperación con arrastre de base al mes siguiente. Septiembre queda sin meta preset en la demo para que la cuota del plan se aplique como base sin depender de los meses elegidos (antes la meta 350 bloqueaba cuotas menores). Verificado con `node --check` y cálculo de balance.

### S7 — Aclaraciones 23/09/2026 (sin cambios de código, decisión de la autora)
* **Quitar meta ≠ cancelar plan (diseño confirmado):** `eliminarMetaAhorro` (`public/app.js:1098`) solo borra la meta del mes; el plan vive en `planesAmortizacion` y `obtenerPlanAmortizacionActivo` (`:648`) lo sigue mostrando en los meses de cuota hasta `Saldar Deuda Anticipadamente` (`:728`). Se deja así a propósito.
* **Errores detectados probando:** demo sin `formaPago` (filtros/etiquetas en blanco), demo sin déficit posible (las nóminas fijas de 4.000 €/mes siempre daban superávit), preset de septiembre (350 €) que bloqueaba cuotas menores del plan (reproducido: con cuota 132,87 € no se aplicaba; sin preset sí). Los tres se corrigieron solo con datos demo.

### S8 — Reparto real entre miembros (23/09/2026, plan aprobado por la autora)
* **Error detectado por Alejandra:** en "Gastos Compartidos" la app mostraba "Fijos" como un miembro, porque los recurrentes se inyectaban con `telefono: "Fijo"` y `esCompartido: true` forzados, y el reparto solo miraba gastos (nunca ingresos).
* **Cambio (funcional, autorizado):** el fijo guarda miembro que paga/cobra + marca de compartido (Nueva Operación, modal de fijos y API en `server.js`); el mes respeta esos datos; el reparto incluye puntuales + fijos compartidos, gastos e ingresos, con deudas por concepto ("N le debe X a N2 en fijos: Netflix"), por categoría y liquidación total. Ingreso compartido al revés: quien lo cobra se lo debe a los demás. Pestaña renombrada a "Fijo". Fijos viejos sin miembro: se reparten a partes iguales sin generar deudas hasta que se les asigne miembro.
* **Demo ajustada en datos:** recurrentes demo con miembro y compartido (hipoteca, seguro, fibra, luz y suscripciones compartidos; nóminas NO compartidas para no distorsionar el reparto). Verificado con `node --check` y simulación del reparto de agosto (Laura debe 1.896,30 € a Alejandro).
* **Incidencia tras el cambio (solo entorno local, no es bug):** el repo ya lleva la lógica nueva (verificado: cero `telefono: "Fijo"` en `public/app.js`), pero el navegador guarda la demo vieja en localStorage y `data.json` local (ignorado por git, nunca se sube) también la conserva. Hay que recargar demo en la app: Ajustes → `Restablecer a 0` → `Cargar Datos de Demostración` (esto también regenera `data.json` vía `/api/simular`). En Pages, esperar 1–2 min al despliegue y recarga fuerte (Ctrl+F5 / botón Actualizar de la PWA).
* **Si aún se ve "Fijo" como miembro, es caché, no datos (diagnóstico 23/09):** con el código nuevo esa tarjeta es imposible (el literal ya no existe en `app.js`). Tres causas: (1) PWA sirviendo `app.js` viejo desde el Service Worker — pulsar `Actualizar` en el aviso de nueva versión y recargar dos veces; (2) estar abriendo `dist/GestorGastos-App.html` del 16/09, que contiene el código viejo (verificado 1 resto) — no usarlo o regenerarlo; (3) demo vieja en localStorage — `Restablecer a 0` + `Cargar Datos`. Prueba rápida: si no aparecen las secciones "Deudas por concepto" y "Deudas por categoría", se está ejecutando el código viejo.

### S9 — Fijo único + pago en fijos + aviso de actualización (23/09/2026, autorizado por la autora)
* **Pedidos por Alejandra:** (1) al marcar fijo solo debe crearse la regla (antes duplicaba puntual + fijo); (2) los fijos deben reflejar efectivo/tarjeta; (3) quitar "Deudas por categoría" por redundante con "Deudas por concepto"; (4) forzar el aviso "Hay una nueva versión" en todos los dispositivos, ya que el caché bugeado era lo único que impedía ver la interfaz nueva.
* **Cambio:** `guardarOperacion` crea solo el recurrente si es fijo (con miembro, compartido y pago); modal/API/inyección/tarjetas con `formaPago`; eliminada la sección y lógica de deudas por categoría; `sw.js` v1.8.4 → v1.8.5 para disparar la barra de actualización en cada dispositivo (el mecanismo ya estaba cableado en `index.html`). Demo con pagos en fijos. Verificado con `node --check`, sin restos de la sección eliminada.

### S10 — Banner de gasto por categoría sin límite (23/09/2026, v1.7.8 → v1.7.10)
* Commits: `bb697d4 Banner spike sin limite + v1.7.8`, `1642f92 Banner spike solo subidas + v1.7.9`, `06fce87 Banner spike texto solo diferencia + v1.7.10`.
* **Error detectado por Alejandra probando con datos nuevos (no demo):** en agosto puso 30 € en Transporte y en septiembre 60 € (+30 €) y el banner de la Meta de Ahorro no salía, mientras que en la demo sí (Otros +85 €). Causa: `renderSpikeBanner` (`public/app.js:1324`) exigía `diff >= 40` y solo mostraba la categoría con mayor subida.
* **Cambios pedidos por la autora:** (1) sin límite mínimo —cualquier subida ≥ 0,01 € avisa— y todas las categorías con subida, no solo la mayor (v1.7.8 llegó a mostrar también bajadas y en v1.7.9 se dejó solo en subidas a petición expresa: si no hay más gasto, no aparece); (2) texto simplificado —antes `En "Alimentación" habéis gastado 60.00 € (+30.00 € más que en Agosto)`, ahora `En "Alimentación" habéis gastado 30.00 € más que en Agosto`—.
* **Verificación:** simulación (30→60 muestra, bajadas e iguales ocultan, demo Sept solo `Otros +85`), `node --check` OK, versión visible + `?v=` y SW (`v1.8.6` → `v1.8.8`) subidos en cada cambio con push a `main` (Pages redespliega solo `public/`).

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
