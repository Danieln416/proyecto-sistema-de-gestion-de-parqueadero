const Vehiculo = require('../models/Vehiculo');
const Espacio = require('../models/Espacio');
const Cliente = require('../models/Cliente');
const { calcularCosto } = require('../utils');

// @desc    Registrar entrada de vehículo
// @route   POST /api/vehiculos/entrada
// @access  Private
exports.registrarEntrada = async (req, res) => {
  try {
    const { placa, tipoVehiculo, clienteId } = req.body;

    // Verificar si el vehículo ya está en el parqueadero
    const vehiculoExistente = await Vehiculo.findOne({ 
      placa: placa.toUpperCase(), 
      estado: 'estacionado' 
    });

    if (vehiculoExistente) {
      return res.status(400).json({ 
        error: 'Este vehículo ya se encuentra en el parqueadero' 
      });
    }

    // Buscar espacio disponible para el tipo de vehículo
    const espacioDisponible = await Espacio.findOne({ 
      tipoEspacio: tipoVehiculo, 
      estado: 'disponible' 
    });

    if (!espacioDisponible) {
      return res.status(400).json({
        error: `No hay espacios disponibles para ${tipoVehiculo}`
      });
    }

    // Crear registro de vehículo
    const nuevoVehiculo = new Vehiculo({
      placa: placa.toUpperCase(),
      tipoVehiculo,
      espacioAsignado: espacioDisponible.codigo,
      clienteId: clienteId || null
    });

    const vehiculoGuardado = await nuevoVehiculo.save();

    // Actualizar estado del espacio
    espacioDisponible.estado = 'ocupado';
    espacioDisponible.vehiculoActual = vehiculoGuardado._id;
    await espacioDisponible.save();

    // Si hay cliente asociado, actualizar sus datos
    if (clienteId) {
      await Cliente.findByIdAndUpdate(clienteId, {
        $addToSet: { vehiculos: { placa: placa.toUpperCase(), tipoVehiculo } }
      });
    }

    res.status(201).json({
      mensaje: 'Vehículo registrado exitosamente',
      vehiculo: vehiculoGuardado,
      espacio: espacioDisponible.codigo
    });
  } catch (error) {
    console.error('Error al registrar entrada:', error);
    res.status(500).json({ error: 'Error al registrar la entrada del vehículo' });
  }
};

// @desc    Registrar salida de vehículo
// @route   PUT /api/vehiculos/salida/:placa
// @access  Private
exports.registrarSalida = async (req, res) => {
  try {
    const { placa } = req.params;

    // Buscar el vehículo por placa
    const vehiculo = await Vehiculo.findOne({ 
      placa: placa.toUpperCase(), 
      estado: 'estacionado' 
    });

    if (!vehiculo) {
      return res.status(404).json({
        error: 'Vehículo no encontrado o ya retirado del parqueadero'
      });
    }

    // Calcular tiempo de estacionamiento
    const horaSalida = new Date();
    const tiempoEstacionado = horaSalida - vehiculo.horaEntrada;
    
    // Calcular costo
    const costo = calcularCosto(tiempoEstacionado, vehiculo.tipoVehiculo);

    // Actualizar datos del vehículo
    vehiculo.horaSalida = horaSalida;
    vehiculo.estado = 'retirado';
    vehiculo.costo = costo;
    await vehiculo.save();

    // Liberar el espacio
    await Espacio.findOneAndUpdate(
      { codigo: vehiculo.espacioAsignado },
      { estado: 'disponible', vehiculoActual: null }
    );

    // Si hay cliente asociado, actualizar historial
    if (vehiculo.clienteId) {
      await Cliente.findByIdAndUpdate(vehiculo.clienteId, {
        $push: {
          historicoUsos: {
            fechaEntrada: vehiculo.horaEntrada,
            fechaSalida: horaSalida,
            tiempoEstacionado,
            costo
          }
        }
      });
    }

    res.json({
      mensaje: 'Salida registrada exitosamente',
      placa: vehiculo.placa,
      tiempoEstacionado: tiempoEstacionado / (1000 * 60 * 60), // en horas
      costo
    });
  } catch (error) {
    console.error('Error al registrar salida:', error);
    res.status(500).json({ error: 'Error al registrar la salida del vehículo' });
  }
};

// @desc    Buscar vehículo por placa
// @route   GET /api/vehiculos/:placa
// @access  Private
exports.buscarVehiculo = async (req, res) => {
  try {
    const { placa } = req.params;
    
    const vehiculo = await Vehiculo.findOne({ placa: placa.toUpperCase() })
      .populate('clienteId', 'nombre documento');

    if (!vehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    res.json(vehiculo);
  } catch (error) {
    console.error('Error al buscar vehículo:', error);
    res.status(500).json({ error: 'Error al buscar el vehículo' });
  }
};

// @desc    Listar vehículos estacionados
// @route   GET /api/vehiculos
// @access  Private
exports.listarVehiculosEstacionados = async (req, res) => {
  try {
    const vehiculos = await Vehiculo.find({ estado: 'estacionado' })
      .populate('clienteId', 'nombre documento');

    res.json(vehiculos);
  } catch (error) {
    console.error('Error al listar vehículos:', error);
    res.status(500).json({ error: 'Error al obtener la lista de vehículos' });
  }
};
