# PROMPT-LOG.md — Memoria de sesiones con IA

**Proyecto:** Gestor de Gastos Familiar (PWA instalable + local-first)
**Autora:** Alejandra Medina Bobadilla
**Curso:** Vibe Coding e IA Generativa
**Profesor:** José Antonio Delgado Alfonso
**Repositorio:** https://github.com/Alejandra2104/GestorGastos (público, rama `main`)
**MVP desplegado:** https://alejandra2104.github.io/GestorGastos/index.html?utm_source=pwa
**Versión documentada:** v1.9.12
**Fecha límite entrega:** 09/10/2026 23:59 · **Presentación:** 13/10/2026 (5 min)

> Este documento se reconstruye a partir del `git log` del repositorio (commits v1.4.0 → v1.9.0), del código en `public/` + `server.js` y de la memoria de la autora. No se conservaron los prompts literales, así que se describen por intención/resultado verificado en cada commit.

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
| 2. Subida a GitHub + carpeta | Pi | Ayudó a correr el proyecto en GitHub, organizar `public/`, crear `deploy-pages.yml`, subir artefactos, conectar Supabase y ajustes estéticos (barra de pestañas arriba) | Decidió estructura `public/` como publicable, pidió la conexión a Supabase y la barra arriba para el móvil, verificó Pages |
| 3. Retoques finales v1.4 → v1.9.11 | Opencode | Aplicó cambios puntuales, temas, fixes, exportaciones | Dirigió cada bug y cada funcionalidad nueva, probó a mano, aceptó/rechazó |

## Sesiones reconstruidas desde `git log`

### S1 — Gemini: prototipo local (antes del log visible)
* **Objetivo pedido:** "crea una app de gastos familiares que corra en local".
* **Resultado IA:** `index.txt` (39 KB, versión monolítica antigua), luego `public/app.js`, formulario gasto/ingreso, balance.
* **Control humano:** prueba manual en navegador. Detectado: faltaba multi-miembro, recurrentes y persistencia clara.

### S2 — Pi: GitHub + PWA instalable + banners por SO
* Commits asociados: `eee211b Hogar compartido: sincronización familiar con código (Supabase)`, `4c6c558 Miembros ilimitados visibles + barra pestañas arriba en móvil`, `ccd56b2 Icono GG + mes/día actuales por defecto`, `0391634 Actualización automática sin reinstalar + versión visible + iconos anti-caché`, `a99a97d Add INSTRUCC-INST banner with OS-specific installation instructions`.
* **Resultado IA:** `manifest.json`, `sw.js`, `browserconfig.xml`, workflow Pages, `nube.js` / `nube-config.js` para hogar compartido (conexión a Supabase hecha con Pi: funciones `obtener_hogar` / `guardar_hogar`, vínculo por código de hogar).
* **Ajuste estético pedido por Alejandra a Pi:** la barra de pestañas (Resumen, Calendario, Fijo, Reparto Familiar, Ajustes) estaba abajo y se subió arriba (`nav.tabs-nav` en `public/index.html:128`, estilos `.tabs-nav` en `public/style.css:302`) para que fuera más funcional en la app de móvil.
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

### S11 — Banner solo con movimientos de gasto y con previo (23/09/2026, v1.7.11)
* Commit: `7ee7014 Banner solo movimientos de gasto, sin gastos previos no sale + v1.7.11`.
* **Caso de Alejandra con datos nuevos (no demo):** solo tenía datos en septiembre y en agosto nada (ni fijos ni movimientos), y el banner decía "has gastado X más que en agosto" comparando contra 0.
* **Regla pedida por la autora:** el banner usa solo movimientos de gasto (`estado.transacciones` tipo gasto: ni ingresos ni fijos); si el mes anterior no tiene ningún gasto (vacío o solo ingresos) no sale nada; si sí tiene, salen las categorías con subida (ambos meses o nuevas de este mes, p. ej. `Otros +85`) con el texto corto `En "X" habéis gastado 30.00 € más que en Agosto`.
* **Verificación:** septiembre-solo queda oculto, agosto-solo-ingreso queda oculto, Ago 30 / Sep 60 en Transporte muestra +30, demo septiembre sigue mostrando solo `Otros +85` (agosto demo sí tiene gastos), `node --check` OK, versión + SW (`v1.8.9`) y push a `main`.

