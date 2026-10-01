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
    const { concepto, dia, cantidad, categoria, tipo, telefono, esCompartido, formaPago } = req.body;
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
        telefono: telefono ? String(telefono).trim() : null,
        esCompartido: !!esCompartido,
        formaPago: formaPago === 'tarjeta' ? 'tarjeta' : 'efectivo',
        activo: true
    };

    datos.recurrentes.push(nuevoRecurrente);
    guardarDatos(datos);
    res.status(201).json({ success: true, recurrente: nuevoRecurrente });
});

// Modificar recurrente
app.put('/api/recurrente/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { concepto, dia, cantidad, categoria, tipo, activo, telefono, esCompartido, formaPago } = req.body;
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
    if (telefono !== undefined) r.telefono = telefono ? String(telefono).trim() : null;
    if (esCompartido !== undefined) r.esCompartido = !!esCompartido;
    if (formaPago !== undefined) r.formaPago = formaPago === 'tarjeta' ? 'tarjeta' : 'efectivo';

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
            "2026-06": 300,
            "2026-07": 300
        },
        recurrentes: [
            { id: 1, concepto: "Hipoteca / Alquiler Piso", tipo: "gasto", dia: 1, cantidad: 900, categoria: "Vivienda", telefono: "600111222", esCompartido: true, formaPago: "tarjeta", activo: true },
            { id: 2, concepto: "Nómina Fija Alejandro", tipo: "ingreso", dia: 1, cantidad: 900, categoria: "Banco y Seguros", telefono: "600111222", esCompartido: false, formaPago: "tarjeta", activo: true },
            { id: 3, concepto: "Nómina Fija Laura", tipo: "ingreso", dia: 2, cantidad: 700, categoria: "Banco y Seguros", telefono: "600333444", esCompartido: false, formaPago: "tarjeta", activo: true },
            { id: 4, concepto: "Seguro de Hogar & Coche", tipo: "gasto", dia: 5, cantidad: 50, categoria: "Banco y Seguros", telefono: "600111222", esCompartido: true, formaPago: "tarjeta", activo: true },
            { id: 5, concepto: "Fibra Óptica 1Gb + Móviles", tipo: "gasto", dia: 10, cantidad: 40, categoria: "Suministros", telefono: "600333444", esCompartido: true, formaPago: "tarjeta", activo: true },
            { id: 6, concepto: "Factura Eléctrica", tipo: "gasto", dia: 15, cantidad: 60, categoria: "Suministros", telefono: "600333444", esCompartido: true, formaPago: "efectivo", activo: true },
            { id: 7, concepto: "Suscripciones (Streaming/Gym)", tipo: "gasto", dia: 20, cantidad: 30, categoria: "Ocio y Actividades", telefono: "600111222", esCompartido: true, formaPago: "tarjeta", activo: true },
            { id: 8, concepto: "Suscripcion musica mini", tipo: "gasto", dia: 12, cantidad: 9.99, categoria: "Ocio y Actividades", telefono: "600111222", esCompartido: false, formaPago: "tarjeta", activo: true }
        ],
        transacciones: [
            { id: 101, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Marzo Mercadona", categoria: "Alimentación", cantidad: 120, esCompartido: true, formaPago: "tarjeta", fecha: "2026-03-08T11:00:00.000Z" },
            { id: 102, telefono: "600333444", tipo: "gasto", concepto: "Compra Frutería Marzo", categoria: "Alimentación", cantidad: 60, esCompartido: true, formaPago: "efectivo", fecha: "2026-03-12T17:20:00.000Z" },
            { id: 103, telefono: "600111222", tipo: "gasto", concepto: "Gasolina Marzo", categoria: "Transporte", cantidad: 40, esCompartido: false, formaPago: "efectivo", fecha: "2026-03-15T18:00:00.000Z" },
            { id: 104, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Carrefour", categoria: "Alimentación", cantidad: 130, esCompartido: true, formaPago: "tarjeta", fecha: "2026-04-06T10:15:00.000Z" },
            { id: 105, telefono: "600333444", tipo: "gasto", concepto: "Farmacia y Vitaminas", categoria: "Salud y Cuidado", cantidad: 50, esCompartido: false, formaPago: "efectivo", fecha: "2026-04-18T18:45:00.000Z" },
            { id: 106, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Semanal", categoria: "Alimentación", cantidad: 120, esCompartido: true, formaPago: "tarjeta", fecha: "2026-05-04T11:00:00.000Z" },
            { id: 107, telefono: "600333444", tipo: "gasto", concepto: "Compra Frutería Mayo", categoria: "Alimentación", cantidad: 60, esCompartido: true, formaPago: "efectivo", fecha: "2026-05-12T17:20:00.000Z" },
            { id: 108, telefono: "600111222", tipo: "gasto", concepto: "Gasolina Mayo", categoria: "Transporte", cantidad: 40, esCompartido: false, formaPago: "efectivo", fecha: "2026-05-20T08:30:00.000Z" },
            { id: 109, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Junio Mercadona", categoria: "Alimentación", cantidad: 120, esCompartido: true, formaPago: "tarjeta", fecha: "2026-06-08T11:00:00.000Z" },
            { id: 110, telefono: "600333444", tipo: "gasto", concepto: "Compra Frutería Junio", categoria: "Alimentación", cantidad: 60, esCompartido: true, formaPago: "efectivo", fecha: "2026-06-12T17:20:00.000Z" },
            { id: 111, telefono: "600333444", tipo: "gasto", concepto: "Bus Junio", categoria: "Transporte", cantidad: 40, esCompartido: false, formaPago: "tarjeta", fecha: "2026-06-18T14:30:00.000Z" },
            { id: 112, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Julio Mercadona", categoria: "Alimentación", cantidad: 210, esCompartido: true, formaPago: "tarjeta", fecha: "2026-07-07T11:00:00.000Z" },
            { id: 113, telefono: "600333444", tipo: "gasto", concepto: "Compra Frutería Julio", categoria: "Alimentación", cantidad: 120, esCompartido: true, formaPago: "efectivo", fecha: "2026-07-12T17:20:00.000Z" },
            { id: 114, telefono: "600111222", tipo: "gasto", concepto: "Cine Julio", categoria: "Ocio y Actividades", cantidad: 70, esCompartido: true, formaPago: "efectivo", fecha: "2026-07-18T21:30:00.000Z" },
            { id: 115, telefono: "600333444", tipo: "gasto", concepto: "Bus Julio", categoria: "Transporte", cantidad: 100, esCompartido: false, formaPago: "tarjeta", fecha: "2026-07-22T08:30:00.000Z" },
            { id: 116, telefono: "600111222", tipo: "ingreso", concepto: "Devolución compra", categoria: "Otros", cantidad: 130, esCompartido: false, formaPago: "tarjeta", fecha: "2026-07-25T10:00:00.000Z" },
            { id: 117, telefono: "600111222", tipo: "gasto", concepto: "Supermercado Agosto", categoria: "Alimentación", cantidad: 170, esCompartido: true, formaPago: "tarjeta", fecha: "2026-08-06T11:00:00.000Z" },
            { id: 118, telefono: "600333444", tipo: "gasto", concepto: "Compra Lidl Agosto", categoria: "Alimentación", cantidad: 80, esCompartido: true, formaPago: "tarjeta", fecha: "2026-08-12T12:00:00.000Z" },
            { id: 119, telefono: "600333444", tipo: "gasto", concepto: "Terraza con amigos", categoria: "Ocio y Actividades", cantidad: 100, esCompartido: true, formaPago: "tarjeta", fecha: "2026-08-16T21:30:00.000Z" },
            { id: 120, telefono: "600111222", tipo: "gasto", concepto: "Gasolina Agosto", categoria: "Transporte", cantidad: 60, esCompartido: false, formaPago: "efectivo", fecha: "2026-08-20T08:30:00.000Z" },
            { id: 121, telefono: "600333444", tipo: "gasto", concepto: "Dental Higiene", categoria: "Salud y Cuidado", cantidad: 45, esCompartido: false, formaPago: "tarjeta", fecha: "2026-08-23T16:00:00.000Z" },
            { id: 122, telefono: "600111222", tipo: "gasto", concepto: "Material vuelta al cole", categoria: "Otros", cantidad: 200, esCompartido: true, formaPago: "tarjeta", fecha: "2026-09-02T10:30:00.000Z" },
            { id: 123, telefono: "600333444", tipo: "gasto", concepto: "Supermercado Septiembre", categoria: "Alimentación", cantidad: 250, esCompartido: true, formaPago: "tarjeta", fecha: "2026-09-05T12:00:00.000Z" },
            { id: 124, telefono: "600111222", tipo: "gasto", concepto: "Abono transporte", categoria: "Transporte", cantidad: 70, esCompartido: false, formaPago: "efectivo", fecha: "2026-09-07T08:15:00.000Z" },
            { id: 201, telefono: "600111222", tipo: "gasto", concepto: "Cafe manana", categoria: "Ocio y Actividades", cantidad: 3.5, esCompartido: false, formaPago: "efectivo", fecha: "2026-09-08T09:00:00.000Z" },
            { id: 202, telefono: "600111222", tipo: "gasto", concepto: "Cafe manana", categoria: "Ocio y Actividades", cantidad: 3.5, esCompartido: false, formaPago: "efectivo", fecha: "2026-09-10T09:00:00.000Z" },
            { id: 203, telefono: "600111222", tipo: "gasto", concepto: "Cafe manana", categoria: "Ocio y Actividades", cantidad: 3.5, esCompartido: false, formaPago: "efectivo", fecha: "2026-09-12T09:00:00.000Z" },
            { id: 204, telefono: "600333444", tipo: "gasto", concepto: "Snack kiosco", categoria: "Alimentación", cantidad: 2.8, esCompartido: false, formaPago: "efectivo", fecha: "2026-09-15T18:00:00.000Z" }
        ]
    };

    guardarDatos(datosSimulados);
    res.json({ success: true, message: 'Datos simulados cargados con éxito', datos: datosSimulados });
});

app.listen(PORT, () => {
    console.log(`Servidor de Gestor de Gastos listo en http://localhost:${PORT}`);
});