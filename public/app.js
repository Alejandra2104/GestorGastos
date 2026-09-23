/**
 * Gestor de Gastos Familiar Avanzado
 * Arquitectura Local-First: Funciona 100% autónomo (offline, sin servidor o con servidor en la nube).
 */

// ==========================================================================
// Constantes y Configuración de Categorías
// ==========================================================================

const CATEGORIAS_CONFIG = {
    "Alimentación": { icon: "🛒", color: "#f97316", desc: "Supermercados, frutería, carnicería" },
    "Vivienda": { icon: "🏠", color: "#6366f1", desc: "Alquiler, hipoteca, comunidad" },
    "Transporte": { icon: "🚗", color: "#0284c7", desc: "Gasolina, coche, transporte público" },
    "Suministros": { icon: "💡", color: "#eab308", desc: "Luz, agua, gas, internet, móvil" },
    "Moda y Estética": { icon: "👗", color: "#ec4899", desc: "Ropa, calzado, peluquería" },
    "Ocio y Actividades": { icon: "🍿", color: "#8b5cf6", desc: "Restaurantes, viajes, cine, suscripciones" },
    "Salud y Cuidado": { icon: "💊", color: "#06b6d4", desc: "Farmacia, médico, dentista, gimnasio" },
    "Banco y Seguros": { icon: "🏦", color: "#64748b", desc: "Nóminas, comisiones, pólizas" },
    "Otros": { icon: "📦", color: "#f472b6", desc: "Compras varias, regalos, imprevistos" },
    "General": { icon: "📁", color: "#94a3b8", desc: "Categoría general" }
};

const DATOS_INICIALES = { usuarios: {}, metasPorMes: {}, metasCompartidas: {}, recurrentes: [], transacciones: [] };

