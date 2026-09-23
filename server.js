const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json({ limit: '10mb' }));

// ===== Cabeceras PWA / instalable =====
app.get('/sw.js', (req, res, next) => {
  res.set('Cache-Control', 'no-cache');
  res.set('Service-Worker-Allowed', '/');
  next();
});
app.get('/manifest.json', (req, res, next) => {
  res.set('Content-Type', 'application/manifest+json');
  next();
});
app.use(express.static(path.join(__dirname, 'public'), {
  dotfiles: 'allow',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('sw.js')) {
      res.set('Cache-Control', 'no-cache');
      res.set('Service-Worker-Allowed', '/');
    }
  }
}));

function leerDatos() {
    if (!fs.existsSync(DATA_FILE)) {
        const datosIniciales = {
            transacciones: [],
            recurrentes: [],
            metasPorMes: {},
            metasCompartidas: {},
            planesAmortizacion: [],
            repartoPredeterminado: {},
            usuarios: {}
        };
        guardarDatos(datosIniciales);
        return datosIniciales;
    }
    try {
        const contenido = fs.readFileSync(DATA_FILE, 'utf8');
        const parseado = JSON.parse(contenido);
        if (!parseado.transacciones) parseado.transacciones = [];
        if (!parseado.recurrentes) parseado.recurrentes = [];
        if (!parseado.metasPorMes) parseado.metasPorMes = {};
        if (!parseado.metasCompartidas) parseado.metasCompartidas = {};
        if (!parseado.planesAmortizacion) parseado.planesAmortizacion = [];
        if (!parseado.repartoPredeterminado) parseado.repartoPredeterminado = {};
        if (!parseado.usuarios) {
            parseado.usuarios = {
                "600111222": "Alejandro",
                "600333444": "Pareja / Familiar"
            };
        }
        return parseado;
    } catch (e) {
        console.error("Error leyendo data.json:", e);
        return { transacciones: [], recurrentes: [], metasPorMes: {}, metasCompartidas: {}, planesAmortizacion: [], repartoPredeterminado: {}, usuarios: {} };
    }
}

function guardarDatos(datos) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(datos, null, 2), 'utf8');
}

// Obtener todos los datos
app.get('/api/datos', (req, res) => {
    const datos = leerDatos();
    res.json(datos);
});

// Crear nueva transacción
app.post('/api/transaccion', (req, res) => {
    const { telefono, tipo, concepto, categoria, cantidad, esCompartido, formaPago, fecha } = req.body;
    if (!concepto || cantidad === undefined || isNaN(parseFloat(cantidad))) {
        return res.status(400).json({ error: 'Concepto y cantidad válidos son obligatorios' });
    }

    const datos = leerDatos();
    const nuevaTransaccion = {
        id: Date.now(),
        telefono: telefono ? String(telefono).trim() : '600111222',
        tipo: tipo === 'ingreso' ? 'ingreso' : 'gasto',
        concepto: String(concepto).trim(),
        categoria: categoria || 'General',
        cantidad: Math.abs(parseFloat(cantidad)),
        esCompartido: !!esCompartido,
        formaPago: formaPago === 'tarjeta' ? 'tarjeta' : (formaPago === 'efectivo' ? 'efectivo' : (formaPago || '')),
        fecha: fecha ? new Date(fecha).toISOString() : new Date().toISOString()
    };

    datos.transacciones.push(nuevaTransaccion);
    guardarDatos(datos);
    res.status(201).json({ success: true, transaccion: nuevaTransaccion });
});

// Modificar transacción existente
app.put('/api/transaccion/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { telefono, tipo, concepto, categoria, cantidad, esCompartido, formaPago, fecha } = req.body;
    const datos = leerDatos();

    const index = datos.transacciones.findIndex(t => t.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    const t = datos.transacciones[index];
    if (telefono !== undefined) t.telefono = String(telefono).trim();
    if (tipo !== undefined) t.tipo = tipo === 'ingreso' ? 'ingreso' : 'gasto';
    if (concepto !== undefined) t.concepto = String(concepto).trim();
    if (categoria !== undefined) t.categoria = categoria;
    if (cantidad !== undefined && !isNaN(parseFloat(cantidad))) t.cantidad = Math.abs(parseFloat(cantidad));
    if (esCompartido !== undefined) t.esCompartido = !!esCompartido;
    if (formaPago !== undefined) t.formaPago = formaPago;
    if (fecha !== undefined) t.fecha = new Date(fecha).toISOString();

    guardarDatos(datos);
    res.json({ success: true, transaccion: t });
});