### S12 — Sugerencia de ahorro por categorías (23/09/2026, probada en rama y aprobada, v1.7.12)
* Commits: `e111880 PRUEBA: sugerencia de ahorro por categorias en banner de deficit` (rama `prueba-sugerencia-ahorro`, fusionada a `main`).
* **Idea de Alejandra:** si no se alcanza la meta del mes, que la app sugiera de qué categorías ahorrar y cuánto para el mes siguiente, aprendiendo de los hábitos de gasto.
* **Implementación (solo con datos que la app ya guarda, sin IA externa):** nueva caja `sugerenciaAhorroBox` en el banner de déficit (`public/index.html`) + `renderSugerenciaAhorro` (`public/app.js`). Con el déficit ya calculado, reparte recortes por exceso sobre la media de hasta 3 meses anteriores (solo movimientos de gasto: ni ingresos ni fijos), detecta puntuales sin historial (p. ej. reforma 2.800 € en Vivienda) y avisa si ni recortando todo se cubre ("convendría revisar la meta"). Si no hay gastos ese mes, lo dice en vez de sugerir.
* **Prueba dirigida por la autora:** rama aparte sin tocar `main` ni la demo (`DATOS_DEMO` intacta); probada en local con la demo de agosto (déficit 797,20 €: sugiere Alimentación 73,03 € + Salud 28,33 € + Transporte 5,33 €, marca Vivienda/Moda como puntuales y avisa de 690,51 € restantes); aprobada y fusionada con subida de versión + SW (`v1.8.10`).

### S13 — Miembros directos en Nueva Operación + regla de versión en cada cambio (26/09/2026, v1.8.0)
* **Fallo detectado por Alejandra:** los miembros salían en "Miembros registrados" pero el desplegable de Nueva Operación quedaba vacío tras cerrar y abrir la app; había que pulsar "Guardar" en cada miembro para poder operar.
* **Causa:** `cargarSelectCategorias()` → `actualizarSelectUsuarios()` se ejecutaba con `estado.usuarios` aún vacío, y `cargarDatosServidor()` rellenaba `estado.usuarios` después sin repintar los desplegables. Cuando Supabase respondía bien, `aplicarEstado()` lo repintaba a los ~2,5 s y tapaba el fallo; si la nube fallaba, se veía. Por eso "no pasaba siempre".
* **Cambio (autorizado):** en `cargarDatosServidor()` (`public/app.js`), tras `actualizarVistas()` se llama a `actualizarSelectUsuarios()` para repoblar `opTelefono` / `recTelefono` / `filterUsuario` con lo guardado (demo Laura + Alejandro o miembros propios). El botón Guardar queda solo para renombrar, no para activar.
* **Regla pedida por la autora desde ahora:** con cualquier cambio funcional se sube siempre la versión visible + `?v=` (`style.css`, `app.js`, `nube.js` en `public/index.html`) + `CACHE_VERSION` en `public/sw.js` para forzar el aviso "Hay una nueva versión" en la PWA. Versión app → v1.8.0 (salto menor por arreglo visible; mejor que v1.7.13), SW → v1.8.11. Verificado con `node --check` y push a `main` (Pages redespliega solo `public/`).

### S14 — Atajo a Miembros, gráfica por miembro y arranque a 0 (26/09/2026, v1.9.0)
* **P3 pedido por Alejandra:** en Nueva Operación, si no hay miembros, el campo "Miembro que paga/cobra" muestra un aviso con botón "Ir a crear miembros" (`opSinMiembrosHint` en `public/index.html` + `irACrearMiembros()` en `public/app.js`: cierra el modal, va a Reparto Familiar y enfoca el teléfono). Solo sale con 0 miembros. Una vez guardados ya salen siempre en Nueva Operación (fix v1.8.0), también tras recuperar la copia personal o la del hogar (ambas restauraciones ya repintaban los desplegables).
* **P4 pedido por Alejandra:** nueva tarjeta en Resumen "Gastos e Ingresos por Miembro" (`cardChartMiembros` + `renderChartMiembros()`): barras por miembro del mes seleccionado con leyenda de totales. Oculta con menos de 2 miembros.
* **P5 pedido por Alejandra:** el cliente nuevo empieza con todo a 0 —`cargarDatosServidor()` ya no siembra `DATOS_DEMO` si no hay local (la demo sigue en Ajustes → "Cargar Datos de Demostración")—. Nuevo banner `demoDataBar` debajo del de instalación ("¿Quieres probar la app con datos ficticios? Vete a Ajustes → Cargar datos de demostración", con ir/cerrar y memoria `demo_data_dismissed`); solo sale con la app vacía. Deduplicado de banners de descarga: `instructBanner` solo se muestra si `pwaInstallBar` y la ayuda iOS siguen ocultos (retardo 3 s) —siempre 1 banner de instalación como máximo.
* **Versión:** app → v1.9.0 (funcionalidades nuevas), SW → v1.8.12. Verificado con `node --check` y push a `main`.

