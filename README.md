# Gestor de Gastos Familiar 💶 — MVP

**Autora:** Alejandra Medina Bobadilla
**Curso:** Vibe Coding e IA Generativa · **Profesor:** José Antonio Delgado Alfonso
**Repositorio:** https://github.com/Alejandra2104/GestorGastos (público, rama `main`, v1.8.0)
**MVP desplegado:** https://alejandra2104.github.io/GestorGastos/index.html?utm_source=pwa
**Memoria de sesiones con IA:** ver `PROMPT-LOG.md`

## 1. Qué problema resuelve

Las familias llevan los gastos en Excel, notas o de memoria: se pierde qué pagó cada miembro, qué es compartido, cuánto se ahorra al mes y qué pasa si un mes no se cumple la meta.

Este MVP es una app familiar compartida, instalable y offline, que permite apuntar gastos/ingresos por miembro, ver el balance, repartir lo compartido, fijar metas de ahorro con plan de recuperación y no perder datos aunque se borre la app.

## 2. Funcionalidades

* **Resumen:** balance neto mensual, ahorro anual, medias 12 meses, gastos fijos programados.
* **Movimientos del mes:** añadir/editar/borrar gasto o ingreso con concepto, cantidad, categoría, fecha, forma de pago (efectivo/tarjeta), miembro y marca de compartido. Filtros por tipo, forma, categoría y miembro.
* **Calendario:** movimientos por día, añadir a fecha concreta. Se ubica en el día y mes actuales por defecto (corrección pedida por la autora, la app no lo hacía).
* **Fijos:** conceptos recurrentes (hipoteca, nóminas, suministros, suscripciones) con día del mes, miembro que paga/cobra, forma de pago (efectivo/tarjeta) y marca de compartido. Nada es compartido por defecto: el cliente lo precisa en Nueva Operación o en el formulario del fijo. Al marcar fijo solo se crea la regla (aparece cada mes con su día), sin duplicar operación puntual.
* **Reparto familiar:** deudas entre miembros con lo marcado como compartido, sea puntual o fijo. Por concepto ("Laura le debe 1.400 € a Alejandro en fijos: Reforma baño") y liquidación total. Gasto compartido: los demás le deben a quien pagó. Ingreso compartido (al revés): quien lo cobró se lo debe a los demás.
* **Metas de ahorro:** meta editable por mes, reparto proporcional por % entre miembros (siempre suma 100 %), barra de progreso, aviso de déficit.
* **Plan de amortización:** si un mes no se ahorra, el siguiente pone de base `lo que falta + extra voluntario`. Recuperación en 2, 4, 6, 8 o 12 meses con opción de saldar antes. Nota: quitar la meta de un mes no cancela su plan (la deuda persiste); el plan solo desaparece con `Saldar Deuda Anticipadamente`. Si un mes ya tiene meta propia mayor que la cuota, se respeta la meta del usuario.
* **Alerta por categoría:** detecta cuando se gasta más en una categoría respecto al mes anterior (solo movimientos de gasto, sin fijos ni ingresos; si el mes anterior no tiene gastos no avisa).
* **Sugerencia de ahorro:** si no se alcanza la meta, propone de qué categorías recortar el mes que viene según tu media de 3 meses, detecta gastos puntuales y avisa si ni recortando todo se cubriría el déficit. Cómo aprende: por cada categoría con gasto ese mes calcula tu media en hasta 3 meses anteriores con movimientos (solo movimientos de gasto: ni ingresos ni fijos, contando 0 € los meses sin gasto en esa categoría); si gastaste por encima de tu media, propone recortar el exceso hasta cubrir lo que falta; si la categoría no tiene historial, la marca como puntual ("no debería repetirse") en vez de pedir recorte; reparte por orden de mayor exceso y, si aun así falta, dice que conviene revisar la meta.
* **Hogar compartido en la nube (Supabase):** vincular teléfonos con un código (`public/nube.js` + `public/nube-config.js`, funciones `obtener_hogar` / `guardar_hogar`). Sin vínculo, todo sigue local.
* **Copia de seguridad:** descarga/importación JSON, exportar a Excel/CSV por mes y por año, y copia personal en la nube por teléfono + PIN (`guardar_respaldo` / `obtener_respaldo` en `public/app.js`) que sobrevive al reset del dispositivo.
* **PWA instalable en cualquier SO:** se pidió en Gemini para instalar la misma app en Windows, macOS, Linux, Android e iOS, con ventana propia y modo offline (`manifest.json`, `sw.js`, `offline.html`, iconos).
* **Navegación móvil (ajuste pedido a Pi):** barra de pestañas (Resumen, Calendario, Fijo, Reparto, Ajustes) arriba en vez de abajo para usarla con el pulgar en el móvil.
* **Banners por sistema operativo (hecho con Pi):** `INSTRUCC-INST/banner-instrucciones.html` detecta Windows / Mac / iPhone-iPad / Android / Linux y explica cómo instalar + botones Instalar/Cerrar.
* **Demo en 1 clic:** `Cargar Datos de Demostración` (marzo–septiembre 2026) + `Restablecer a 0`. Todas las operaciones demo llevan `efectivo/tarjeta` según la lógica actual, y agosto incluye un gasto extraordinario (reforma baño 2.800 €) para mostrar un déficit real frente a la meta y probar el plan de recuperación. Si tras una actualización ves la lógica anterior, pulsa `Restablecer a 0` y `Cargar Datos` de nuevo (el navegador conserva la demo vieja) y recarga fuerte la página.

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