// Datos de ejemplo (botón "Cargar Datos de Demostración"). Ya NO se cargan solos.
const DATOS_DEMO = {
    usuarios: {
        "600111222": "Alejandro",
        "600333444": "Laura (Pareja)"
    },
    metasPorMes: {
        "2026-01": 250, "2026-02": 250, "2026-03": 300,
        "2026-04": 300, "2026-05": 300, "2026-06": 350,
        "2026-07": 400, "2026-08": 300
    },
    recurrentes: [
        { id: 1, concepto: "Hipoteca / Alquiler Piso", tipo: "gasto", dia: 1, cantidad: 850, categoria: "Vivienda", telefono: "600111222", esCompartido: true, activo: true },
        { id: 2, concepto: "Nómina Fija Alejandro", tipo: "ingreso", dia: 1, cantidad: 2150, categoria: "Banco y Seguros", telefono: "600111222", esCompartido: false, activo: true },
        { id: 3, concepto: "Nómina Fija Laura", tipo: "ingreso", dia: 2, cantidad: 1850, categoria: "Banco y Seguros", telefono: "600333444", esCompartido: false, activo: true },
        { id: 4, concepto: "Seguro de Hogar & Coche", tipo: "gasto", dia: 5, cantidad: 55, categoria: "Banco y Seguros", telefono: "600111222", esCompartido: true, activo: true },
        { id: 5, concepto: "Fibra Óptica 1Gb + Móviles", tipo: "gasto", dia: 10, cantidad: 45, categoria: "Suministros", telefono: "600333444", esCompartido: true, activo: true },
        { id: 6, concepto: "Factura Eléctrica", tipo: "gasto", dia: 15, cantidad: 75, categoria: "Suministros", telefono: "600333444", esCompartido: true, activo: true },
        { id: 7, concepto: "Suscripciones (Streaming/Gym)", tipo: "gasto", dia: 20, cantidad: 38, categoria: "Ocio y Actividades", telefono: "600111222", esCompartido: true, activo: true }
    ],
    transacciones: [
        { id: 101, telefono: "600111222", tipo: "ingreso", concepto: "Bonus puntual", categoria: "Banco y Seguros", cantidad: 300, esCompartido: false, formaPago: "tarjeta", fecha: "2026-03-05T09:30:00.000Z" },
        { id: 102, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Mensual Mercadona", categoria: "Alimentación", cantidad: 280, esCompartido: true, formaPago: "tarjeta", fecha: "2026-03-08T11:00:00.000Z" },
        { id: 103, telefono: "600333444", tipo: "gasto", concepto: "Compra Frutería y Pescado", categoria: "Alimentación", cantidad: 95, esCompartido: true, formaPago: "efectivo", fecha: "2026-03-12T17:20:00.000Z" },
        { id: 104, telefono: "600111222", tipo: "gasto", concepto: "Gasolina Repsol", categoria: "Transporte", cantidad: 65, esCompartido: false, formaPago: "efectivo", fecha: "2026-03-15T18:00:00.000Z" },
        { id: 105, telefono: "600333444", tipo: "gasto", concepto: "Cena Aniversario", categoria: "Ocio y Actividades", cantidad: 110, esCompartido: true, formaPago: "tarjeta", fecha: "2026-03-20T21:30:00.000Z" },
        { id: 106, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Carrefour", categoria: "Alimentación", cantidad: 320, esCompartido: true, formaPago: "tarjeta", fecha: "2026-04-06T10:15:00.000Z" },
        { id: 107, telefono: "600333444", tipo: "gasto", concepto: "Revisión Coche ITV", categoria: "Transporte", cantidad: 140, esCompartido: true, formaPago: "tarjeta", fecha: "2026-04-14T12:00:00.000Z" },
        { id: 108, telefono: "600111222", tipo: "gasto", concepto: "Farmacia y Vitaminas", categoria: "Salud y Cuidado", cantidad: 42, esCompartido: false, formaPago: "efectivo", fecha: "2026-04-18T18:45:00.000Z" },
        { id: 109, telefono: "600333444", tipo: "gasto", concepto: "Ropa entretiempo Zara", categoria: "Moda y Estética", cantidad: 85, esCompartido: false, formaPago: "tarjeta", fecha: "2026-04-22T16:30:00.000Z" },
        { id: 110, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Semanal", categoria: "Alimentación", cantidad: 310, esCompartido: true, formaPago: "tarjeta", fecha: "2026-05-04T11:00:00.000Z" },
        { id: 111, telefono: "600333444", tipo: "gasto", concepto: "Escapada fin de semana", categoria: "Ocio y Actividades", cantidad: 220, esCompartido: true, formaPago: "tarjeta", fecha: "2026-05-16T19:00:00.000Z" },
        { id: 112, telefono: "600111222", tipo: "gasto", concepto: "Gasolina Repsol", categoria: "Transporte", cantidad: 70, esCompartido: false, formaPago: "efectivo", fecha: "2026-05-20T08:30:00.000Z" },
        { id: 113, telefono: "600111222", tipo: "ingreso", concepto: "Paga Extra Verano Alejandro", categoria: "Banco y Seguros", cantidad: 1200, esCompartido: false, formaPago: "tarjeta", fecha: "2026-06-25T10:00:00.000Z" },
        { id: 114, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Grande Mercadona", categoria: "Alimentación", cantidad: 340, esCompartido: true, formaPago: "tarjeta", fecha: "2026-06-08T12:00:00.000Z" },
        { id: 115, telefono: "600333444", tipo: "gasto", concepto: "Billetes de tren vacaciones", categoria: "Transporte", cantidad: 160, esCompartido: true, formaPago: "tarjeta", fecha: "2026-06-18T14:30:00.000Z" },
        { id: 116, telefono: "600111222", tipo: "gasto", concepto: "Gafas de sol y óptica", categoria: "Salud y Cuidado", cantidad: 95, esCompartido: false, formaPago: "tarjeta", fecha: "2026-06-22T17:15:00.000Z" },
        { id: 117, telefono: "600333444", tipo: "ingreso", concepto: "Paga Extra Laura", categoria: "Banco y Seguros", cantidad: 1100, esCompartido: false, formaPago: "tarjeta", fecha: "2026-07-02T10:00:00.000Z" },
        { id: 118, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Vacacional", categoria: "Alimentación", cantidad: 390, esCompartido: true, formaPago: "tarjeta", fecha: "2026-07-07T11:00:00.000Z" },
        { id: 119, telefono: "600333444", tipo: "gasto", concepto: "Hotel y Alojamiento Playa", categoria: "Ocio y Actividades", cantidad: 550, esCompartido: true, formaPago: "tarjeta", fecha: "2026-07-15T12:00:00.000Z" },
        { id: 120, telefono: "600111222", tipo: "gasto", concepto: "Comidas fuera de casa", categoria: "Ocio y Actividades", cantidad: 210, esCompartido: true, formaPago: "tarjeta", fecha: "2026-07-22T22:00:00.000Z" },
        { id: 121, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Mercadona", categoria: "Alimentación", cantidad: 295.40, esCompartido: true, formaPago: "tarjeta", fecha: "2026-08-03T11:30:00.000Z" },
        { id: 122, telefono: "600111222", tipo: "gasto", concepto: "Vestido Vintage Thrifting", categoria: "Moda y Estética", cantidad: 65.00, esCompartido: false, formaPago: "efectivo", fecha: "2026-08-04T12:00:00.000Z" },
        { id: 123, telefono: "600333444", tipo: "gasto", concepto: "Cena terraza con amigos", categoria: "Ocio y Actividades", cantidad: 115.50, esCompartido: true, formaPago: "tarjeta", fecha: "2026-08-08T22:15:00.000Z" },
        { id: 124, telefono: "600111222", tipo: "gasto", concepto: "Gasolina Repsol viaje", categoria: "Transporte", cantidad: 82.00, esCompartido: true, formaPago: "efectivo", fecha: "2026-08-12T09:45:00.000Z" },
        { id: 125, telefono: "600333444", tipo: "gasto", concepto: "Compra semanal Lidl", categoria: "Alimentación", cantidad: 124.30, esCompartido: true, formaPago: "tarjeta", fecha: "2026-08-16T18:20:00.000Z" },
        { id: 126, telefono: "600111222", tipo: "ingreso", concepto: "Venta objetos segunda mano Wallapop", categoria: "Otros", cantidad: 140.00, esCompartido: false, formaPago: "efectivo", fecha: "2026-08-19T17:00:00.000Z" },
        { id: 132, telefono: "600111222", tipo: "gasto", concepto: "Reforma baño imprevisto fontanero", categoria: "Vivienda", cantidad: 2800, esCompartido: true, formaPago: "tarjeta", fecha: "2026-08-20T10:00:00.000Z" },
        { id: 127, telefono: "600333444", tipo: "gasto", concepto: "Clínica Dental Higiene", categoria: "Salud y Cuidado", cantidad: 60.00, esCompartido: false, formaPago: "tarjeta", fecha: "2026-08-23T16:00:00.000Z" },
        { id: 128, telefono: "600111222", tipo: "gasto", concepto: "Cine de verano y palomitas", categoria: "Ocio y Actividades", cantidad: 32.00, esCompartido: true, formaPago: "efectivo", fecha: "2026-08-28T21:00:00.000Z" },
        { id: 129, telefono: "600111222", tipo: "gasto", concepto: "Material oficina y vuelta al cole", categoria: "Otros", cantidad: 85.00, esCompartido: true, formaPago: "tarjeta", fecha: "2026-09-02T10:30:00.000Z" },
        { id: 130, telefono: "600333444", tipo: "gasto", concepto: "Supermercado Mensual Septiembre", categoria: "Alimentación", cantidad: 245.80, esCompartido: true, formaPago: "tarjeta", fecha: "2026-09-05T12:00:00.000Z" },
        { id: 131, telefono: "600111222", tipo: "gasto", concepto: "Abono transporte mensual", categoria: "Transporte", cantidad: 32.50, esCompartido: false, formaPago: "tarjeta", fecha: "2026-09-07T08:15:00.000Z" }
    ]
};

// ==========================================================================
// Estado Global Reactivo
// ==========================================================================

const estado = {
    transacciones: [],
    recurrentes: [],
    metasPorMes: {},
    metasBorradas: {},
    metasCompartidas: {},
    planesAmortizacion: [],
    repartoPredeterminado: {},
    usuarios: {},
    _borrados: {},
    // Respaldo personal por teléfono + PIN (solo de este dispositivo: no se
    // sincroniza con el hogar para no mezclar identidades entre miembros).
    miTelefono: null,
    respaldoPIN: null,
    mesSeleccionado: claveMesActual(),
    mesCalendario: calendarioMesActual(),
    tabActiva: "resumen",
    filtros: {
        busqueda: "",
        tipo: "todos",
        categoria: "todas",
        usuario: "todos",
        formaPago: "todos"
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
            metasBorradas: estado.metasBorradas || {},
            metasCompartidas: estado.metasCompartidas || {},
            planesAmortizacion: estado.planesAmortizacion || [],
            repartoPredeterminado: estado.repartoPredeterminado || {},
            usuarios: estado.usuarios,
            _borrados: estado._borrados || {},
            miTelefono: estado.miTelefono || null,
            respaldoPIN: estado.respaldoPIN || null
        };
        localStorage.setItem('gestor_gastos_db', JSON.stringify(payload));
    } catch (e) {
        console.warn("No se pudo guardar en localStorage:", e);
    }
    try { if (typeof programarSubidaNube === 'function' && (typeof window === 'undefined' || !window.__NUBE_SUPRIMIR__)) programarSubidaNube(); } catch (e) {}
    try { if (typeof programarRespaldoPersonal === 'function') programarRespaldoPersonal(); } catch (e) {}
}

function cargarLocalmente() {
    try {
        const raw = localStorage.getItem('gestor_gastos_db');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed.transacciones)) estado.transacciones = parsed.transacciones;
            if (Array.isArray(parsed.recurrentes)) estado.recurrentes = parsed.recurrentes;
            if (parsed.metasPorMes && typeof parsed.metasPorMes === 'object') estado.metasPorMes = parsed.metasPorMes;
            if (parsed.metasBorradas && typeof parsed.metasBorradas === 'object') estado.metasBorradas = parsed.metasBorradas;
            if (parsed.metasCompartidas && typeof parsed.metasCompartidas === 'object') estado.metasCompartidas = parsed.metasCompartidas;
            if (Array.isArray(parsed.planesAmortizacion)) estado.planesAmortizacion = parsed.planesAmortizacion;
            if (parsed.repartoPredeterminado && typeof parsed.repartoPredeterminado === 'object') estado.repartoPredeterminado = parsed.repartoPredeterminado;
            if (parsed.usuarios && typeof parsed.usuarios === 'object') estado.usuarios = parsed.usuarios;
            if (parsed._borrados && typeof parsed._borrados === 'object') estado._borrados = parsed._borrados;
            if (typeof parsed.miTelefono === 'string' && parsed.miTelefono) estado.miTelefono = parsed.miTelefono;
            if (typeof parsed.respaldoPIN === 'string' && parsed.respaldoPIN) estado.respaldoPIN = parsed.respaldoPIN;
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
    // FORZAMOS la conexión si existe configuración de nube, ignorando las detecciones automáticas
    if (typeof window !== 'undefined' && window.NUBE_CONFIG) return true;
    
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
        // Inicializar con la base de datos de ejemplo si no hay local
        estado.transacciones = JSON.parse(JSON.stringify(DATOS_DEMO.transacciones));
        estado.recurrentes = JSON.parse(JSON.stringify(DATOS_DEMO.recurrentes));
        estado.metasPorMes = JSON.parse(JSON.stringify(DATOS_DEMO.metasPorMes));
        estado.usuarios = JSON.parse(JSON.stringify(DATOS_DEMO.usuarios));
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
// Convierte un input date (YYYY-MM-DD) a ISO usando mediodía local.
// Evita que `new Date("2026-09-01").toISOString()` (medianoche UTC) se desplace
// al día/mes anterior en husos negativos y oculte el movimiento del mes.
function fechaInputALocalISO(fechaYYYYMMDD) {
    try {
        if (!fechaYYYYMMDD || typeof fechaYYYYMMDD !== 'string') return new Date().toISOString();
        const limpio = fechaYYYYMMDD.substring(0, 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(limpio)) return new Date().toISOString();
        const d = new Date(limpio + 'T12:00:00');
        if (!isNaN(d)) return d.toISOString();
        return new Date().toISOString();
    } catch (e) {
        return new Date().toISOString();
    }
}
// Convierte un ISO (UTC) a valor para <input type="date"> en fecha LOCAL (no UTC).
function isoAFechaInput(iso) {
    try {
        const d = new Date(iso);
        if (isNaN(d)) return fechaHoyISO();
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    } catch (e) {
        return fechaHoyISO();
    }
}
function claveMesDeFechaInput(fechaYYYYMMDD) {
    try {
        const s = String(fechaYYYYMMDD || '').substring(0, 7);
        return /^\d{4}-\d{2}$/.test(s) ? s : null;
    } catch (e) {
        return null;
    }
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
        if (t && typeof t.fecha === 'string' && t.fecha.length >= 7) {
            const clave = t.fecha.substring(0, 7);
            if (/^\d{4}-\d{2}$/.test(clave)) mesesSet.add(clave);
        }
    });
    // El mes seleccionado siempre debe existir en el desplegable (p. ej. mes futuro recién creado)
    if (estado.mesSeleccionado && /^\d{4}-\d{2}$/.test(estado.mesSeleccionado)) {
        mesesSet.add(estado.mesSeleccionado);
    }

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
    try { if (typeof inicializarSelectoresExportacion === 'function') inicializarSelectoresExportacion(); } catch (e) {}
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
    const clave = anio + '-' + String(mesNum1Indexed).padStart(2, '0');

    estado.transacciones.forEach(t => {
        if (!t || !t.fecha) return;
        // Fuente de verdad: clave YYYY-MM del ISO (consistente con inicializarSelectorMeses).
        // Evita desfases de huso horario de getFullYear/getMonth en días límite de mes.
        if (typeof t.fecha === 'string' && /^\d{4}-\d{2}/.test(t.fecha)) {
            if (t.fecha.substring(0, 7) === clave) ops.push(t);
            return;
        }
        try {
            const d = new Date(t.fecha);
            if (!isNaN(d) && d.getFullYear() === anio && (d.getMonth() + 1) === mesNum1Indexed) {
                ops.push(t);
            }
        } catch (e) {}
    });

    estado.recurrentes.forEach(r => {
        if (r.activo !== false) {
            const fechaFijo = new Date(anio, mesNum1Indexed - 1, r.dia, 12, 0, 0);
            ops.push({
                id: `rec-${r.id}`,
                telefono: r.telefono || null,
                tipo: r.tipo || "gasto",
                concepto: r.concepto,
                categoria: r.categoria || "Vivienda",
                cantidad: r.cantidad,
                esCompartido: !!r.esCompartido,
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
    try { if (typeof refrescarRespaldoPersonalUI === 'function') refrescarRespaldoPersonalUI(); } catch (e) {}
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
// Renderizador: Meta de Ahorro, Reparto Reactivo y Planes de Amortización
// ==========================================================================

function obtenerRepartoMes(mes) {
    if (estado.metasCompartidas && estado.metasCompartidas[mes] && Object.keys(estado.metasCompartidas[mes]).length > 0) {
        return Object.assign({}, estado.metasCompartidas[mes]);
    }
    if (estado.repartoPredeterminado && Object.keys(estado.repartoPredeterminado).length > 0) {
        return Object.assign({}, estado.repartoPredeterminado);
    }
    const members = Object.keys(estado.usuarios);
    if (members.length === 0) return {};
    if (members.length === 2) {
        return { [members[0]]: 50, [members[1]]: 50 };
    }
    const pct = Math.floor(100 / members.length);
    const reparto = {};
    members.forEach((m, idx) => {
        reparto[m] = (idx === members.length - 1) ? (100 - pct * (members.length - 1)) : pct;
    });
    return reparto;
}

function obtenerPlanAmortizacionActivo(mes) {
    if (!estado.planesAmortizacion || !Array.isArray(estado.planesAmortizacion)) return null;
    return estado.planesAmortizacion.find(p => 
        p.mesesLista && p.mesesLista.includes(mes) && 
        (p.estado === 'activo' || p.estado === 'prorrogado') &&
        p.saldoPendiente > 0.01
    ) || null;
}

function activarProrrogaPlan(plan) {
    if (!plan || plan.mesesPlazo >= 12) return;
    const mesesActuales = plan.mesesLista.length;
    const mesesParaDoce = 12 - mesesActuales;
    if (mesesParaDoce <= 0) return;

    const ultimoMes = plan.mesesLista[plan.mesesLista.length - 1];
    const [uAnio, uMes] = ultimoMes.split('-').map(Number);
    let curAnio = uAnio;
    let curMes = uMes;

    for (let i = 1; i <= mesesParaDoce; i++) {
        curMes++;
        if (curMes > 12) { curMes = 1; curAnio++; }
        const clave = `${curAnio}-${String(curMes).padStart(2, '0')}`;
        if (!plan.mesesLista.includes(clave)) {
            plan.mesesLista.push(clave);
        }
    }

    plan.mesesPlazo = 12;
    plan.prorrogaActiva = true;
    plan.estado = 'prorrogado';
    try { plan._mod = Date.now(); } catch (e) {}
    
    // Recalcular cuota mensual reducida para absorber el saldo pendiente en el plazo ampliado
    const mesesTotales = plan.mesesLista.length;
    const cuotaNueva = parseFloat((plan.saldoPendiente / mesesTotales).toFixed(2));
    if (cuotaNueva > 0) plan.cuotaMensual = cuotaNueva;

    // Actualizar bases en los meses restantes (respetando los meses que el
    // usuario quitó manualmente: no se les repone la base automáticamente)
    plan.mesesLista.forEach(m => {
        if (estado.metasBorradas && estado.metasBorradas[m]) return;
        if (!estado.metasPorMes[m] || estado.metasPorMes[m] <= plan.cuotaMensual) {
            estado.metasPorMes[m] = plan.cuotaMensual;
        }
    });

    guardarLocalmente();
}

function verificarProrrogaAutomatica(plan, mesActual) {
    if (!plan || plan.mesesPlazo >= 12 || plan.saldoPendiente <= 0.01) return;
    const ultimoMes = plan.mesesLista[plan.mesesLista.length - 1];
    if (mesActual >= ultimoMes) {
        activarProrrogaPlan(plan);
    }
}

function solicitarProrroga12Meses() {
    const plan = obtenerPlanAmortizacionActivo(estado.mesSeleccionado);
    if (!plan) return;
    if (plan.mesesPlazo >= 12) {
        mostrarToast('El plan ya cuenta con el plazo máximo de 12 meses', 'info');
        return;
    }
    if (!confirm(`¿Deseas prorrogar este plan de amortización hasta los 12 meses? El saldo pendiente de ${plan.saldoPendiente.toFixed(2)} € se redistribuirá reduciendo la cuota mensual.`)) {
        return;
    }
    activarProrrogaPlan(plan);
    mostrarToast('⏱️ ¡Prórroga activada! El plan se ha ampliado hasta 12 meses con cuota reducida.', 'success');
    renderMetaAhorro();
}

function saldarDeudaAnticipada() {
    const plan = obtenerPlanAmortizacionActivo(estado.mesSeleccionado);
    if (!plan) {
        mostrarToast('No hay un plan de amortización activo para este mes', 'info');
        return;
    }

    if (!confirm(`¿Confirmas que deseas saldar anticipadamente la deuda pendiente de ${plan.saldoPendiente.toFixed(2)} €? El recordatorio y las cuotas de amortización restantes desaparecerán de inmediato.`)) {
        return;
    }

    plan.saldoPendiente = 0;
    plan.estado = 'liquidado_anticipado';
    plan.fechaLiquidacion = new Date().toISOString();
    try { plan._mod = Date.now(); } catch (e) {}

    // Eliminar las cuotas de amortización base de los meses futuros que pertenecían a este plan
    const idxActual = plan.mesesLista.indexOf(estado.mesSeleccionado);
    const mesesFuturos = idxActual >= 0 ? plan.mesesLista.slice(idxActual) : plan.mesesLista;
    mesesFuturos.forEach(m => {
        if (estado.metasPorMes[m] === plan.cuotaMensual) {
            delete estado.metasPorMes[m];
        } else if (estado.metasPorMes[m] > plan.cuotaMensual) {
            estado.metasPorMes[m] = Math.round((estado.metasPorMes[m] - plan.cuotaMensual) * 100) / 100;
        }
    });

    guardarLocalmente();
    mostrarToast('🎉 ¡Deuda saldada anticipadamente! Se ha cancelado el plan de amortización y su recordatorio.', 'success');
    renderMetaAhorro();
}

function renderMetaAhorro() {
    // 1. Plan de amortización activo para este mes
    const planActivo = obtenerPlanAmortizacionActivo(estado.mesSeleccionado);
    const bannerAmortizacion = document.getElementById('bannerAmortizacionActiva');
    const boxBaseAmortizacion = document.getElementById('boxBaseAmortizacion');

    if (planActivo) {
        // Verificar si procede prórroga automática al estar al final o más allá del plazo inicial sin haber saldado
        verificarProrrogaAutomatica(planActivo, estado.mesSeleccionado);

        if (bannerAmortizacion) {
            bannerAmortizacion.style.display = 'block';
            const mesIdx = planActivo.mesesLista.indexOf(estado.mesSeleccionado) + 1;
            document.getElementById('lblAmortizacionTitulo').textContent = planActivo.prorrogaActiva ? 'Plan de Amortización (Prórroga)' : 'Plan de Amortización Activo';
            document.getElementById('badgeAmortizacionProgreso').textContent = `Mes ${mesIdx > 0 ? mesIdx : 1} de ${planActivo.mesesPlazo}`;
            
            const badgeProrroga = document.getElementById('badgeAmortizacionProrroga');
            if (badgeProrroga) {
                badgeProrroga.style.display = planActivo.prorrogaActiva ? 'inline-block' : 'none';
            }

            document.getElementById('lblAmortSaldoPendiente').textContent = `${planActivo.saldoPendiente.toFixed(2)} €`;
            document.getElementById('lblAmortCuotaMes').textContent = `+${planActivo.cuotaMensual.toFixed(2)} €/mes`;

            // Desglose mensual por miembro
            const rep = planActivo.reparto || obtenerRepartoMes(estado.mesSeleccionado);
            const miembrosDesglose = Object.entries(estado.usuarios).map(([tel, nom]) => {
                const pct = rep[tel] !== undefined ? rep[tel] : 50;
                const cuotaM = (planActivo.cuotaMensual * (pct / 100)).toFixed(2);
                return `<strong>${nom}</strong>: +${cuotaM} €/mes (${pct}%)`;
            }).join(' · ');
            
            let btnProrrogaHtml = '';
            if (planActivo.mesesPlazo < 12 && !planActivo.prorrogaActiva) {
                btnProrrogaHtml = ` · <button class="btn btn-outline" style="padding:2px 8px;font-size:0.75rem;cursor:pointer;" onclick="solicitarProrroga12Meses()">⏱️ Prorrogar hasta 12 meses</button>`;
            }

            document.getElementById('lblAmortDesgloseMiembros').innerHTML = 
                `💡 <strong>Aportación mensual requerida:</strong> ${miembrosDesglose}${btnProrrogaHtml}`;
        }

        // Regla: el mes siguiente tiene de base la amortización del mes anterior (no la base anterior + añadido)
        if (boxBaseAmortizacion) {
            boxBaseAmortizacion.style.display = 'flex';
            document.getElementById('lblBaseAmortTexto').innerHTML = 
                `Base obligatoria de este mes (amortización): <strong>${planActivo.cuotaMensual.toFixed(2)} €</strong>`;
            
            // Si el mes aún no tenía meta fijada, se establece la cuota de amortización como base predeterminada,
            // salvo que el usuario la hubiera quitado manualmente (entonces no se repone sola)
            if (estado.metasPorMes[estado.mesSeleccionado] === undefined && !(estado.metasBorradas && estado.metasBorradas[estado.mesSeleccionado])) {
                estado.metasPorMes[estado.mesSeleccionado] = planActivo.cuotaMensual;
                guardarLocalmente();
            }

            const metaActual = estado.metasPorMes[estado.mesSeleccionado] || planActivo.cuotaMensual;
            const extra = Math.max(0, Math.round((metaActual - planActivo.cuotaMensual) * 100) / 100);
            const inputExtra = document.getElementById('inputAporteExtraMeta');
            if (inputExtra && document.activeElement !== inputExtra) {
                inputExtra.value = extra > 0 ? extra : '';
            }
            document.getElementById('lblMetaTotalCalculada').textContent = `Meta Total Resultante: ${metaActual.toFixed(2)} €`;
        }
    } else {
        if (bannerAmortizacion) bannerAmortizacion.style.display = 'none';
        if (boxBaseAmortizacion) boxBaseAmortizacion.style.display = 'none';
    }

    // 2. Comprobación de meta fijada
    const metaGuardada = estado.metasPorMes[estado.mesSeleccionado];
    const tieneMeta = metaGuardada !== undefined && metaGuardada > 0;
    const meta = tieneMeta ? metaGuardada : 0;
    const inputMeta = document.getElementById('inputMetaAhorro');
    if (inputMeta && document.activeElement !== inputMeta) {
        inputMeta.value = tieneMeta ? meta : '';
    }

    // 3. Balance del mes
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
        renderMetaCompartidaUI();
        return;
    }

    const porcentaje = meta > 0 ? Math.max(0, Math.round((balanceActual / meta) * 100)) : 100;
    progressEl.style.width = `${Math.min(100, Math.max(0, porcentaje))}%`;
    progressEl.classList.toggle('overachieved', balanceActual >= meta);

    lblAhorrado.textContent = `Ahorro conseguido: ${balanceActual.toLocaleString('es-ES', { minimumFractionDigits: 2 })} € / ${meta.toFixed(2)} €`;
    lblPorcentaje.textContent = `${porcentaje}% del objetivo`;

    if (balanceActual >= meta) {
        bannerCelebracion.style.display = 'block';
        bannerDeficit.style.display = 'none';

        // Si hay plan activo y el superávit salda el saldo pendiente, autoliquidar
        if (planActivo && balanceActual - meta >= planActivo.saldoPendiente) {
            planActivo.saldoPendiente = 0;
            planActivo.estado = 'liquidado_anticipado';
            try { planActivo._mod = Date.now(); } catch (e) {}
            guardarLocalmente();
            if (bannerAmortizacion) bannerAmortizacion.style.display = 'none';
            if (boxBaseAmortizacion) boxBaseAmortizacion.style.display = 'none';
        }
    } else {
        bannerCelebracion.style.display = 'none';
        bannerDeficit.style.display = 'block';
        const deficit = meta - balanceActual;
        document.getElementById('lblDeficitImporte').textContent = `${deficit.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`;
        actualizarDesgloseDeficitUI();
        actualizarCalculoProrrateo();
    }

    renderMetaCompartidaUI();
}

function actualizarDesgloseDeficitUI() {
    const elDeficitDesglose = document.getElementById('lblDeficitDesglose');
    if (!elDeficitDesglose) return;

    const meta = parseFloat(document.getElementById('inputMetaAhorro').value) || 0;
    const [anio, mesNum] = estado.mesSeleccionado.split('-').map(Number);
    const ops = obtenerOperacionesMes(anio, mesNum);
    let totalIng = 0, totalGas = 0;
    ops.forEach(t => t.tipo === 'ingreso' ? totalIng += t.cantidad : totalGas += t.cantidad);
    const deficit = meta - (totalIng - totalGas);

    if (deficit <= 0) {
        elDeficitDesglose.innerHTML = '';
        return;
    }

    const reparto = obtenerRepartoMes(estado.mesSeleccionado);
    const members = Object.entries(estado.usuarios);
    if (!members.length) return;

    let html = '<strong>Desglose del déficit por miembro:</strong><ul class="deficit-desglose-list">';
    members.forEach(([tel, nom]) => {
        const pct = reparto[tel] !== undefined ? reparto[tel] : (members.length === 2 ? 50 : Math.floor(100 / members.length));
        const parte = (deficit * (pct / 100)).toFixed(2);
        html += `
            <li class="deficit-desglose-item">
                <span>👤 <strong>${nom}</strong> (${pct}%):</span>
                <strong style="color:var(--danger);">${parte} €</strong>
            </li>
        `;
    });
    html += '</ul>';
    elDeficitDesglose.innerHTML = html;
}

function actualizarCalculoProrrateo() {
    const meta = parseFloat(document.getElementById('inputMetaAhorro').value);
    const lblDetalle = document.getElementById('lblProrrateoDetalle');
    if (!lblDetalle) return;

    if (isNaN(meta) || meta <= 0) {
        lblDetalle.innerHTML = 'Fija primero una meta válida para calcular el plan de recuperación.';
        return;
    }
    const [anio, mesNum] = estado.mesSeleccionado.split('-').map(Number);
    const ops = obtenerOperacionesMes(anio, mesNum);
    let totalIng = 0, totalGas = 0;
    ops.forEach(t => t.tipo === 'ingreso' ? totalIng += t.cantidad : totalGas += t.cantidad);
    const deficit = meta - (totalIng - totalGas);

    if (deficit <= 0) {
        lblDetalle.innerHTML = '';
        return;
    }

    const meses = parseInt(document.getElementById('selectMesesProrrateo').value) || 6;
    const cuotaExtra = deficit / meses;
    const reparto = obtenerRepartoMes(estado.mesSeleccionado);
    const members = Object.entries(estado.usuarios);

    let desgloseCuota = '';
    if (members.length > 0) {
        desgloseCuota = ' (' + members.map(([tel, nom]) => {
            const pct = reparto[tel] !== undefined ? reparto[tel] : 50;
            const aporte = (cuotaExtra * (pct / 100)).toFixed(2);
            return `${nom}: <strong>+${aporte} €/mes</strong>`;
        }).join(', ') + ')';
    }

    lblDetalle.innerHTML = 
        `💡 Para absorber el desfase en <strong>${meses} meses</strong>, cada mes tendrá una cuota base de amortización de <strong>+${cuotaExtra.toFixed(2)} €/mes</strong>${desgloseCuota}. Si en ese plazo no se salda, se podrá prorrogar hasta 12 meses.`;
}

function alCambiarInputMetaAhorro() {
    const metaTotal = parseFloat(document.getElementById('inputMetaAhorro').value) || 0;
    
    // Si hay amortización activa, sincronizar el campo de aporte extra voluntario
    const plan = obtenerPlanAmortizacionActivo(estado.mesSeleccionado);
    if (plan) {
        const base = plan.cuotaMensual;
        const extra = Math.max(0, Math.round((metaTotal - base) * 100) / 100);
        const inputExtra = document.getElementById('inputAporteExtraMeta');
        if (inputExtra && document.activeElement !== inputExtra) {
            inputExtra.value = extra > 0 ? extra : '';
        }
        const lblTotal = document.getElementById('lblMetaTotalCalculada');
        if (lblTotal) lblTotal.textContent = `Meta Total Resultante: ${metaTotal.toFixed(2)} €`;
    }

    // Actualizar importes en euros en la lista de reparto sin tocar inputs ni perder foco
    const inputs = document.querySelectorAll('.pct-input');
    inputs.forEach(inp => {
        const tel = inp.getAttribute('data-tel');
        const p = parseInt(inp.value) || 0;
        const lbl = document.getElementById(`lblImporteMeta_${tel}`);
        if (lbl) {
            lbl.textContent = `${(metaTotal * (p / 100)).toFixed(2)} €`;
        }
    });

    actualizarDesgloseDeficitUI();
    actualizarCalculoProrrateo();
}

function actualizarMetaConAporteExtra() {
    const plan = obtenerPlanAmortizacionActivo(estado.mesSeleccionado);
    const base = plan ? plan.cuotaMensual : 0;
    const inputExtra = document.getElementById('inputAporteExtraMeta');
    const extra = parseFloat(inputExtra.value) || 0;
    const metaTotal = Math.round((base + extra) * 100) / 100;

    const inputMeta = document.getElementById('inputMetaAhorro');
    if (inputMeta) inputMeta.value = metaTotal > 0 ? metaTotal : '';

    const lblTotal = document.getElementById('lblMetaTotalCalculada');
    if (lblTotal) lblTotal.textContent = `Meta Total Resultante: ${metaTotal.toFixed(2)} €`;

    alCambiarInputMetaAhorro();
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

    if (deficit <= 0) {
        mostrarToast('No hay déficit que amortizar este mes', 'info');
        return;
    }

    // El cliente escoge libremente entre 2, 4, 6, 8 y 12 meses
    const meses = parseInt(document.getElementById('selectMesesProrrateo').value) || 6;
    const cuotaExtra = parseFloat((deficit / meses).toFixed(2));

    const mesesLista = [];
    let cursorAnio = anio;
    let cursorMes = mesNum;

    for (let i = 1; i <= meses; i++) {
        cursorMes++;
        if (cursorMes > 12) {
            cursorMes = 1;
            cursorAnio++;
        }
        const clave = `${cursorAnio}-${String(cursorMes).padStart(2, '0')}`;
        mesesLista.push(clave);
        
        // Regla: el mes siguiente tiene de base la amortización del mes anterior (no base anterior + añadidos).
        // No se repone base en meses que el usuario quitó manualmente.
        if (!(estado.metasBorradas && estado.metasBorradas[clave]) && (!estado.metasPorMes[clave] || estado.metasPorMes[clave] <= cuotaExtra)) {
            estado.metasPorMes[clave] = cuotaExtra;
        }
    }

    const nuevoPlan = {
        id: 'plan_' + Date.now(),
        mesOrigen: estado.mesSeleccionado,
        deficitTotal: Math.round(deficit * 100) / 100,
        saldoPendiente: Math.round(deficit * 100) / 100,
        mesesPlazoOriginal: meses,
        mesesPlazo: meses,
        cuotaMensual: cuotaExtra,
        mesesLista: mesesLista,
        reparto: Object.assign({}, obtenerRepartoMes(estado.mesSeleccionado)),
        estado: 'activo',
        prorrogaActiva: false,
        fechaCreacion: new Date().toISOString(),
        _mod: Date.now()
    };

    if (!estado.planesAmortizacion) estado.planesAmortizacion = [];
    estado.planesAmortizacion.push(nuevoPlan);

    guardarLocalmente();
    api('/api/metas-lote', 'POST', { metas: estado.metasPorMes }).catch(() => {});
    api('/api/planes-amortizacion', 'POST', { planes: estado.planesAmortizacion }).catch(() => {});
    
    mostrarToast(`¡Plan de recuperación activado a ${meses} meses! Cuota base de ${cuotaExtra.toFixed(2)} €/mes asignada para amortizar la deuda.`, 'success');
    renderMetaAhorro();
}

async function guardarMetaAhorro() {
    const nuevaMeta = parseFloat(document.getElementById('inputMetaAhorro').value);
    if (isNaN(nuevaMeta) || nuevaMeta <= 0) {
        mostrarToast('Introduce una meta mayor que 0', 'danger');
        return;
    }

    // La meta siempre se puede cambiar: sobrescribe el valor anterior del mes
    // y anula la marca de "quitada manualmente" para ese mes.
    estado.metasPorMes[estado.mesSeleccionado] = nuevaMeta;
    try { if (estado.metasBorradas) delete estado.metasBorradas[estado.mesSeleccionado]; } catch (e) {}
    guardarLocalmente();
    // Subida forzada para que el nuevo valor (y la limpieza de la marca)
    // lleguen a la nube de forma atómica.
    try { if (typeof programarSubidaNube === 'function') programarSubidaNube(true); } catch (e) {}
    api('/api/meta', 'POST', { mes: estado.mesSeleccionado, meta: nuevaMeta }).catch(() => {});
    mostrarToast(`Meta de ahorro guardada: ${nuevaMeta.toFixed(2)} € (puedes cambiarla cuando quieras)`, 'success');
    renderMetaAhorro();
}

function eliminarMetaAhorro() {
    if (estado.metasPorMes[estado.mesSeleccionado] === undefined) {
        mostrarToast('Este mes no tiene meta fijada', 'info');
        return;
    }
    if (!confirm('¿Quitar la meta de ahorro de este mes? Podrás fijar una nueva cuando quieras.')) {
        return;
    }
    delete estado.metasPorMes[estado.mesSeleccionado];
    // Sin meta no hay reparto compartido de ese mes: se limpia también para
    // que la casilla "Meta compartida" no quede marcada en vacío.
    try { if (estado.metasCompartidas) delete estado.metasCompartidas[estado.mesSeleccionado]; } catch (e) {}
    // Marcar el mes como quitado manualmente para que ni el plan de
    // amortización ni la nube vuelvan a reponer la meta automáticamente.
    try {
        if (!estado.metasBorradas || typeof estado.metasBorradas !== 'object') estado.metasBorradas = {};
        estado.metasBorradas[estado.mesSeleccionado] = true;
    } catch (e) {}
    const inputExtra = document.getElementById('inputAporteExtraMeta');
    if (inputExtra) inputExtra.value = '';
    guardarLocalmente();
    // Subida forzada (reemplazo) para que el borrado llegue a la nube y no
    // resucite al fusionar con los datos antiguos del hogar.
    try { if (typeof programarSubidaNube === 'function') programarSubidaNube(true); } catch (e) {}
    mostrarToast('Meta eliminada: ya puedes fijar un nuevo importe', 'info');
    renderMetaAhorro();
}

// ==========================================================================
// Configuración de Reparto Reactivo (Suma 100% Automática)
// ==========================================================================

function toggleMetaCompartida() {
    const chk = document.getElementById('opMetaCompartida');
    const sec = document.getElementById('metaCompartidaSection');
    if (!chk || !sec) return;
    
    if (chk.checked) {
        sec.style.display = 'block';
        if (!estado.metasCompartidas) estado.metasCompartidas = {};
        if (!estado.metasCompartidas[estado.mesSeleccionado]) {
            estado.metasCompartidas[estado.mesSeleccionado] = obtenerRepartoMes(estado.mesSeleccionado);
            guardarLocalmente();
        }
        renderMetaCompartidaUI();
    } else {
        sec.style.display = 'none';
        if (estado.metasCompartidas) {
            delete estado.metasCompartidas[estado.mesSeleccionado];
            guardarLocalmente();
        }
        renderMetaAhorro();
    }
}

function renderMetaCompartidaUI() {
    const elMetaCompartida = document.getElementById('opMetaCompartida');
    const sec = document.getElementById('metaCompartidaSection');
    const compartida = !!(estado.metasCompartidas && estado.metasCompartidas[estado.mesSeleccionado]);
    
    if (elMetaCompartida) {
        elMetaCompartida.checked = compartida;
    }
    if (sec) {
        sec.style.display = compartida ? 'block' : 'none';
    }

    const listDiv = document.getElementById('metaCompartidaList');
    if (!listDiv) return;

    const members = Object.entries(estado.usuarios);
    if (!members.length) {
        listDiv.innerHTML = '<p style="font-size:0.8rem;color:var(--text-muted);">No hay miembros registrados.</p>';
        return;
    }

    const split = obtenerRepartoMes(estado.mesSeleccionado);
    const metaTotal = parseFloat(document.getElementById('inputMetaAhorro').value) || 0;

    let totalPct = 0;
    listDiv.innerHTML = members.map(([tel, nom]) => {
        const pct = split[tel] !== undefined ? split[tel] : (members.length === 2 ? 50 : Math.floor(100 / members.length));
        totalPct += pct;
        const importe = (metaTotal * (pct / 100)).toFixed(2);
        return `
            <div class="meta-member-row">
                <span class="meta-member-name" title="${nom}">👤 ${nom}</span>
                <div class="pct-input-wrap">
                    <input type="number" min="0" max="100" step="1" value="${pct}"
                        data-tel="${tel}" class="pct-input" oninput="ajustarPorcentajesReactivo(this)">
                    <span class="pct-symbol">%</span>
                </div>
                <span id="lblImporteMeta_${tel}" class="meta-member-amount">${importe} €</span>
            </div>
        `;
    }).join('');

    const badge = document.getElementById('badgeTotalPorcentaje');
    if (badge) {
        if (totalPct === 100) {
            badge.textContent = 'Suma: 100% ✓';
            badge.className = 'badge-pct-status';
        } else {
            badge.textContent = `Suma: ${totalPct}% ⚠️`;
            badge.className = 'badge-pct-status invalid';
        }
    }
}

function ajustarPorcentajesReactivo(changedInput) {
    const changedTel = changedInput.getAttribute('data-tel');
    let rawVal = parseInt(changedInput.value);
    if (isNaN(rawVal)) rawVal = 0;
    const val = Math.max(0, Math.min(100, rawVal));

    // Si excede 100 o es menor que 0, corregir en el input
    if (changedInput.value !== '' && (parseInt(changedInput.value) < 0 || parseInt(changedInput.value) > 100)) {
        changedInput.value = val;
    }

    const allInputs = Array.from(document.querySelectorAll('.pct-input'));
    const otherInputs = allInputs.filter(inp => inp !== changedInput);

    if (otherInputs.length === 1) {
        // En parejas: el otro miembro es exactamente 100 - val
        const otherVal = Math.max(0, 100 - val);
        otherInputs[0].value = otherVal;
    } else if (otherInputs.length > 1) {
        // Si hay más de 2 miembros: repartir proporcionalmente el resto
        const remainingPct = Math.max(0, 100 - val);
        let currentOtherTotal = 0;
        otherInputs.forEach(inp => { currentOtherTotal += (parseInt(inp.value) || 0); });
        
        let assigned = 0;
        otherInputs.forEach((inp, idx) => {
            if (idx === otherInputs.length - 1) {
                inp.value = Math.max(0, remainingPct - assigned);
            } else {
                const ratio = currentOtherTotal > 0 ? (parseInt(inp.value) || 0) / currentOtherTotal : (1 / otherInputs.length);
                const share = Math.round(remainingPct * ratio);
                inp.value = share;
                assigned += share;
            }
        });
    }

    // Verificar la suma de porcentajes
    let sum = 0;
    allInputs.forEach(inp => sum += (parseInt(inp.value) || 0));
    const badge = document.getElementById('badgeTotalPorcentaje');
    if (badge) {
        if (sum === 100) {
            badge.textContent = 'Suma: 100% ✓';
            badge.className = 'badge-pct-status';
        } else {
            badge.textContent = `Suma: ${sum}% ⚠️`;
            badge.className = 'badge-pct-status invalid';
        }
    }

    // Actualizar los importes en euros en tiempo real sin recargar el DOM (manteniendo el foco intacto)
    const metaTotal = parseFloat(document.getElementById('inputMetaAhorro').value) || 0;
    const nuevoReparto = {};
    allInputs.forEach(inp => {
        const tel = inp.getAttribute('data-tel');
        const p = parseInt(inp.value) || 0;
        nuevoReparto[tel] = p;
        const lbl = document.getElementById(`lblImporteMeta_${tel}`);
        if (lbl) {
            lbl.textContent = `${(metaTotal * (p / 100)).toFixed(2)} €`;
        }
    });

    if (!estado.metasCompartidas) estado.metasCompartidas = {};
    estado.metasCompartidas[estado.mesSeleccionado] = nuevoReparto;
    estado.repartoPredeterminado = Object.assign({}, nuevoReparto);
    guardarLocalmente();

    // Actualizar reactivamente el desglose de déficit si procede
    actualizarDesgloseDeficitUI();
    actualizarCalculoProrrateo();
}

function guardarMetaCompartida() {
    const inputs = document.querySelectorAll('.pct-input');
    const reparto = {};
    inputs.forEach(inp => { reparto[inp.getAttribute('data-tel')] = parseInt(inp.value) || 0; });
    if (!estado.metasCompartidas) estado.metasCompartidas = {};
    estado.metasCompartidas[estado.mesSeleccionado] = reparto;
    estado.repartoPredeterminado = Object.assign({}, reparto);
    guardarLocalmente();
    api('/api/metas-compartidas', 'POST', { metasCompartidas: estado.metasCompartidas, repartoPredeterminado: estado.repartoPredeterminado }).catch(() => {});
    mostrarToast('Reparto de meta guardado con éxito', 'success');
    renderMetaAhorro();
}

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
    try {
        const elBus = document.getElementById('inputSearchTx');
        const elTipo = document.getElementById('filterTipo');
        const elPago = document.getElementById('filterFormaPago');
        const elCat = document.getElementById('filterCategoria');
        const elUsr = document.getElementById('filterUsuario');
        if (elBus) estado.filtros.busqueda = String(elBus.value || '').toLowerCase().trim();
        if (elTipo && elTipo.value) estado.filtros.tipo = elTipo.value;
        if (elPago && elPago.value) estado.filtros.formaPago = elPago.value;
        if (elCat && elCat.value) estado.filtros.categoria = elCat.value;
        if (elUsr && elUsr.value) estado.filtros.usuario = elUsr.value;
    } catch (e) {}
    renderTransacciones();
}

// Restablece todos los filtros para garantizar que los movimientos sean visibles.
// Antes, un filtro desincronizado (p. ej. usuario/categoría que ya no existe,
// o búsqueda con texto) dejaba "Mostrando 0 de N" sin forma obvia de salir.
function limpiarFiltros() {
    estado.filtros = { busqueda: '', tipo: 'todos', categoria: 'todas', usuario: 'todos', formaPago: 'todos' };
    try {
        const elBus = document.getElementById('inputSearchTx'); if (elBus) elBus.value = '';
        const elTipo = document.getElementById('filterTipo'); if (elTipo) elTipo.value = 'todos';
        const elPago = document.getElementById('filterFormaPago'); if (elPago) elPago.value = 'todos';
        const elCat = document.getElementById('filterCategoria'); if (elCat) elCat.value = 'todas';
        const elUsr = document.getElementById('filterUsuario'); if (elUsr) elUsr.value = 'todos';
    } catch (e) {}
    renderTransacciones();
}

function renderTransacciones() {
    const [anio, mesNum] = estado.mesSeleccionado.split('-').map(Number);
    const todasOps = obtenerOperacionesMes(anio, mesNum);

    // Autocorrección: si un filtro apunta a un valor que ya no existe en el DOM
    // (p. ej. miembro borrado, categoría renombrada), se restablece a "todos".
    // Esto evita el caso "Mostrando 0 de N" con los desplegables aparentemente en "Todos".
    try {
        const elCat = document.getElementById('filterCategoria');
        const elUsr = document.getElementById('filterUsuario');
        const elTipo = document.getElementById('filterTipo');
        const elPago = document.getElementById('filterFormaPago');
        if (elCat && estado.filtros.categoria !== 'todas') {
            const valida = Array.from(elCat.options || []).some(o => o.value === estado.filtros.categoria);
            if (!valida) { estado.filtros.categoria = 'todas'; elCat.value = 'todas'; }
        }
        if (elUsr && estado.filtros.usuario !== 'todos') {
            const valida = Array.from(elUsr.options || []).some(o => o.value === estado.filtros.usuario);
            if (!valida) { estado.filtros.usuario = 'todos'; elUsr.value = 'todos'; }
        }
        if (elTipo && !['todos', 'gasto', 'ingreso', 'compartido'].includes(estado.filtros.tipo)) {
            estado.filtros.tipo = 'todos'; elTipo.value = 'todos';
        }
        if (elPago && !['todos', 'efectivo', 'tarjeta'].includes(estado.filtros.formaPago)) {
            estado.filtros.formaPago = 'todos'; elPago.value = 'todos';
        }
    } catch (e) {}
    
    const container = document.getElementById('txListContainer');
    const counterEl = document.getElementById('lblTxCounter');

    const filtradas = todasOps.filter(t => {
        const conceptoTxt = String((t && t.concepto) || '').toLowerCase();
        if (estado.filtros.busqueda && !conceptoTxt.includes(estado.filtros.busqueda)) return false;
        if (estado.filtros.tipo === 'gasto' && t.tipo !== 'gasto') return false;
        if (estado.filtros.tipo === 'ingreso' && t.tipo !== 'ingreso') return false;
        if (estado.filtros.tipo === 'compartido' && !t.esCompartido) return false;
        if (estado.filtros.categoria !== 'todas' && t.categoria !== estado.filtros.categoria) return false;
        if (estado.filtros.usuario !== 'todos' && String(t.telefono) !== String(estado.filtros.usuario)) return false;
        
        // Filtro formaPago robusto
        if (estado.filtros.formaPago !== 'todos') {
            const formaPagoTx = t.formaPago || ''; 
            if (formaPagoTx !== estado.filtros.formaPago) return false;
        }
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
        const nombreUsuario = (estado.usuarios && estado.usuarios[t.telefono]) || t.telefono || '—';
        let fechaFormat = '—';
        try { fechaFormat = new Date(t.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }); } catch (e) {}
        const esIngreso = t.tipo === 'ingreso';
        const cantidadNum = Number(t.cantidad);
        const cantidadTxt = isNaN(cantidadNum) ? '0.00' : cantidadNum.toFixed(2);

        const row = document.createElement('div');
        row.className = 'transaction-item';
        try { row.dataset.id = String(t.id); } catch (e) {}

        row.innerHTML = `
            <div class="tx-left">
                <div class="tx-cat-icon" style="background: ${catConfig.color}15; color: ${catConfig.color};">
                    ${catConfig.icon}
                </div>
                <div class="tx-meta">
                    <div class="tx-title">${String((t && t.concepto) || '(sin concepto)')}</div>
                    <div class="tx-badges-row">
                        <span class="pill-tag pill-user">📅 ${fechaFormat}</span>
                        <span class="pill-tag pill-user">👤 ${nombreUsuario}</span>
                        <span class="pill-tag" style="background: ${catConfig.color}15; color: ${catConfig.color};">${String(t.categoria || 'General')}</span>
                        ${t.esCompartido ? '<span class="pill-tag pill-shared">👥 Compartido</span>' : ''}
                        ${t.esFijo ? '<span class="pill-tag pill-recurring">📌 Fijo Periódico</span>' : ''}
                        <span class="pill-tag pill-pago" style="background: #f3f4f6; color: #6b7280; font-size: 0.75rem;">${t.formaPago === 'efectivo' ? '💵 Efectivo' : t.formaPago === 'tarjeta' ? '💳 Tarjeta' : ''}</span>
                    </div>
                </div>
            </div>
            <div class="tx-right">
                <div class="tx-amount ${esIngreso ? 'ingreso' : 'gasto'}">
                    ${esIngreso ? '+' : '-'}${cantidadTxt} €
                </div>
                <div class="tx-actions">
                    ${!t.esFijo ? `
                        <button class="btn-action-icon" title="Editar" onclick="editarOperacion(${t.id})">✏️</button>
                        <button class="btn-action-icon delete" title="Eliminar" onclick="confirmarEliminarOperacion(${t.id})">🗑️</button>
                    ` : `
                        <button class="btn-action-icon" title="Ver en Fijo" onclick="cambiarTab('recurrentes')">📌</button>
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
        const nombrePagador = (r.telefono && estado.usuarios && estado.usuarios[r.telefono]) || (r.telefono ? r.telefono : 'Sin asignar');

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
                        Día ${r.dia} de cada mes · ${r.categoria} · 👤 ${nombrePagador}
                    </span>
                    <div style="margin-top: 4px; display: flex; gap: 6px; flex-wrap: wrap;">
                        ${r.esCompartido ? '<span class="pill-tag pill-shared">👥 Compartido</span>' : '<span class="pill-tag" style="background: #f3f4f6; color: #6b7280;">🔒 No compartido</span>'}
                    </div>
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

    // Solo lo marcado como compartido, sea puntual o fijo; gastos e ingresos.
    const compartidos = ops.filter(op => op.esCompartido && (op.tipo === 'gasto' || op.tipo === 'ingreso'));
    const miembros = Object.keys(estado.usuarios || {});
    const N = miembros.length;
    const eur = (x) => `${Number(x).toFixed(2)} €`;
    const nombreDe = (tel) => ((estado.usuarios && estado.usuarios[tel]) || tel || '—');

    // Neto por miembro: gastos pagados − ingresos cobrados (compartidos).
    // Fijos sin miembro asignado: se reparten a partes iguales (neutro en saldos).
    const pagG = {}, cobI = {};
    miembros.forEach(tel => { pagG[tel] = 0; cobI[tel] = 0; });
    let totG = 0, totI = 0;
    const sinMiembro = [];
    compartidos.forEach(op => {
        const tel = op.telefono ? String(op.telefono) : null;
        const conocido = !!(tel && miembros.includes(tel));
        if (op.tipo === 'ingreso') {
            totI += op.cantidad;
            if (conocido) cobI[tel] += op.cantidad;
            else sinMiembro.push(op);
        } else {
            totG += op.cantidad;
            if (conocido) pagG[tel] += op.cantidad;
            else sinMiembro.push(op);
        }
    });
    if (N > 0) sinMiembro.forEach(op => {
        const parte = op.cantidad / N;
        miembros.forEach(tel => {
            if (op.tipo === 'ingreso') cobI[tel] += parte;
            else pagG[tel] += parte;
        });
    });

    const neto = {};
    miembros.forEach(tel => { neto[tel] = pagG[tel] - cobI[tel]; });
    const netoTotal = totG - totI;
    const cuota = N > 0 ? netoTotal / N : 0;
    const saldo = {};
    miembros.forEach(tel => { saldo[tel] = neto[tel] - cuota; });

    // Tarjetas de Miembros: balance compartido del mes
    const containerMiembros = document.getElementById('splitMembersContainer');
    containerMiembros.innerHTML = '';

    miembros.forEach(tel => {
        const s = saldo[tel];
        const estadoTxt = s > 0.01 ? `Le deben <strong>${eur(s)}</strong>` : (s < -0.01 ? `Debe <strong>${eur(-s)}</strong>` : 'Equilibrado');
        containerMiembros.innerHTML += `
            <div class="split-member-card">
                <span style="font-size: 0.8rem; opacity: 0.8; text-transform: uppercase;">Balance compartido</span>
                <h3 style="font-size: 1.15rem; margin: 4px 0;">${nombreDe(tel)}</h3>
                <div style="font-size: 1.4rem; font-weight: 800; color: #e9d5ff;">${s > 0.01 ? '+' : s < -0.01 ? '-' : ''}${eur(Math.abs(s))}</div>
                <small style="opacity: 0.8;">${estadoTxt}</small>
                <small style="opacity: 0.7; display: block;">Pagó ${eur(pagG[tel])} en gastos · Cobró ${eur(cobI[tel])} en ingresos</small>
            </div>
        `;
    });

    // Liquidación para N miembros (neto: gastos − ingresos compartidos)
    const lblSettlement = document.getElementById('lblSettlementMessage');

    if (N === 0 || (totG === 0 && totI === 0)) {
        lblSettlement.textContent = `Total compartido este mes: ${eur(netoTotal)}. Registra operaciones con la casilla "Compartido" para calcular el balance.`;
    } else if (N === 2) {
        const u1 = miembros[0];
        const u2 = miembros[1];
        const dif = saldo[u1];

        if (Math.abs(dif) < 0.5) {
            lblSettlement.innerHTML = `⚖️ <strong>Balance compartido equilibrado:</strong> Las cuentas de ${nombreDe(u1)} y ${nombreDe(u2)} están compensadas este mes (gastos e ingresos compartidos).`;
        } else if (dif > 0) {
            lblSettlement.innerHTML = `💸 <strong>${nombreDe(u2)}</strong> debe transferir <strong>${eur(dif)}</strong> a <strong>${nombreDe(u1)}</strong> para equilibrar el balance compartido de este mes.`;
        } else {
            lblSettlement.innerHTML = `💸 <strong>${nombreDe(u1)}</strong> debe transferir <strong>${eur(Math.abs(dif))}</strong> a <strong>${nombreDe(u2)}</strong> para equilibrar el balance compartido de este mes.`;
        }
    } else {
        const cuotaEquitativa = cuota;
        const deudores = [];
        const acreedores = [];

        miembros.forEach(tel => {
            const s = saldo[tel];
            if (s < -0.01) deudores.push({ tel, nombre: nombreDe(tel), debe: -s });
            else if (s > 0.01) acreedores.push({ tel, nombre: nombreDe(tel), cobra: s });
        });

        if (deudores.length === 0) {
            lblSettlement.innerHTML = `⚖️ <strong>Cuentas perfectamente equilibradas:</strong> Todos los miembros (${N}) han aportado su cuota neta (${eur(cuotaEquitativa)} por persona).`;
        } else {
            const transferencias = [];
            let i = 0, j = 0;
            while (i < deudores.length && j < acreedores.length) {
                const d = deudores[i];
                const a = acreedores[j];
                const cantidad = Math.min(d.debe, a.cobra);

                if (cantidad > 0.01) {
                    transferencias.push(`💸 <strong>${d.nombre}</strong> debe transferir <strong>${eur(cantidad)}</strong> a <strong>${a.nombre}</strong>`);
                }

                d.debe -= cantidad;
                a.cobra -= cantidad;

                if (d.debe <= 0.01) i++;
                if (a.cobra <= 0.01) j++;
            }

            lblSettlement.innerHTML = `
                <div>
                    ⚖️ <strong>Cuota equitativa neta:</strong> ${eur(cuotaEquitativa)} por miembro (${N} miembros).
                    <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 4px;">
                        ${transferencias.join('')}
                    </div>
                </div>
            `;
        }
    }

    // Deudas por concepto: "N le debe X a N2 en fijos: concepto (categoría)".
    // Gasto compartido: quien no pagó le debe su parte a quien pagó.
    // Ingreso compartido (al revés): quien lo cobró le debe su parte a los demás.
    const contConcept = document.getElementById('splitConceptContainer');
    if (contConcept) {
        const lineas = [];
        if (N >= 2) {
            compartidos.forEach(op => {
                const tel = op.telefono ? String(op.telefono) : null;
                if (!tel || !miembros.includes(tel)) return;
                const parte = op.cantidad / N;
                if (parte <= 0.005) return;
                const origen = op.esFijo ? 'fijos' : 'puntuales';
                const etiqueta = `${op.concepto} (${op.categoria || 'General'})`;
                miembros.filter(m => m !== tel).forEach(otro => {
                    if (op.tipo === 'ingreso') {
                        lineas.push(`<div>💸 <strong>${nombreDe(tel)}</strong> le debe <strong>${eur(parte)}</strong> a <strong>${nombreDe(otro)}</strong> en ${origen}: ${etiqueta}</div>`);
                    } else {
                        lineas.push(`<div>💸 <strong>${nombreDe(otro)}</strong> le debe <strong>${eur(parte)}</strong> a <strong>${nombreDe(tel)}</strong> en ${origen}: ${etiqueta}</div>`);
                    }
                });
            });
        }
        sinMiembro.forEach(op => {
            lineas.push(`<div style="opacity: 0.75;">➗ <strong>${op.concepto}</strong> (${eur(op.cantidad)}) sin miembro asignado: repartido a partes iguales, no genera deudas.</div>`);
        });
        contConcept.innerHTML = lineas.length ? lineas.join('') : '<span style="opacity: 0.7;">Sin deudas por concepto este mes.</span>';
    }

    // Deudas por categoría (puntuales + fijos juntos)
    const contCat = document.getElementById('splitCategoryContainer');
    if (contCat) {
        const porCat = {};
        compartidos.forEach(op => {
            const c = op.categoria || 'General';
            if (!porCat[c]) porCat[c] = { net: {}, tot: 0 };
            const v = op.tipo === 'ingreso' ? -op.cantidad : op.cantidad;
            porCat[c].tot += v;
            const tel = op.telefono ? String(op.telefono) : null;
            if (tel && miembros.includes(tel)) {
                porCat[c].net[tel] = (porCat[c].net[tel] || 0) + v;
            } else if (N > 0) {
                miembros.forEach(m => { porCat[c].net[m] = (porCat[c].net[m] || 0) + v / N; });
            }
        });
        const htmlCat = [];
        Object.entries(porCat).forEach(([cat, d]) => {
            const fair = N > 0 ? d.tot / N : 0;
            const deud = [], acre = [];
            miembros.forEach(m => {
                const b = (d.net[m] || 0) - fair;
                if (b < -0.01) deud.push({ m, debe: -b });
                else if (b > 0.01) acre.push({ m, cobra: b });
            });
            const tr = [];
            let ii = 0, jj = 0;
            while (ii < deud.length && jj < acre.length) {
                const c = Math.min(deud[ii].debe, acre[jj].cobra);
                if (c > 0.01) tr.push(`<strong>${nombreDe(deud[ii].m)}</strong> le debe <strong>${eur(c)}</strong> a <strong>${nombreDe(acre[jj].m)}</strong>`);
                deud[ii].debe -= c; acre[jj].cobra -= c;
                if (deud[ii].debe <= 0.01) ii++;
                if (acre[jj].cobra <= 0.01) jj++;
            }
            htmlCat.push(`<div>📂 <strong>${cat}</strong>: ${tr.length ? tr.join(' · ') : 'equilibrado.'}</div>`);
        });
        contCat.innerHTML = htmlCat.length ? htmlCat.join('') : '<span style="opacity: 0.7;">Sin movimientos compartidos este mes.</span>';
    }

    // Directorio de Miembros
    const dirContainer = document.getElementById('usersDirectoryContainer');
    dirContainer.innerHTML = '';
    Object.entries(estado.usuarios).forEach(([tel, nombre]) => {
        const esMio = estado.miTelefono && String(estado.miTelefono) === String(tel);
        dirContainer.innerHTML += `
            <div style="display: flex; gap: 10px; align-items: center; background: var(--bg-card-hover); padding: 10px 14px; border-radius: var(--radius-md); flex-wrap: wrap;">
                <span style="font-weight: 700; color: var(--primary); min-width: 120px;">📱 ${tel}</span>
                <input type="text" value="${nombre}" id="nameInput_${tel}" class="form-control" style="flex: 1; min-width: 140px; padding: 6px 10px; font-size: 0.88rem;" placeholder="Nombre...">
                <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                    ${esMio
                        ? '<span class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem; border-color: var(--success); color: var(--success-text);">★ Mi teléfono</span><button class="btn btn-outline" style="padding: 6px 10px; font-size: 0.8rem;" title="Dejar de usar como mi teléfono" onclick="quitarMiTelefono()">✖</button>'
                        : `<button class="btn btn-outline" style="padding: 6px 12px; font-size: 0.8rem;" title="Usar como mi teléfono para el respaldo personal" onclick="marcarMiTelefono('${tel}')">📲 Es mi teléfono</button>`}
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

    // LIMPIEZA DE LÁPIDA: Si el usuario estaba marcado como borrado, quitar la marca y forzar sincronización
    if (typeof NUBE_quitarBorrado === 'function') {
        NUBE_quitarBorrado('usr', telefono);
    }

    estado.usuarios[telefono] = nombre;
    guardarLocalmente();
    
    // Si la nube está vinculada, forzamos una subida inmediata para evitar conflictos
    if (typeof programarSubidaNube === 'function') {
        programarSubidaNube(true); 
    }

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
        
        // Guardamos localmente y forzamos subida para que la nube actualice su lista
        guardarLocalmente();
        if (typeof programarSubidaNube === 'function') {
            programarSubidaNube(true); 
        }

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

    const prevFiltroCat = (estado.filtros && estado.filtros.categoria) || (selectFiltro && selectFiltro.value) || 'todas';

    if (selectOp) selectOp.innerHTML = '';
    if (selectRec) selectRec.innerHTML = '';
    if (selectFiltro) selectFiltro.innerHTML = '<option value="todas">Todas las Categorías</option>';

    Object.entries(CATEGORIAS_CONFIG).forEach(([nombre, conf]) => {
        const opt = `<option value="${nombre}">${conf.icon} ${nombre}</option>`;
        if (selectOp) selectOp.innerHTML += opt;
        if (selectRec) selectRec.innerHTML += opt;
        if (selectFiltro) selectFiltro.innerHTML += opt;
    });

    // Preservar el filtro si sigue siendo válido; si no, volver a "todas"
    try {
        if (selectFiltro) {
            const valida = Array.from(selectFiltro.options || []).some(o => o.value === prevFiltroCat);
            selectFiltro.value = valida ? prevFiltroCat : 'todas';
            estado.filtros.categoria = selectFiltro.value;
        }
    } catch (e) {}

    actualizarSelectUsuarios();
}

function actualizarSelectUsuarios() {
    const selectOpUser = document.getElementById('opTelefono');
    const selectFilterUser = document.getElementById('filterUsuario');
    const selectRecUser = document.getElementById('recTelefono');

    const prevFiltroUsr = (estado.filtros && estado.filtros.usuario) || (selectFilterUser && selectFilterUser.value) || 'todos';

    if (selectOpUser) selectOpUser.innerHTML = '';
    if (selectFilterUser) selectFilterUser.innerHTML = '<option value="todos">Todos los Miembros</option>';
    if (selectRecUser) selectRecUser.innerHTML = '<option value="">Sin asignar (se reparte a partes iguales)</option>';

    Object.entries(estado.usuarios || {}).forEach(([tel, nom]) => {
        if (selectOpUser) selectOpUser.innerHTML += `<option value="${tel}">${nom} (${tel})</option>`;
        if (selectFilterUser) selectFilterUser.innerHTML += `<option value="${tel}">${nom}</option>`;
        if (selectRecUser) selectRecUser.innerHTML += `<option value="${tel}">${nom} (${tel})</option>`;
    });
    // Preservar el filtro de miembro si sigue existiendo; si no, volver a "todos"
    // (antes se reconstruía el desplegable pero estado.filtros conservaba el id viejo
    // y todo quedaba en "Mostrando 0 de N" aunque el desplegable mostrara "Todos").
    try {
        if (selectFilterUser) {
            const valida = prevFiltroUsr === 'todos' || Array.from(selectFilterUser.options || []).some(o => o.value === prevFiltroUsr);
            selectFilterUser.value = valida ? prevFiltroUsr : 'todos';
            estado.filtros.usuario = selectFilterUser.value;
        }
    } catch (e) {}
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

    const userKeys = Object.keys(estado.usuarios);
    if (userKeys.length === 1) {
        document.getElementById('opTelefono').value = prefill.telefono || userKeys[0];
    } else {
        document.getElementById('opTelefono').value = prefill.telefono || '';
    }
    document.getElementById('opTipo').value = prefill.tipo || 'gasto';
    document.getElementById('opCantidad').value = prefill.cantidad || '';
    document.getElementById('opConcepto').value = prefill.concepto || '';
    document.getElementById('opCategoria').value = prefill.categoria || 'Alimentación';
    document.getElementById('opFormaPago').value = prefill.formaPago || 'efectivo';
    // En edición respetar el valor guardado; en creación, sin marcar por defecto
    if (prefill.id !== undefined && prefill.id !== '' && prefill.id !== null) {
        document.getElementById('opEsCompartido').checked = !!prefill.esCompartido;
    } else {
        document.getElementById('opEsCompartido').checked = prefill.esCompartido !== undefined ? !!prefill.esCompartido : false;
    }

    // Usar fecha local para el input (evita desfase UTC en edición)
    const fechaDefecto = prefill.fecha ? isoAFechaInput(prefill.fecha) : fechaHoyISO();
    document.getElementById('opFecha').value = String(fechaDefecto).substring(0, 10);

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
        if (Object.keys(estado.usuarios || {}).length === 0) {
            mostrarToast('Primero añade un miembro en Reparto Familiar para poder guardar operaciones.', 'danger');
        } else {
            mostrarToast('Debes elegir obligatoriamente el miembro que paga o cobra.', 'danger');
        }
        return;
    }
    const esCompartido = document.getElementById('opEsCompartido').checked;
    const esFijo = document.getElementById('opEsFijo') ? document.getElementById('opEsFijo').checked : false;

    if (!concepto || isNaN(cantidad) || cantidad <= 0) {
        mostrarToast('Indica un concepto y una cantidad válida.', 'danger');
        return;
    }
    if (!fecha) {
        mostrarToast('Indica la fecha de la operación.', 'danger');
        return;
    }

    const payload = {
        telefono,
        tipo,
        concepto,
        categoria,
        cantidad,
        esCompartido,
        formaPago: document.getElementById('opFormaPago').value || 'efectivo',
        fecha: fechaInputALocalISO(fecha)
    };

    let savedId = id || null;
    if (id) {
        const index = estado.transacciones.findIndex(t => t.id == id);
        if (index !== -1) {
            estado.transacciones[index] = { ...estado.transacciones[index], ...payload };
            estado.transacciones[index]._mod = Date.now();
            savedId = estado.transacciones[index].id;
        }
        guardarLocalmente();
        try { api(`/api/transaccion/${id}`, 'PUT', payload).catch(() => {}); } catch (e) {}
    } else {
        const nuevaOp = {
            id: Date.now(),
            ...payload
        };
        estado.transacciones.push(nuevaOp);
        savedId = nuevaOp.id;

        if (esFijo) {
            const diaFijo = parseInt(document.getElementById('opDiaFijo').value) || 1;
            const nuevoRec = {
                id: Date.now() + 1,
                concepto,
                tipo,
                dia: diaFijo,
                cantidad,
                categoria,
                telefono: telefono || null,
                esCompartido: !!esCompartido,
                activo: true
            };
            estado.recurrentes.push(nuevoRec);
            try { api('/api/recurrente', 'POST', nuevoRec).catch(() => {}); } catch (e) {}
        }

        guardarLocalmente();
        try { api('/api/transaccion', 'POST', payload).catch(() => {}); } catch (e) {}
    }

    // GARANTÍA DE VISIBILIDAD EN "Movimientos del Mes" (Resumen):
    // 1. Saltar al mes de la operación (aunque fuera distinto/futuro).
    // 2. Limpiar los 5 filtros para que nada la oculte.
    // 3. Ir a la pestaña Resumen y repintar todo.
    const claveOp = claveMesDeFechaInput(fecha);
    if (claveOp) {
        estado.mesSeleccionado = claveOp;
        try {
            const partes = claveOp.split('-').map(Number);
            estado.mesCalendario = { anio: partes[0], mes: partes[1] - 1 };
        } catch (e) {}
    }
    try {
        estado.filtros = { busqueda: '', tipo: 'todos', categoria: 'todas', usuario: 'todos', formaPago: 'todos' };
        const inBus = document.getElementById('inputSearchTx'); if (inBus) inBus.value = '';
        const fTipo = document.getElementById('filterTipo'); if (fTipo) fTipo.value = 'todos';
        const fCat = document.getElementById('filterCategoria'); if (fCat) fCat.value = 'todas';
        const fUsr = document.getElementById('filterUsuario'); if (fUsr) fUsr.value = 'todos';
        const fPago = document.getElementById('filterFormaPago'); if (fPago) fPago.value = 'todos';
    } catch (err) {}

    cerrarModal('modalOperacion');
    try { inicializarSelectorMeses(); } catch (e) {}
    try { cambiarTab('resumen'); } catch (e) {}
    try { actualizarVistas(); } catch (e) {}

    // Verificación: la operación tiene que estar en el mes visible tras guardar.
    // Si algo la sigue ocultando, se fuerza de nuevo y se avisa por consola/toast.
    try {
        const partesV = String(estado.mesSeleccionado).split('-').map(Number);
        const opsVisibles = obtenerOperacionesMes(partesV[0], partesV[1]);
        const visible = opsVisibles.some(o => String(o.id) === String(savedId));
        if (!visible) {
            console.error('[Gastos] La operación guardada no quedó visible en', estado.mesSeleccionado, 'id=', savedId);
            mostrarToast('Se guardó pero no quedó visible: pulsa ✖ Limpiar filtros', 'danger');
        } else {
            const nombres = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
            mostrarToast(`Operación guardada y visible en ${nombres[partesV[1]-1]} ${partesV[0]}`, 'success');
        }
    } catch (e) {
        mostrarToast('Operación guardada con éxito', 'success');
    }
    try { if (savedId !== null && savedId !== undefined) resaltarMovimiento(savedId); } catch (e) {}
}

function resaltarMovimiento(idBuscado) {
    try {
        const sel = `[data-id="${String(idBuscado)}"]`;
        const el = document.querySelector('#txListContainer ' + sel);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const prevOutline = el.style.outline;
        const prevBg = el.style.background;
        el.style.outline = '3px solid var(--primary, #7c3aed)';
        el.style.outlineOffset = '2px';
        setTimeout(() => {
            try { el.style.outline = prevOutline || ''; el.style.background = prevBg || ''; } catch (e) {}
        }, 2600);
    } catch (e) {}
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
    document.getElementById('modalRecurrenteTitle').textContent = prefill.id ? 'Editar Fijo' : 'Nuevo Fijo';

    document.getElementById('recTipo').value = prefill.tipo || 'gasto';
    document.getElementById('recCantidad').value = prefill.cantidad || '';
    document.getElementById('recConcepto').value = prefill.concepto || '';
    document.getElementById('recDia').value = prefill.dia || 1;
    document.getElementById('recCategoria').value = prefill.categoria || 'Vivienda';
    document.getElementById('recTelefono').value = prefill.telefono || '';
    document.getElementById('recEsCompartido').checked = !!prefill.esCompartido;

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
    const telefono = document.getElementById('recTelefono') ? document.getElementById('recTelefono').value || null : null;
    const esCompartido = document.getElementById('recEsCompartido') ? document.getElementById('recEsCompartido').checked : false;

    const payload = { tipo, cantidad, concepto, dia, categoria, telefono, esCompartido, activo: true };

    if (id) {
        const index = estado.recurrentes.findIndex(r => r.id == id);
        if (index !== -1) {
            estado.recurrentes[index] = { ...estado.recurrentes[index], ...payload };
            estado.recurrentes[index]._mod = Date.now();
        }
        guardarLocalmente();
        api(`/api/recurrente/${id}`, 'PUT', payload).catch(() => {});
        mostrarToast('Fijo actualizado', 'success');
    } else {
        const nuevo = { id: Date.now(), ...payload };
        estado.recurrentes.push(nuevo);
        guardarLocalmente();
        api('/api/recurrente', 'POST', payload).catch(() => {});
        mostrarToast('Fijo registrado', 'success');
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
    if (confirm('¿Eliminar este fijo?')) {
        estado.recurrentes = estado.recurrentes.filter(r => r.id !== id);
        try { if (typeof NUBE_marcarBorrado === 'function') NUBE_marcarBorrado('rec', id); } catch (e) {}
        guardarLocalmente();
        api(`/api/recurrente/${id}`, 'DELETE').catch(() => {});
        mostrarToast('Fijo eliminado', 'success');
        actualizarVistas();
    }
}

// ==========================================================================
// Copias de Seguridad, Exportación & Simulación
// ==========================================================================

function exportarJSON() {
    descargarJSON({
        transacciones: estado.transacciones,
        recurrentes: estado.recurrentes,
        metasPorMes: estado.metasPorMes,
        metasBorradas: estado.metasBorradas || {},
        metasCompartidas: estado.metasCompartidas || {},
        planesAmortizacion: estado.planesAmortizacion || [],
        repartoPredeterminado: estado.repartoPredeterminado || {},
        usuarios: estado.usuarios,
        miTelefono: estado.miTelefono || null,
        respaldoPIN: estado.respaldoPIN || null
    }, `gestor_gastos_backup_${new Date().toISOString().substring(0, 10)}.json`);
    mostrarToast('Copia de seguridad JSON descargada', 'info');
}

function descargarJSON(obj, nombreArchivo) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(obj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", nombreArchivo);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function filaCSV(t) {
    const fechaTxt = (t && t.fecha && typeof t.fecha === 'string') ? t.fecha.substring(0, 10) : '';
    const conceptoTxt = String((t && t.concepto) || '').replace(/"/g, '""');
    const categoriaTxt = String((t && t.categoria) || '');
    const cantidadNum = Number(t && t.cantidad);
    return [
        (t && t.id !== undefined) ? t.id : '',
        fechaTxt,
        (t && t.tipo) || '',
        `"${conceptoTxt}"`,
        `"${categoriaTxt}"`,
        isNaN(cantidadNum) ? '0.00' : cantidadNum.toFixed(2),
        `"${(estado.usuarios && estado.usuarios[t.telefono]) || (t && t.telefono) || ''}"`,
        (t && t.esCompartido) ? "Sí" : "No"
    ];
}

function descargarCSVLista(lista, nombreArchivo) {
    const encabezados = ["ID", "Fecha", "Tipo", "Concepto", "Categoría", "Cantidad (€)", "Miembro/Teléfono", "Compartido"];
    const filas = (lista || []).map(filaCSV);
    const csvContent = "\uFEFF" + [encabezados.join(";"), ...filas.map(f => f.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    a.remove();
    try { setTimeout(() => URL.revokeObjectURL(url), 5000); } catch (e) {}
}

function exportarCSV() {
    descargarCSVLista(estado.transacciones, `movimientos_gastos_${new Date().toISOString().substring(0, 10)}.csv`);
    mostrarToast('Archivo CSV para Excel generado con éxito', 'info');
}

function claveMesDeTx(t) {
    try {
        if (t && typeof t.fecha === 'string' && /^\d{4}-\d{2}/.test(t.fecha)) return t.fecha.substring(0, 7);
        if (t && t.fecha) {
            const d = new Date(t.fecha);
            if (!isNaN(d)) return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
        }
    } catch (e) {}
    return null;
}

function inicializarSelectoresExportacion() {
    try {
        const selMes = document.getElementById('exportMes');
        const selAnio = document.getElementById('exportAnio');
        if (!selMes && !selAnio) return;
        const mesesSet = new Set();
        // Últimos 12 meses siempre disponibles para que el cliente pueda
        // elegir cualquier mes aunque aún no tenga movimientos.
        const h0 = new Date();
        for (let i = 0; i < 12; i++) {
            const d = new Date(h0.getFullYear(), h0.getMonth() - i, 1);
            mesesSet.add(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'));
        }
        (estado.transacciones || []).forEach(t => {
            const c = claveMesDeTx(t);
            if (c && /^\d{4}-\d{2}$/.test(c)) mesesSet.add(c);
        });
        Object.keys(estado.metasPorMes || {}).forEach(k => {
            if (/^\d{4}-\d{2}$/.test(k)) mesesSet.add(k);
        });
        if (estado.mesSeleccionado && /^\d{4}-\d{2}$/.test(estado.mesSeleccionado)) mesesSet.add(estado.mesSeleccionado);
        const meses = Array.from(mesesSet).sort().reverse();
        const aniosSet = new Set(meses.map(m => m.substring(0, 4)));
        const h = new Date();
        // Año actual y los 2 anteriores siempre elegibles.
        aniosSet.add(String(h.getFullYear()));
        aniosSet.add(String(h.getFullYear() - 1));
        aniosSet.add(String(h.getFullYear() - 2));
        const anios = Array.from(aniosSet).sort().reverse();
        const nombresMeses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        if (selMes) {
            const prev = selMes.value;
            selMes.innerHTML = '';
            if (!meses.length) selMes.innerHTML = '<option value="">Sin datos</option>';
            meses.forEach(clave => {
                const partes = clave.split('-').map(Number);
                const opt = document.createElement('option');
                opt.value = clave;
                opt.textContent = `${nombresMeses[partes[1] - 1]} ${partes[0]}`;
                selMes.appendChild(opt);
            });
            if (prev && meses.includes(prev)) selMes.value = prev;
            else if (estado.mesSeleccionado && meses.includes(estado.mesSeleccionado)) selMes.value = estado.mesSeleccionado;
        }
        if (selAnio) {
            const prevA = selAnio.value;
            selAnio.innerHTML = '';
            anios.forEach(a => {
                const opt = document.createElement('option');
                opt.value = a;
                opt.textContent = a;
                selAnio.appendChild(opt);
            });
            if (prevA && anios.includes(prevA)) selAnio.value = prevA;
            else selAnio.value = String(h.getFullYear());
        }
    } catch (e) {}
}

function exportarCSVPorMes() {
    const sel = document.getElementById('exportMes');
    const mes = sel ? sel.value : estado.mesSeleccionado;
    if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
        mostrarToast('No hay mes disponible para exportar', 'danger');
        return;
    }
    const lista = (estado.transacciones || []).filter(t => claveMesDeTx(t) === mes);
    descargarCSVLista(lista, `movimientos_${mes}.csv`);
    mostrarToast(lista.length ? `${lista.length} movimientos de ${mes} descargados en CSV` : `No hay movimientos en ${mes} (archivo vacío con cabeceras)`, lista.length ? 'success' : 'info');
}

function exportarJSONPorMes() {
    const sel = document.getElementById('exportMes');
    const mes = sel ? sel.value : estado.mesSeleccionado;
    if (!mes || !/^\d{4}-\d{2}$/.test(mes)) {
        mostrarToast('No hay mes disponible para exportar', 'danger');
        return;
    }
    const txs = (estado.transacciones || []).filter(t => claveMesDeTx(t) === mes);
    const metas = {};
    if (estado.metasPorMes && estado.metasPorMes[mes] !== undefined) metas[mes] = estado.metasPorMes[mes];
    const metasComp = {};
    if (estado.metasCompartidas && estado.metasCompartidas[mes] !== undefined) metasComp[mes] = estado.metasCompartidas[mes];
    descargarJSON({
        periodo: mes,
        transacciones: txs,
        recurrentes: estado.recurrentes || [],
        metasPorMes: metas,
        metasCompartidas: metasComp,
        usuarios: estado.usuarios || {}
    }, `backup_${mes}.json`);
    mostrarToast(txs.length ? `${txs.length} movimientos de ${mes} descargados en JSON` : `No hay movimientos en ${mes} (copia vacía)`, txs.length ? 'success' : 'info');
}

function exportarCSVPorAnio() {
    const sel = document.getElementById('exportAnio');
    const anio = sel ? sel.value : String(new Date().getFullYear());
    if (!anio || !/^\d{4}$/.test(anio)) {
        mostrarToast('No hay año disponible para exportar', 'danger');
        return;
    }
    const lista = (estado.transacciones || []).filter(t => {
        const c = claveMesDeTx(t);
        return c && c.substring(0, 4) === anio;
    });
    descargarCSVLista(lista, `movimientos_${anio}.csv`);
    mostrarToast(lista.length ? `${lista.length} movimientos de ${anio} descargados en CSV` : `No hay movimientos en ${anio} (archivo vacío con cabeceras)`, lista.length ? 'success' : 'info');
}

function exportarJSONPorAnio() {
    const sel = document.getElementById('exportAnio');
    const anio = sel ? sel.value : String(new Date().getFullYear());
    if (!anio || !/^\d{4}$/.test(anio)) {
        mostrarToast('No hay año disponible para exportar', 'danger');
        return;
    }
    const txs = (estado.transacciones || []).filter(t => {
        const c = claveMesDeTx(t);
        return c && c.substring(0, 4) === anio;
    });
    const metas = {};
    Object.keys(estado.metasPorMes || {}).forEach(k => {
        if (k.substring(0, 4) === anio) metas[k] = estado.metasPorMes[k];
    });
    const metasComp = {};
    Object.keys(estado.metasCompartidas || {}).forEach(k => {
        if (k.substring(0, 4) === anio) metasComp[k] = estado.metasCompartidas[k];
    });
    descargarJSON({
        periodo: anio,
        transacciones: txs,
        recurrentes: estado.recurrentes || [],
        metasPorMes: metas,
        metasCompartidas: metasComp,
        usuarios: estado.usuarios || {}
    }, `backup_${anio}.json`);
    mostrarToast(txs.length ? `${txs.length} movimientos de ${anio} descargados en JSON` : `No hay movimientos en ${anio} (copia vacía)`, txs.length ? 'success' : 'info');
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
            if (contenido.metasBorradas) estado.metasBorradas = contenido.metasBorradas;
            if (contenido.metasCompartidas) estado.metasCompartidas = contenido.metasCompartidas;
            if (contenido.planesAmortizacion) estado.planesAmortizacion = contenido.planesAmortizacion;
            if (contenido.repartoPredeterminado) estado.repartoPredeterminado = contenido.repartoPredeterminado;
            if (contenido.usuarios) estado.usuarios = contenido.usuarios;
            if (typeof contenido.miTelefono === 'string' && contenido.miTelefono) estado.miTelefono = contenido.miTelefono;
            if (typeof contenido.respaldoPIN === 'string' && contenido.respaldoPIN) estado.respaldoPIN = contenido.respaldoPIN;

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
        estado.metasBorradas = {};
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
// Restablecer todos los datos a 0 (estado vacío)
// ==========================================================================

async function restablecerDatosA0() {
    if (!confirm('¿Estás seguro que quieres restablecer todos los datos a 0?\n\nSe borrará TODO lo de este dispositivo (movimientos, fijos, metas, miembros y números).\n\nNO se toca la nube del hogar (los demás siguen con acceso) NI tu copia personal por teléfono (podrás recuperarla con tu número + PIN).')) {
        return;
    }
    // Desvincular primero y en silencio: así el vaciado local no puede subirse
    // a ninguna nube ni borrar la copia del hogar ni la personal.
    try { if (typeof desvincularHogarSilencioso === 'function') desvincularHogarSilencioso(); } catch (e) {}
    try { if (timerRespaldoPersonal) clearTimeout(timerRespaldoPersonal); } catch (e) {}
    try { timerRespaldoPersonal = null; } catch (e) {}
    estado.transacciones = [];
    estado.recurrentes = [];
    estado.metasPorMes = {};
    estado.metasBorradas = {};
    estado.metasCompartidas = {};
    estado.planesAmortizacion = [];
    estado.repartoPredeterminado = {};
    estado.usuarios = {};
    estado._borrados = {};
    estado.miTelefono = null;
    estado.respaldoPIN = null;
    try { localStorage.removeItem(LS_RESPALDO_TS); } catch (e) {}
    guardarLocalmente();
    try { if (typeof programarSubidaNube === 'function') programarSubidaNube(true); } catch (e) {}
    api('/api/simular', 'POST').catch(() => {});
    mostrarToast('Dispositivo restablecido a 0. Tu copia personal y la nube del hogar siguen a salvo.', 'info');
    inicializarSelectorMeses();
    actualizarSelectUsuarios();
    actualizarVistas();
}

// ==========================================================================
// Respaldo personal por teléfono + PIN (independiente del hogar compartido)
// - Requiere haber ejecutado el SQL de `respaldos_personales` en Supabase.
// - Sin vincular ni configurar: no hace nada, la app sigue 100% local.
// - La copia personal sobrevive al "Restablecer a 0" (si no, no se podría
//   recuperar solo con el teléfono).
// ==========================================================================

const LS_RESPALDO_TS = 'gestor_respaldo_personal_ts';
let timerRespaldoPersonal = null;

function normalizarTelefono(tel) {
    try { return String(tel || '').replace(/\s+/g, ''); } catch (e) { return ''; }
}

function respaldoPersonalConfigurado() {
    try {
        const c = (typeof window !== 'undefined' && window.NUBE_CONFIG) || {};
        return !!(c.SUPABASE_URL && c.SUPABASE_KEY);
    } catch (e) { return false; }
}

function respaldoPersonalActivo() {
    try {
        if (!respaldoPersonalConfigurado()) return false;
        if (!estado.miTelefono || !estado.respaldoPIN) return false;
        if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' && !navigator.onLine) return false;
        return true;
    } catch (e) { return false; }
}

async function respaldoPersonalRPC(nombre, params) {
    const c = window.NUBE_CONFIG;
    if (!c || !c.SUPABASE_URL || !c.SUPABASE_KEY) throw new Error('respaldo sin configurar');
    let ctrl = null;
    let t = null;
    try {
        if (typeof AbortController !== 'undefined') {
            ctrl = new AbortController();
            t = setTimeout(function () { try { ctrl.abort(); } catch (e) {} }, 12000);
        }
        const res = await fetch(c.SUPABASE_URL + '/rest/v1/rpc/' + nombre, {
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
        const texto = await res.text().catch(() => '');
        if (!res.ok) {
            let msg = String(texto || '').slice(0, 200);
            try {
                const j = JSON.parse(texto);
                if (j && j.message) msg = String(j.message).slice(0, 200);
            } catch (e) {}
            throw new Error(msg || ('respaldo ' + res.status));
        }
        if (!texto) return null;
        try { return JSON.parse(texto); } catch (e) { return texto; }
    } catch (e) {
        if (t) clearTimeout(t);
        throw e;
    }
}

function mensajeRespaldo(e) {
    const m = String((e && e.message) || e || 'error');
    if (/PIN incorrecto/.test(m)) return 'PIN incorrecto para ese teléfono.';
    if (/Demasiados intentos/.test(m)) return 'Demasiados intentos: espera unos minutos.';
    if (/PIN debe tener/.test(m)) return 'El PIN debe tener entre 4 y 8 dígitos.';
    if (/Could not find the function|404/.test(m)) return 'falta ejecutar el SQL de respaldos en Supabase';
    if (/abort|Failed to fetch|NetworkError|Load failed/i.test(m)) return 'sin conexión a internet';
    return m.slice(0, 120);
}

function construirSnapshotLocal() {
    return {
        transacciones: estado.transacciones || [],
        recurrentes: estado.recurrentes || [],
        metasPorMes: estado.metasPorMes || {},
        metasBorradas: estado.metasBorradas || {},
        metasCompartidas: estado.metasCompartidas || {},
        planesAmortizacion: estado.planesAmortizacion || [],
        repartoPredeterminado: estado.repartoPredeterminado || {},
        usuarios: estado.usuarios || {},
        _borrados: estado._borrados || {}
    };
}

function programarRespaldoPersonal() {
    try {
        if (!respaldoPersonalActivo()) return;
        if (timerRespaldoPersonal) clearTimeout(timerRespaldoPersonal);
        timerRespaldoPersonal = setTimeout(function () { subidaRespaldoPersonal(false); }, 2000);
    } catch (e) {}
}

function obtenerTSRespaldoPersonal() {
    try {
        const v = localStorage.getItem(LS_RESPALDO_TS);
        const n = parseInt(v, 10);
        return isNaN(n) ? null : n;
    } catch (e) { return null; }
}

async function subidaRespaldoPersonal(manual) {
    timerRespaldoPersonal = null;
    if (!respaldoPersonalActivo()) return false;
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' && !navigator.onLine) {
        if (manual) mostrarToast('Sin conexión a internet.', 'danger');
        return false;
    }
    try {
        await respaldoPersonalRPC('guardar_respaldo', {
            p_telefono: estado.miTelefono,
            p_pin: estado.respaldoPIN,
            p_datos: construirSnapshotLocal()
        });
        try { localStorage.setItem(LS_RESPALDO_TS, String(Date.now())); } catch (e) {}
        try { refrescarRespaldoPersonalUI(); } catch (e) {}
        if (manual) mostrarToast('Copia personal guardada en la nube.', 'success');
        return true;
    } catch (e) {
        if (manual) mostrarToast('No se pudo guardar la copia: ' + mensajeRespaldo(e), 'danger');
        return false;
    }
}

async function marcarMiTelefono(tel) {
    tel = normalizarTelefono(tel);
    if (!tel) return;
    const nombre = (estado.usuarios && estado.usuarios[tel]) || tel;
    if (estado.miTelefono === tel && estado.respaldoPIN) {
        mostrarToast('Este ya es tu teléfono: el respaldo personal está activo.', 'info');
        return;
    }
    if (!respaldoPersonalConfigurado()) {
        mostrarToast('Respaldo sin configurar: falta nube-config.js.', 'danger');
        return;
    }
    if (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' && !navigator.onLine) {
        mostrarToast('Sin conexión a internet.', 'danger');
        return;
    }
    const pin = prompt('PIN de 4 a 8 dígitos para tu copia personal de "' + nombre + '".\nSi es la primera vez, este PIN quedará fijado. Lo necesitarás para recuperar tus datos.');
    if (pin === null) return;
    const pinLimpio = String(pin).trim();
    if (!/^\d{4,8}$/.test(pinLimpio)) {
        mostrarToast('El PIN debe tener entre 4 y 8 dígitos.', 'danger');
        return;
    }
    mostrarToast('Verificando tu copia personal…', 'info');
    try {
        // Si el teléfono ya tiene copia, exige su PIN; si no, devuelve null y se creará al subir.
        await respaldoPersonalRPC('obtener_respaldo', { p_telefono: tel, p_pin: pinLimpio });
        estado.miTelefono = tel;
        estado.respaldoPIN = pinLimpio;
        guardarLocalmente();
        const ok = await subidaRespaldoPersonal(true);
        if (ok) mostrarToast('Respaldo personal activado para "' + nombre + '".', 'success');
        actualizarVistas();
    } catch (e) {
        mostrarToast('No se pudo activar: ' + mensajeRespaldo(e), 'danger');
    }
}

function quitarMiTelefono() {
    if (!estado.miTelefono) return;
    if (!confirm('¿Desactivar el respaldo personal en este dispositivo?\n\nTu copia en la nube se conserva y podrás recuperarla con tu teléfono + PIN.')) {
        return;
    }
    estado.miTelefono = null;
    estado.respaldoPIN = null;
    try { localStorage.removeItem(LS_RESPALDO_TS); } catch (e) {}
    if (timerRespaldoPersonal) { try { clearTimeout(timerRespaldoPersonal); } catch (e) {} timerRespaldoPersonal = null; }
    guardarLocalmente();
    mostrarToast('Respaldo personal desactivado en este dispositivo.', 'info');
    actualizarVistas();
}

async function recuperarRespaldoPersonal() {
    let tel = '';
    let pin = '';
    try {
        tel = normalizarTelefono(document.getElementById('recTel').value);
        pin = String(document.getElementById('recPin').value || '').trim();
    } catch (e) {}
    if (!tel || !pin) {
        mostrarToast('Indica tu teléfono y tu PIN.', 'danger');
        return;
    }
    if (!respaldoPersonalConfigurado()) {
        mostrarToast('Respaldo sin configurar: falta nube-config.js.', 'danger');
        return;
    }
    mostrarToast('Buscando tu copia personal…', 'info');
    try {
        const datos = await respaldoPersonalRPC('obtener_respaldo', { p_telefono: tel, p_pin: pin });
        if (!datos) {
            mostrarToast('No hay ninguna copia guardada para ese teléfono.', 'info');
            return;
        }
        const tieneLocal = ((estado.transacciones || []).length > 0) || (Object.keys(estado.usuarios || {}).length > 0);
        if (tieneLocal && !confirm('Se ha encontrado tu copia personal.\n\n¿Reemplazar los datos de este dispositivo con tu copia?')) {
            return;
        }
        if (Array.isArray(datos.transacciones)) estado.transacciones = datos.transacciones;
        if (Array.isArray(datos.recurrentes)) estado.recurrentes = datos.recurrentes;
        if (datos.metasPorMes && typeof datos.metasPorMes === 'object') estado.metasPorMes = datos.metasPorMes;
        if (datos.metasBorradas && typeof datos.metasBorradas === 'object') estado.metasBorradas = datos.metasBorradas;
        if (datos.metasCompartidas && typeof datos.metasCompartidas === 'object') estado.metasCompartidas = datos.metasCompartidas;
        if (Array.isArray(datos.planesAmortizacion)) estado.planesAmortizacion = datos.planesAmortizacion;
        if (datos.repartoPredeterminado && typeof datos.repartoPredeterminado === 'object') estado.repartoPredeterminado = datos.repartoPredeterminado;
        if (datos.usuarios && typeof datos.usuarios === 'object') estado.usuarios = datos.usuarios;
        if (datos._borrados && typeof datos._borrados === 'object') estado._borrados = datos._borrados;
        estado.miTelefono = tel;
        estado.respaldoPIN = pin;
        guardarLocalmente();
        try { if (typeof programarSubidaNube === 'function') programarSubidaNube(true); } catch (e) {}
        inicializarSelectorMeses();
        actualizarSelectUsuarios();
        actualizarVistas();
        mostrarToast('¡Tus datos personales han sido recuperados!', 'success');
    } catch (e) {
        mostrarToast('No se pudo recuperar: ' + mensajeRespaldo(e), 'danger');
    }
}

function refrescarRespaldoPersonalUI() {
    try {
        const el = document.getElementById('respaldoPersonalEstado');
        if (!el) return;
        if (estado.miTelefono && estado.respaldoPIN) {
            const nombre = (estado.usuarios && estado.usuarios[estado.miTelefono]) || estado.miTelefono;
            const ts = obtenerTSRespaldoPersonal();
            const cuando = ts ? new Date(ts).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'pendiente de primera subida';
            el.innerHTML = '✅ Respaldo activo para <strong>' + nombre + ' (' + estado.miTelefono + ')</strong> · última copia: ' + cuando + '.';
        } else {
            el.textContent = 'Sin activar: marca "Es mi teléfono" en un miembro para empezar.';
        }
    } catch (e) {}
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
