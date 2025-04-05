const Vehiculo = require('../models/Vehiculo');
const Cliente = require('../models/Cliente');
const Espacio = require('../models/Espacio');
const moment = require('moment');

// @desc    Generar reporte de ocupación por período
// @route   GET /api/reportes/ocupacion
// @access  Private/Admin
exports.reporteOcupacion = async (req, res) => {
  try {
    const { inicio, fin, tipoVehiculo } = req.query;
    
    let fechaInicio = inicio ? moment(inicio).startOf('day').toDate() : moment().subtract(7, 'days').startOf('day').toDate();
    let fechaFin = fin ? moment(fin).endOf('day').toDate() : moment().endOf('day').toDate();
    
    // Construir filtro
    let filtro = {
      horaEntrada: { $gte: fechaInicio, $lte: fechaFin }
    };
    
    if (tipoVehiculo) {
      filtro.tipoVehiculo = tipoVehiculo;
    }
    
    // Obtener datos
    const vehiculos = await Vehiculo.find(filtro);
    
    // Calcular métricas
    const totalVehiculos = vehiculos.length;
    
    // Agrupar por día para análisis de tendencias
    const agrupacionPorDia = {};
    
    vehiculos.forEach(vehiculo => {
      const dia = moment(vehiculo.horaEntrada).format('YYYY-MM-DD');
      
      if (!agrupacionPorDia[dia]) {
        agrupacionPorDia[dia] = { fecha: dia, total: 0, carros: 0, motos: 0, bicicletas: 0 };
      }
      
      agrupacionPorDia[dia].total += 1;
      if (vehiculo.tipoVehiculo === 'carro') agrupacionPorDia[dia].carros += 1;
      if (vehiculo.tipoVehiculo === 'moto') agrupacionPorDia[dia].motos += 1;
      if (vehiculo.tipoVehiculo === 'bicicleta') agrupacionPorDia[dia].bicicletas += 1;
    });
    
    // Convertir a array para la respuesta
    const ocupacionDiaria = Object.values(agrupacionPorDia).sort((a, b) => a.fecha.localeCompare(b.fecha));
    
    // Obtener datos actuales de ocupación
    const espaciosActuales = await Espacio.aggregate([
      { $group: {
        _id: '$estado',
        cantidad: { $sum: 1 }
      }}
    ]);
    
    const resumenOcupacion = {
      ocupados: 0,
      disponibles: 0,
      mantenimiento: 0
    };
    
    espaciosActuales.forEach(item => {
      resumenOcupacion[item._id] = item.cantidad;
    });
    
    res.json({
      periodo: {
        inicio: fechaInicio,
        fin: fechaFin
      },
      totalVehiculos,
      ocupacionDiaria,
      estadoActual: resumenOcupacion
    });
  } catch (error) {
    console.error('Error al generar reporte de ocupación:', error);
    res.status(500).json({ error: 'Error al generar el reporte de ocupación' });
  }
};

// @desc    Generar reporte de ingresos
// @route   GET /api/reportes/ingresos
// @access  Private/Admin
exports.reporteIngresos = async (req, res) => {
  try {
    const { inicio, fin } = req.query;
    
    let fechaInicio = inicio ? moment(inicio).startOf('day').toDate() : moment().subtract(30, 'days').startOf('day').toDate();
    let fechaFin = fin ? moment(fin).endOf('day').toDate() : moment().endOf('day').toDate();
    
    // Obtener vehículos con salida registrada en el período
    const vehiculos = await Vehiculo.find({
      horaSalida: { $gte: fechaInicio, $lte: fechaFin },
      estado: 'retirado'
    });
    
    // Calcular total de ingresos
    let totalIngresos = 0;
    const ingresosPorTipo = {
      carro: 0,
      moto: 0,
      bicicleta: 0
    };
    
    // Agrupar por día para análisis de tendencias
    const ingresosPorDia = {};
    
    vehiculos.forEach(vehiculo => {
      totalIngresos += vehiculo.costo;
      ingresosPorTipo[vehiculo.tipoVehiculo] += vehiculo.costo;
      
      const dia = moment(vehiculo.horaSalida).format('YYYY-MM-DD');
      
      if (!ingresosPorDia[dia]) {
        ingresosPorDia[dia] = { 
          fecha: dia, 
          total: 0,
          vehiculos: 0
        };
      }
      
      ingresosPorDia[dia].total += vehiculo.costo;
      ingresosPorDia[dia].vehiculos += 1;
    });
    
    // Convertir a array para la respuesta
    const datosPorDia = Object.values(ingresosPorDia).sort((a, b) => a.fecha.localeCompare(b.fecha));
    
    res.json({
      periodo: {
        inicio: fechaInicio,
        fin: fechaFin
      },
      totalIngresos,
      ingresosPorTipo,
      datosPorDia,
      totalVehiculos: vehiculos.length
    });
    
  } catch (error) {
    console.error('Error al generar reporte de ingresos:', error);
    res.status(500).json({ error: 'Error al generar el reporte de ingresos' });
  }
};

// @desc    Generar reporte de clientes frecuentes
// @route   GET /api/reportes/clientes-frecuentes
// @access  Private/Admin
exports.reporteClientesFrecuentes = async (req, res) => {
  try {
    // Obtener clientes con historial
    const clientes = await Cliente.aggregate([
      { $project: {
        nombre: 1,
        documento: 1,
        email: 1,
        tipoSuscripcion: 1,
        totalUsos: { $size: "$historicoUsos" },
        totalGasto: { $sum: "$historicoUsos.costo" }
      }},
      { $sort: { totalUsos: -1 } },
      { $limit: 10 }
    ]);
    
    // Datos por tipo de suscripción
    const clientesPorSuscripcion = await Cliente.aggregate([
      { $group: {
        _id: "$tipoSuscripcion",
        cantidad: { $sum: 1 }
      }}
    ]);
    
    const resumenSuscripciones = {
      ninguna: 0,
      diaria: 0,
      mensual: 0
    };
    
    clientesPorSuscripcion.forEach(item => {
      resumenSuscripciones[item._id] = item.cantidad;
    });
    
    res.json({
      clientesFrecuentes: clientes,
      resumenSuscripciones
    });
  } catch (error) {
    console.error('Error al generar reporte de clientes frecuentes:', error);
    res.status(500).json({ error: 'Error al generar el reporte de clientes frecuentes' });
  }
};

// @desc    Exportar datos en formato JSON
// @route   GET /api/reportes/exportar
// @access  Private/Admin
exports.exportarDatos = async (req, res) => {
  try {
    const { tipo } = req.query;
    
    let datos = {};
    
    if (tipo === 'vehiculos' || !tipo) {
      datos.vehiculos = await Vehiculo.find();
    }
    
    if (tipo === 'clientes' || !tipo) {
      datos.clientes = await Cliente.find();
    }
    
    if (tipo === 'espacios' || !tipo) {
      datos.espacios = await Espacio.find();
    }
    
    // Añadir metadatos
    datos.metadatos = {
      fechaExportacion: new Date(),
      totalRegistros: {
        vehiculos: datos.vehiculos ? datos.vehiculos.length : 0,
        clientes: datos.clientes ? datos.clientes.length : 0,
        espacios: datos.espacios ? datos.espacios.length : 0
      }
    };
    
    // Enviar como archivo para descarga
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=exportacion_${tipo || 'completa'}_${Date.now()}.json`);
    res.send(JSON.stringify(datos, null, 2));
    
  } catch (error) {
    console.error('Error al exportar datos:', error);
    res.status(500).json({ error: 'Error al exportar los datos' });
  }
};