### S15 — Amortización real v1.9.1 (30/09/2026, acordado con Alejandra, 5 puntos)
* **P1 Descuento real:** antes el `saldoPendiente` nunca bajaba (solo liquidaba si el superávit de un mes cubría toda la deuda). Ahora `conciliarPlanesAlCambiarMes()` aplica cada mes cerrado: `saldo -= balance` (si ahorras 150€ de 600€ quedan 450€; si gastas 50€ de más sube a 650€; si lo dejas a 0 se mantiene). Si acabas antes, los meses siguientes quedan libres y se autoliquida.
* **P2 Prórroga solo al final 2/4/6/8/12:** eliminado botón "prorrogar hasta 12" durante el plan y prórroga automática. Nuevo `boxProrrogaFinal` (`selectMesesProrrogaFinal` + `aplicarProrrogaElegida()`) que solo sale en `Mes N/N` o más allá con saldo. Cálculo corregido: `cuota = saldo / meses nuevos` (antes `saldo / 12 totales`).
* **P3 Un solo plan:** `obtenerUnicoPlanVivo()` + fusión en `aplicarPlanProrrateo()`: si ya hay plan, el nuevo déficit se suma (`saldo += déficit`) y se recalcula cuota única sobre los meses futuros (no se crean planes solapados invisibles).
* **P4 Céntimos exactos:** `repartirCuotasExactas()` reparte al céntimo (100€/6 = 4x16.67 + 2x16.66, suma 100€) vía `cuotasPorMes` por mes; tolerancia ≤0.05€ se da por saldada.
* **P5 Pack siempre junto:** número + cartel + `Mes X/Y` + `Saldar` siempre a la vez; `liquidarPlanYLiberarMetas()` + `limpiarMetasFuturasDePlan()` borran metas huérfanas (antes quedaba el número sin cartel). Nuevo aviso `lblAmortAportado` (`llevas X de Y`) + `lblAmortRetraso` (`vas con X de retraso: este mes solo debes la cuota, al final se recalcula` / `vas adelantado` / `vas al día`). Si el plan termina con deuda, el banner pasa a "Plan terminado: queda saldo" con selector de prórroga.
* **Versión:** app → v1.9.1, SW → v1.8.13. Verificado con `node --check` + simulación (100/6 exacto, 600-150=450, skip mantiene, -50 sube, prórroga 200/6=33.33) y push a `main`.

### S16 — Demo presentación 5 min v1.9.2 (30/09/2026, pedida por Alejandra)
* **Ideas pedidas:** la demo vieja (nóminas 4.000€, reforma 2.800€) daba balances de 2.500€ y no servía para contar la historia 300/150/75/65 ni cabía en 5 min. Se mantienen Alejandro y Laura, los 7 fijos (mismos conceptos/miembros/compartidos/pagos), categorías, reparto, gráficos por miembro, spike y sugerencia; solo se reescalan importes.
* **Cambio (solo datos, `public/app.js` + `server.js` mismo contenido):** fijos base 520€ (nóminas 900+700, alquiler 900, seguro 50, fibra 40, luz 60, subs 30). Historia: Jun 300/300 verde; Jul 150/300 déficit 150€ (Alimentación 330 vs 180 = spike +150, Ocio 70 puntual, sugerencia recorte 150); plan 2 meses 75+75 Ago/Sep (presentadora lo crea en directo); Ago 65/75 (faltan 10, saldo 85, retraso 10); Sep 0/75 fin de plan (deuda 85, caja prórroga 2/4/6/8/12). Ramas Sep en directo: +85€ (balance 85, superávit 10, Saldar manual) y +100€ extra (balance 185, superávit 110, autoliquida). Mar-May en verde como fondo de medias. Ago/Sep sin meta preset para que el plan ponga la base.
* **Verificación:** cálculo de balances (Mar 300, Abr 340, May 300, Jun 300, Jul 150, Ago 65, Sep 0), `node --check` app.js + server.js OK, versión + SW y push a `main`. Para verla: Ajustes → Restablecer a 0 → Cargar Datos.

