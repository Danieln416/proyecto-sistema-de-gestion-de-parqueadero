const Vehiculo = require('../models/Vehiculo');
const Espacio = require('../models/Espacio');
const Cliente = require('../models/Cliente');
const { calcularCosto } = require('../utils');

// Función original para registrar entrada (renombrada a registrarVehiculo)
exports.registrarVehiculo = async (req, res) => {
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

    if (tipoVehiculo !== 'carro' && tipoVehiculo !== 'moto' && tipoVehiculo !== 'bicicleta') {
      return res.status(400).json({
        error: `${tipoVehiculo} No es un tipo de vehículo válido. Debe ser carro, moto o bicicleta.`
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

// Función original para listar vehículos estacionados 
exports.obtenerVehiculos = async (req, res) => {
  try {
    const vehiculos = await Vehiculo.find({ estado: 'estacionado' })
      .populate('clienteId', 'nombre documento');

    res.json(vehiculos);
  } catch (error) {
    console.error('Error al listar vehículos:', error);
    res.status(500).json({ error: 'Error al obtener la lista de vehículos' });
  }
};

// Nueva función para obtener vehículo por ID
exports.obtenerVehiculoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vehiculo = await Vehiculo.findById(id)
      .populate('clienteId', 'nombre documento');

    if (!vehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }

    res.json(vehiculo);
  } catch (error) {
    console.error('Error al obtener vehículo por ID:', error);
    res.status(500).json({ error: 'Error al obtener el vehículo' });
  }
};

// Función original para buscar vehículo (renombrada a buscarVehiculoPorPlaca)
exports.buscarVehiculoPorPlaca = async (req, res) => {
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

// Nueva función para actualizar vehículo
exports.actualizarVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    const { marca, modelo, color } = req.body;
    
    const vehiculo = await Vehiculo.findById(id);
    
    if (!vehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    // Actualizar solo los campos proporcionados
    if (marca) vehiculo.marca = marca;
    if (modelo) vehiculo.modelo = modelo;
    if (color) vehiculo.color = color;
    
    await vehiculo.save();
    
    res.json({
      mensaje: 'Vehículo actualizado exitosamente',
      vehiculo
    });
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);
    res.status(500).json({ error: 'Error al actualizar el vehículo' });
  }
};

// Nueva función para eliminar vehículo
exports.eliminarVehiculo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const vehiculo = await Vehiculo.findById(id);
    
    if (!vehiculo) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    
    // Si el vehículo está estacionado, liberar el espacio
    if (vehiculo.estado === 'estacionado') {
      await Espacio.findOneAndUpdate(
        { codigo: vehiculo.espacioAsignado },
        { estado: 'disponible', vehiculoActual: null }
      );
    }
    
    await Vehiculo.findByIdAndDelete(id);
    
    res.json({
      mensaje: 'Vehículo eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    res.status(500).json({ error: 'Error al eliminar el vehículo' });
  }
};

// Mantener las funciones originales por compatibilidad
exports.registrarEntrada = exports.registrarVehiculo;
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
      tiempoEstacionado: `${(tiempoEstacionado / (1000 * 60 * 60)).toFixed(2)} horas`, // en horas
      costo: `${costo} pesos`
    });
  } catch (error) {
    console.error('Error al registrar salida:', error);
    res.status(500).json({ error: 'Error al registrar la salida del vehículo' });
  }
};
exports.buscarVehiculo = exports.buscarVehiculoPorPlaca;
exports.listarVehiculosEstacionados = exports.obtenerVehiculos;