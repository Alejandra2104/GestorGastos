# Gestor de Gastos Familiar 💶 — MVP

**Autora:** Alejandra Medina Bobadilla
**Curso:** Vibe Coding e IA Generativa · **Profesor:** José Antonio Delgado Alfonso
**Repositorio:** https://github.com/Alejandra2104/GestorGastos (público, rama `main`, v1.7.7)
**MVP desplegado:** https://alejandra2104.github.io/GestorGastos/index.html?utm_source=pwa
**Memoria de sesiones con IA:** ver `PROMPT-LOG.md`

## 1. Qué problema resuelve

Las familias llevan los gastos en Excel, notas o de memoria: se pierde qué pagó cada miembro, qué es compartido, cuánto se ahorra al mes y qué pasa si un mes no se cumple la meta.

Este MVP es una app familiar compartida, instalable y offline, que permite apuntar gastos/ingresos por miembro, ver el balance, repartir lo compartido, fijar metas de ahorro con plan de recuperación y no perder datos aunque se borre la app.

## 2. Funcionalidades

* **Resumen:** balance neto mensual, ahorro anual, medias 12 meses, gastos fijos programados.
* **Movimientos del mes:** añadir/editar/borrar gasto o ingreso con concepto, cantidad, categoría, fecha, forma de pago (efectivo/tarjeta), miembro y marca de compartido. Filtros por tipo, forma, categoría y miembro.
* **Calendario:** movimientos por día, añadir a fecha concreta.
* **Gastos fijos:** conceptos recurrentes (hipoteca, nóminas, suministros, suscripciones) con día del mes.
* **Reparto familiar:** cálculo automático de saldos compartidos por teléfono/miembro.
* **Metas de ahorro:** meta editable por mes, reparto proporcional por % entre miembros (siempre suma 100 %), barra de progreso, aviso de déficit.
* **Plan de amortización:** si un mes no se ahorra, el siguiente pone de base `lo que falta + extra voluntario`. Recuperación en 2, 4, 6, 8 o 12 meses con opción de saldar antes.
* **Alerta por categoría:** detecta cuando se gasta más en una categoría respecto al mes anterior.
* **Hogar compartido en la nube (Supabase):** vincular teléfonos con un código (`public/nube.js` + `public/nube-config.js`, funciones `obtener_hogar` / `guardar_hogar`). Sin vínculo, todo sigue local.
* **Copia de seguridad:** descarga/importación JSON, exportar a Excel/CSV por mes y por año, y copia personal en la nube por teléfono + PIN (`guardar_respaldo` / `obtener_respaldo` en `public/app.js`) que sobrevive al reset del dispositivo.
* **PWA instalable en cualquier SO:** se pidió en Gemini para instalar la misma app en Windows, macOS, Linux, Android e iOS, con ventana propia y modo offline (`manifest.json`, `sw.js`, `offline.html`, iconos).
* **Banners por sistema operativo (hecho con Pi):** `INSTRUCC-INST/banner-instrucciones.html` detecta Windows / Mac / iPhone-iPad / Android / Linux y explica cómo instalar + botones Instalar/Cerrar.
* **Demo en 1 clic:** `Cargar Datos de Demostración` (marzo–septiembre 2026) + `Restablecer a 0`.

## 3. Stack

* Frontend vanilla sin framework: `public/index.html` (990 líneas), `public/app.js`, `public/style.css`.
* PWA: `public/manifest.json`, `public/sw.js`, `public/offline.html`, `public/icons/`, `browserconfig.xml`.
* Nube opcional: Supabase (`public/nube.js`, `public/nube-config.js`).
* Local opcional: Node + Express `server.js` + `data.json` (API `/api/datos`, `/api/transaccion`…). La app funciona 100 % sin backend con LocalStorage.
* Despliegue: GitHub Pages con `.github/workflows/deploy-pages.yml` (publica solo `public/` en cada push a `main`).

## 4. Cómo ejecutarlo

**Opción A — enlace (recomendada para evaluar):**
Abre https://alejandra2104.github.io/GestorGastos/index.html en Chrome/Edge/Safari → botón `Cargar Datos de Demostración` en Ajustes.

**Opción B — en local sin backend:**
Descarga el repo, abre `public/index.html` con doble clic o con `npx serve public`.

**Opción C — en local con backend opcional:**
```bash
npm install
npm start
# http://localhost:3000
```

**Instalar como app:** abre el enlace HTTPS → Chrome/Edge: icono Instalar en la barra → iPhone/iPad: Safari Compartir → Añadir a pantalla de inicio. Los banners de la app guían según tu sistema.

## 5. Aviso importante: qué archivo evaluar

El índice válido es **`public/index.html`**. Es lo que publica Pages. El `index.html` de la raíz es un resto antiguo (`<h1>Actualizado</h1>`) y no se usa — se deja intacto para no romper nada.

El resto de carpetas son pruebas generadas durante el desarrollo y no forman parte del MVP: `electron-app/` (.exe), `capacitor.config.json` (móvil nativo), `tools/` + `dist/` (portable/zip), `Gastos/`, `INSTRUCC-INST/` (borrador del banner), `index.txt` (versión monolítica antigua), `URL-HTTPS.txt` / `tunnel.url` (túneles Cloudflare temporales para probar en el móvil antes de Pages), `node_modules/`. Detalle completo en `PROMPT-LOG.md`.

## 6. Enlace al despliegue

https://alejandra2104.github.io/GestorGastos/index.html?utm_source=pwa