### S17 — Aportado en directo v1.9.3 (30/09/2026, fallo visto por Alejandra)
* **Fallo:** en agosto con 65 € el banner decía `0 de 150` y `Vas al día`, porque el aportado solo sumaba meses cerrados y el aviso no miraba este mes.
* **Cambio:** el aportado suma lo de este mes en vivo (65 € se ven como 65 de 150 al momento) y el aviso dice lo que falta este mes (`Te faltan 10 € este mes`) más el retraso total si lo hay (`...y vas con 85 € de retraso total`). La autoliquidación pasa de `superávit >= saldo` a `aportado >= total` (coherente: 65+85=150 liquida solo; con 75 justos queda 10 € para Saldar manual).
* **Versión:** app → v1.9.3, SW → v1.8.15. Verificado con `node --check` + simulación de los 7 casos (ago 65/0/80, sep 0/75/85/175) y push a `main`.

### S18 — Saldo en directo + sin mini-planes v1.9.4 (30/09/2026, pedido por Alejandra)
* **Pedidos:** (1) el `Saldo total pendiente` también debe moverse en vivo (metes 75 € debiendo 85 € y debe marcar 10 €); (2) a mitad de plan no debe ofrecerse otro plan para el desfase (lía: ¿los 10 € de agosto generan otro plan de N meses?) — el desfase debe acumularse y ajustarse en la prórroga final.
* **Cambios:** `lblAmortSaldoPendiente` muestra `saldo - lo de este mes` en directo (igual en el banner final); en meses cubiertos por el plan se ocultan los controles `¿Deseáis amortizar este desfase en...?` + `Aplicar` y sale `📌 Este desfase de X € se acumula al plan actual y se ajustará en la prórroga` (se mantienen déficit, desglose y sugerencia); `aplicarPlanProrrateo()` rechaza crear plan en mes cubierto (el único camino es la prórroga final o la fusión desde meses no cubiertos).
* **Versión:** app → v1.9.4, SW → v1.8.16. Verificado con `node --check` y push a `main`.
* **Nota:** la v1.9.5 (doble conteo al volver de mes) se revirtió a petición de la autora (`6e9d522`); su fix vuelve en v1.9.6.

### S19 — Plan que se rehace + déficit afinado + prórroga en 2 pasos v1.9.6 (30/09/2026, 7 puntos de Alejandra)
* **Bugs:** (1) aplicar con otros meses sumaba en vez de rehacer (6→2 se quedaba en 6); (2) cada clic duplicaba la deuda (150+150); (3) mes preseleccionado (6 por defecto).
* **Cambios:** `aplicarPlanProrrateo()` REHACE el plan único con meses frescos (limpia cuotas viejas que ya no tocan, respeta el mes actual y lo quitado a mano); dinero nuevo contado una vez (sin plan: déficit entero; mes cubierto: solo el extra; resto: déficit entero); a repartir se descuenta la meta actual si cubre (150+25−100=75); desplegables sin defecto (`Elige meses…`, obligatorio). Déficit: sin plan / con extra / en prórroga; en plan normal cubierto no sale (solo el plan). Prórroga: `Plan terminó, quedan N €` + `Prorrogar`, que abre el bloque de julio (meses + Aplicar Plan de Recuperación). Trae de vuelta el fix del doble conteo al volver de mes (saldo 85, no 20).
* **Versión:** app → v1.9.6, SW → v1.8.18. Verificado con `node --check` + simulación y push a `main`.

### S20 — Datos siempre visibles v1.9.7 (30/09/2026, pedido por Alejandra)
* **Fallo:** al esconder el déficit en meses cubiertos se escondían también desglose y sugerencia (con datos reales no se veía dónde recortar).
* **Cambio:** el banner de déficit (importe + desglose + sugerencia) sale siempre que falte ahorro; solo el botón de crear plan sigue la regla (sin plan / con extra / en prórroga sin controles).
* **Versión:** app → v1.9.7, SW → v1.8.19. Verificado con `node --check` y push a `main`.

### S21 — Aplicar no duplica v1.9.8 (30/09/2026, exigido por Alejandra)
* **Fallo:** darle a Aplicar varias veces sumaba el déficit cada vez (150+150) en cualquier mes.
* **Cambio:** el plan recuerda por mes cuánto puso (`origenes`): al repetir desde el mismo mes se resta antes de sumar (150−150+150=150); un desfase nuevo de otro mes se suma una vez. Crear un plan nuevo sigue igual.
* **Versión:** app → v1.9.8, SW → v1.8.20. Verificado con `node --check` + simulación y push a `main`.