// Eliminar transacción
app.delete('/api/transaccion/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const datos = leerDatos();

    const initialLength = datos.transacciones.length;
    datos.transacciones = datos.transacciones.filter(t => t.id !== id);

    if (datos.transacciones.length === initialLength) {
        return res.status(404).json({ error: 'Transacción no encontrada' });
    }

    guardarDatos(datos);
    res.json({ success: true, message: 'Transacción eliminada' });
});

// Crear gasto/ingreso recurrente
app.post('/api/recurrente', (req, res) => {
    const { concepto, dia, cantidad, categoria, tipo } = req.body;
    if (!concepto || cantidad === undefined || isNaN(parseFloat(cantidad))) {
        return res.status(400).json({ error: 'Concepto y cantidad válidos son obligatorios' });
    }

    const datos = leerDatos();
    const nuevoRecurrente = {
        id: Date.now(),
        concepto: String(concepto).trim(),
        tipo: tipo === 'ingreso' ? 'ingreso' : 'gasto',
        dia: Math.min(31, Math.max(1, parseInt(dia) || 1)),
        cantidad: Math.abs(parseFloat(cantidad)),
        categoria: categoria || 'Vivienda',
        activo: true
    };

    datos.recurrentes.push(nuevoRecurrente);
    guardarDatos(datos);
    res.status(201).json({ success: true, recurrente: nuevoRecurrente });
});

// Modificar recurrente
app.put('/api/recurrente/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { concepto, dia, cantidad, categoria, tipo, activo } = req.body;
    const datos = leerDatos();

    const index = datos.recurrentes.findIndex(r => r.id === id);
    if (index === -1) {
        return res.status(404).json({ error: 'Gasto recurrente no encontrado' });
    }

    const r = datos.recurrentes[index];
    if (concepto !== undefined) r.concepto = String(concepto).trim();
    if (dia !== undefined) r.dia = Math.min(31, Math.max(1, parseInt(dia) || 1));
    if (cantidad !== undefined && !isNaN(parseFloat(cantidad))) r.cantidad = Math.abs(parseFloat(cantidad));
    if (categoria !== undefined) r.categoria = categoria;
    if (tipo !== undefined) r.tipo = tipo === 'ingreso' ? 'ingreso' : 'gasto';
    if (activo !== undefined) r.activo = !!activo;

    guardarDatos(datos);
    res.json({ success: true, recurrente: r });
});

// Eliminar recurrente
app.delete('/api/recurrente/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const datos = leerDatos();

    const initialLength = datos.recurrentes.length;
    datos.recurrentes = datos.recurrentes.filter(r => r.id !== id);

    if (datos.recurrentes.length === initialLength) {
        return res.status(404).json({ error: 'Gasto recurrente no encontrado' });
    }

    guardarDatos(datos);
    res.json({ success: true, message: 'Gasto recurrente eliminado' });
});

// Actualizar meta individual de un mes
app.post('/api/meta', (req, res) => {
    const { mes, meta } = req.body;
    if (!mes || meta === undefined || isNaN(parseFloat(meta))) {
        return res.status(400).json({ error: 'Mes (YYYY-MM) y meta válidos son obligatorios' });
    }

    const datos = leerDatos();
    datos.metasPorMes[mes] = parseFloat(meta);
    guardarDatos(datos);
    res.json({ success: true, metasPorMes: datos.metasPorMes });
});

// Actualizar lote de metas (para el plan de amortización / prorrateo)
app.post('/api/metas-lote', (req, res) => {
    const { metas } = req.body;
    if (!metas || typeof metas !== 'object') {
        return res.status(400).json({ error: 'Objeto de metas inválido' });
    }

    const datos = leerDatos();
    for (const [mes, valor] of Object.entries(metas)) {
        datos.metasPorMes[mes] = parseFloat(valor);
    }
    guardarDatos(datos);
    res.json({ success: true, metasPorMes: datos.metasPorMes });
});