### S22 — Borrados que se propagan + blindaje demo v1.9.9 (30/09/2026, pedido por Alejandra)
* **Fallo 1:** si un miembro quitaba meta, reparto compartido o plan, en el otro móvil resucitaba por la fusión (solo `tx/rec` tenían lápida). Además salía el genérico `Novedades del hogar aplicadas` que nadie pidió.
* **Cambio 1:** lápidas `meta/metcamp/plan` en `NUBE_marcarBorrado`, `limpiarMetasFuturasDePlan` y sustitución de plan marcan borrado; `liquidarPlanYLiberarMetas` elimina el plan en vez de dejarlo como liquidado; `toggleMetaCompartida off`, `eliminarMetaAhorro`, eliminar movimiento/fijo registran aviso y suben con reemplazo. Nuevo log `_avisos` sincronizado (30 últimos) que muestra una sola vez `👤 X quitó Y` y ya no sale el genérico en segundo plano.
* **Fallo 2:** la demo (`id 101-124`, ej. `Supermercado Septiembre 250€`) se mezclaba con datos reales (`id 101-131`) al cargar demo vinculado o al vincular estando en demo.
* **Cambio 2:** flag `gestor_modo_demo_v1` (`esModoDemo/marcaModoDemo`); `restablecerDatosSimulados` desvincula en silencio, limpia compartidos/planes/lápidas y no sube a la nube; `crearHogar/unirseHogar/marcarMiTelefono/recuperarRespaldoPersonal` bloquean estando en demo con `Estás en versión demo, resetea a 0 en Ajustes para no mezclar con tus datos de hogar`; `desvincularHogarSilencioso` limpia `timerSubida/reemplazarProxima`.
* **Versión:** app → v1.9.9, SW → v1.8.21. Verificado con `node --check` y push a `main`.

### S23 — Avisos pre-vínculo no viajan v1.9.10 (30/09/2026, pedido por Alejandra)
* **Fallo:** lo borrado en local antes de vincularse se subía al unirse y avisaba al resto, cuando nunca fue del hogar.
* **Cambio:** `crearHogar/unirseHogar` en `public/nube.js` descartan `_avisos` locales previos y reinician vistos; solo viajan y avisan los borrados ya vinculados.
* **Versión:** app → v1.9.10, SW → v1.8.22. Verificado con `node --check` y push a `main`.

### S24 — Corrección mezcla restante v1.9.11 (30/09/2026, pedido por Alejandra)
* **Fallos:** backend fusionaba demo aunque hubiera lápidas; `api/simular` reescribía `data.json` con demo; avisos comparaban por nombre (duplicados perdían avisos); lápidas caducaban a 90d; restos demo ya mezclados seguían visibles.
* **Cambios:** `fusionarPorId` respeta `_borrados tx/rec`; `probarBackendEnFondo` no mezcla en demo; demo ya no llama a `/api/simular`; avisos guardan `porTel` y el self-skip compara por teléfono; `PRUNE_MS` a 180d; migración única `limpiarRestosDemoExactos` (firma exacta id+concepto+cantidad+fecha, marca lápida y avisa).
* **Versión:** app → v1.9.11, SW → v1.8.23. Verificado con `node --check` y push a `main`.

### S25 — Prórroga unificada con saldo vivo v1.9.12 (01/10/2026, pedido por Alejandra)
* **Fallos:** en septiembre con ingreso de 80 € el banner decía `quedan 5 €` pero `Plan terminado, quedan 85.00 € de deuda` no se movía; al darle a `Prorrogar` salía un desplegable en línea sin desglose ni vista previa de cuota por meses, distinto del bloque de julio `Déficit + Desglose + ¿Deseáis amortizar en…?`.
* **Cambios (genéricos, valen para demo y real sin mezclar datos):** nuevo `saldoVivoDePlan()` en `public/app.js` (`saldoPendiente - lo de este mes`); `lblProrrogaDeuda` y `lblAmortSaldoPendiente` pintan el mismo vivo y se mueven con cada ingreso/gasto; `boxProrrogaFinal` en `public/index.html` añade `lblProrrogaDesglose` + `lblProrrogaPreview` y `selectMesesProrroga` con `onchange`; nueva `actualizarPreviewProrroga()` con desglose por miembro y `cuota = vivo / meses` igual que el déficit; `aplicarProrrogaElegida()` reparte el vivo (ej: 85-80=5) y el guardado cuadra al cerrar el mes. Sin tocar blindaje demo ni nube.
* **Versión:** app → v1.9.12, SW → v1.8.24. Verificado con `node --check` + simulación (sep+80=5, ago 65/75=10, preview 2m=2.50) y push a `main`.

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