// Guardar metas compartidas y reparto
app.post('/api/metas-compartidas', (req, res) => {
    const { metasCompartidas, repartoPredeterminado } = req.body;
    const datos = leerDatos();
    if (metasCompartidas && typeof metasCompartidas === 'object') {
        datos.metasCompartidas = metasCompartidas;
    }
    if (repartoPredeterminado && typeof repartoPredeterminado === 'object') {
        datos.repartoPredeterminado = repartoPredeterminado;
    }
    guardarDatos(datos);
    res.json({ success: true, metasCompartidas: datos.metasCompartidas, repartoPredeterminado: datos.repartoPredeterminado });
});

// Guardar planes de amortización
app.post('/api/planes-amortizacion', (req, res) => {
    const { planes } = req.body;
    if (!Array.isArray(planes)) {
        return res.status(400).json({ error: 'Array de planes inválido' });
    }
    const datos = leerDatos();
    datos.planesAmortizacion = planes;
    guardarDatos(datos);
    res.json({ success: true, planesAmortizacion: datos.planesAmortizacion });
});

// Actualizar nombres / usuarios
app.post('/api/usuarios', (req, res) => {
    const { telefono, nombre } = req.body;
    if (!telefono || !nombre) {
        return res.status(400).json({ error: 'Teléfono y nombre son requeridos' });
    }

    const datos = leerDatos();
    datos.usuarios[String(telefono).trim()] = String(nombre).trim();
    guardarDatos(datos);
    res.json({ success: true, usuarios: datos.usuarios });
});

// Eliminar usuario / teléfono
app.delete('/api/usuarios/:telefono', (req, res) => {
    const telefono = String(req.params.telefono).trim();
    const datos = leerDatos();

    if (!datos.usuarios || !datos.usuarios[telefono]) {
        return res.status(404).json({ error: 'Usuario o teléfono no encontrado' });
    }

    delete datos.usuarios[telefono];
    guardarDatos(datos);
    res.json({ success: true, message: 'Usuario eliminado', usuarios: datos.usuarios });
});

// Exportar datos completos en JSON
app.get('/api/exportar', (req, res) => {
    const datos = leerDatos();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="gestor_gastos_backup.json"');
    res.json(datos);
});

// Importar datos completos en JSON
app.post('/api/importar', (req, res) => {
    const { transacciones, recurrentes, metasPorMes, usuarios } = req.body;
    if (!Array.isArray(transacciones)) {
        return res.status(400).json({ error: 'Formato de datos no válido' });
    }

    const datosImportados = {
        transacciones: transacciones || [],
        recurrentes: Array.isArray(recurrentes) ? recurrentes : [],
        metasPorMes: (metasPorMes && typeof metasPorMes === 'object') ? metasPorMes : {},
        usuarios: (usuarios && typeof usuarios === 'object') ? usuarios : {
            "600111222": "Alejandro",
            "600333444": "Pareja / Familiar"
        }
    };

    guardarDatos(datosImportados);
    res.json({ success: true, message: 'Datos importados correctamente', datos: datosImportados });
});

// Simular / restablecer datos de demostración ricos y completos
app.post('/api/simular', (req, res) => {
    const datosSimulados = {
        usuarios: {
            "600111222": "Alejandro",
            "600333444": "Laura (Pareja)"
        },
        metasPorMes: {
            "2026-01": 250,
            "2026-02": 250,
            "2026-03": 300,
            "2026-04": 300,
            "2026-05": 300,
            "2026-06": 350,
            "2026-07": 400,
            "2026-08": 300,
            "2026-09": 350
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
            // Marzo 2026
            { id: 101, telefono: "600111222", tipo: "ingreso", concepto: "Bonus puntual", categoria: "Banco y Seguros", cantidad: 300, esCompartido: false, formaPago: "tarjeta", fecha: "2026-03-05T09:30:00.000Z" },
            { id: 102, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Mensual Mercadona", categoria: "Alimentación", cantidad: 280, esCompartido: true, formaPago: "tarjeta", fecha: "2026-03-08T11:00:00.000Z" },
            { id: 103, telefono: "600333444", tipo: "gasto", concepto: "Compra Frutería y Pescado", categoria: "Alimentación", cantidad: 95, esCompartido: true, formaPago: "efectivo", fecha: "2026-03-12T17:20:00.000Z" },
            { id: 104, telefono: "600111222", tipo: "gasto", concepto: "Gasolina Repsol", categoria: "Transporte", cantidad: 65, esCompartido: false, formaPago: "efectivo", fecha: "2026-03-15T18:00:00.000Z" },
            { id: 105, telefono: "600333444", tipo: "gasto", concepto: "Cena Aniversario", categoria: "Ocio y Actividades", cantidad: 110, esCompartido: true, formaPago: "tarjeta", fecha: "2026-03-20T21:30:00.000Z" },

            // Abril 2026
            { id: 106, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Carrefour", categoria: "Alimentación", cantidad: 320, esCompartido: true, formaPago: "tarjeta", fecha: "2026-04-06T10:15:00.000Z" },
            { id: 107, telefono: "600333444", tipo: "gasto", concepto: "Revisión Coche ITV", categoria: "Transporte", cantidad: 140, esCompartido: true, formaPago: "tarjeta", fecha: "2026-04-14T12:00:00.000Z" },
            { id: 108, telefono: "600111222", tipo: "gasto", concepto: "Farmacia y Vitaminas", categoria: "Salud y Cuidado", cantidad: 42, esCompartido: false, formaPago: "efectivo", fecha: "2026-04-18T18:45:00.000Z" },
            { id: 109, telefono: "600333444", tipo: "gasto", concepto: "Ropa entretiempo Zara", categoria: "Moda y Estética", cantidad: 85, esCompartido: false, formaPago: "tarjeta", fecha: "2026-04-22T16:30:00.000Z" },

            // Mayo 2026
            { id: 110, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Semanal", categoria: "Alimentación", cantidad: 310, esCompartido: true, formaPago: "tarjeta", fecha: "2026-05-04T11:00:00.000Z" },
            { id: 111, telefono: "600333444", tipo: "gasto", concepto: "Escapada fin de semana", categoria: "Ocio y Actividades", cantidad: 220, esCompartido: true, formaPago: "tarjeta", fecha: "2026-05-16T19:00:00.000Z" },
            { id: 112, telefono: "600111222", tipo: "gasto", concepto: "Gasolina Repsol", categoria: "Transporte", cantidad: 70, esCompartido: false, formaPago: "efectivo", fecha: "2026-05-20T08:30:00.000Z" },

            // Junio 2026
            { id: 113, telefono: "600111222", tipo: "ingreso", concepto: "Paga Extra Verano Alejandro", categoria: "Banco y Seguros", cantidad: 1200, esCompartido: false, formaPago: "tarjeta", fecha: "2026-06-25T10:00:00.000Z" },
            { id: 114, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Grande Mercadona", categoria: "Alimentación", cantidad: 340, esCompartido: true, formaPago: "tarjeta", fecha: "2026-06-08T12:00:00.000Z" },
            { id: 115, telefono: "600333444", tipo: "gasto", concepto: "Billetes de tren vacaciones", categoria: "Transporte", cantidad: 160, esCompartido: true, formaPago: "tarjeta", fecha: "2026-06-18T14:30:00.000Z" },
            { id: 116, telefono: "600111222", tipo: "gasto", concepto: "Gafas de sol y óptica", categoria: "Salud y Cuidado", cantidad: 95, esCompartido: false, formaPago: "tarjeta", fecha: "2026-06-22T17:15:00.000Z" },

            // Julio 2026
            { id: 117, telefono: "600333444", tipo: "ingreso", concepto: "Paga Extra Laura", categoria: "Banco y Seguros", cantidad: 1100, esCompartido: false, formaPago: "tarjeta", fecha: "2026-07-02T10:00:00.000Z" },
            { id: 118, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Vacacional", categoria: "Alimentación", cantidad: 390, esCompartido: true, formaPago: "tarjeta", fecha: "2026-07-07T11:00:00.000Z" },
            { id: 119, telefono: "600333444", tipo: "gasto", concepto: "Hotel y Alojamiento Playa", categoria: "Ocio y Actividades", cantidad: 550, esCompartido: true, formaPago: "tarjeta", fecha: "2026-07-15T12:00:00.000Z" },
            { id: 120, telefono: "600111222", tipo: "gasto", concepto: "Comidas fuera de casa", categoria: "Ocio y Actividades", cantidad: 210, esCompartido: true, formaPago: "tarjeta", fecha: "2026-07-22T22:00:00.000Z" },

            // Agosto 2026 (Mes enriquecido)
            { id: 121, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Mercadona", categoria: "Alimentación", cantidad: 295.40, esCompartido: true, formaPago: "tarjeta", fecha: "2026-08-03T11:30:00.000Z" },
            { id: 122, telefono: "600111222", tipo: "gasto", concepto: "Vestido Vintage Thrifting", categoria: "Moda y Estética", cantidad: 65.00, esCompartido: false, formaPago: "efectivo", fecha: "2026-08-04T12:00:00.000Z" },
            { id: 123, telefono: "600333444", tipo: "gasto", concepto: "Cena terraza con amigos", categoria: "Ocio y Actividades", cantidad: 115.50, esCompartido: true, formaPago: "tarjeta", fecha: "2026-08-08T22:15:00.000Z" },
            { id: 124, telefono: "600111222", tipo: "gasto", concepto: "Gasolina Repsol viaje", categoria: "Transporte", cantidad: 82.00, esCompartido: true, formaPago: "efectivo", fecha: "2026-08-12T09:45:00.000Z" },
            { id: 125, telefono: "600333444", tipo: "gasto", concepto: "Compra semanal Lidl", categoria: "Alimentación", cantidad: 124.30, esCompartido: true, formaPago: "tarjeta", fecha: "2026-08-16T18:20:00.000Z" },
            { id: 126, telefono: "600111222", tipo: "ingreso", concepto: "Venta objetos segunda mano Wallapop", categoria: "Otros", cantidad: 140.00, esCompartido: false, formaPago: "efectivo", fecha: "2026-08-19T17:00:00.000Z" },
            { id: 132, telefono: "600111222", tipo: "gasto", concepto: "Reforma baño imprevisto fontanero", categoria: "Vivienda", cantidad: 2800, esCompartido: true, formaPago: "tarjeta", fecha: "2026-08-20T10:00:00.000Z" },
            { id: 127, telefono: "600333444", tipo: "gasto", concepto: "Clínica Dental Higiene", categoria: "Salud y Cuidado", cantidad: 60.00, esCompartido: false, formaPago: "tarjeta", fecha: "2026-08-23T16:00:00.000Z" },
            { id: 128, telefono: "600111222", tipo: "gasto", concepto: "Cine de verano y palomitas", categoria: "Ocio y Actividades", cantidad: 32.00, esCompartido: true, formaPago: "efectivo", fecha: "2026-08-28T21:00:00.000Z" },

            // Septiembre 2026 (Mes actual)
            { id: 129, telefono: "600111222", tipo: "gasto", concepto: "Material oficina y vuelta al cole", categoria: "Otros", cantidad: 85.00, esCompartido: true, formaPago: "tarjeta", fecha: "2026-09-02T10:30:00.000Z" },
            { id: 130, telefono: "600333444", tipo: "gasto", concepto: "Supermercado Mensual Septiembre", categoria: "Alimentación", cantidad: 245.80, esCompartido: true, formaPago: "tarjeta", fecha: "2026-09-05T12:00:00.000Z" },
            { id: 131, telefono: "600111222", tipo: "gasto", concepto: "Abono transporte mensual", categoria: "Transporte", cantidad: 32.50, esCompartido: false, formaPago: "tarjeta", fecha: "2026-09-07T08:15:00.000Z" }
        ]
    };

    guardarDatos(datosSimulados);
    res.json({ success: true, message: 'Datos simulados cargados con éxito', datos: datosSimulados });
});

app.listen(PORT, () => {
    console.log(`Servidor de Gestor de Gastos listo en http://localhost:${PORT}`);
});