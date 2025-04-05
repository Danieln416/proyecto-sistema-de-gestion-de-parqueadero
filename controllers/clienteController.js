const Cliente = require('../models/Cliente');
const Vehiculo = require('../models/Vehiculo');

// @desc    Registrar nuevo cliente
// @route   POST /api/clientes
// @access  Private
exports.registrarCliente = async (req, res) => {
  try {
    const { nombre, documento, telefono, email, tipoSuscripcion, vehiculos } = req.body;

    // Verificar si ya existe un cliente con ese documento
    const clienteExistente = await Cliente.findOne({ documento });
    if (clienteExistente) {
      return res.status(400).json({ error: 'Ya existe un cliente con este documento' });
    }

    const nuevoCliente = new Cliente({
      nombre,
      documento,
      telefono,
      email,
      tipoSuscripcion: tipoSuscripcion || 'ninguna',
      vehiculos: vehiculos || []
    });

    // Si tiene suscripción, establecer fechas
    if (['diaria', 'mensual'].includes(nuevoCliente.tipoSuscripcion)) {
      nuevoCliente.fechaInicio = new Date();
      nuevoCliente.fechaFin = new Date();
      
      if (nuevoCliente.tipoSuscripcion === 'diaria') {
        nuevoCliente.fechaFin.setDate(nuevoCliente.fechaFin.getDate() + 1);
      } else { // mensual
        nuevoCliente.fechaFin.setMonth(nuevoCliente.fechaFin.getMonth() + 1);
      }
    }

    const clienteGuardado = await nuevoCliente.save();
    res.status(201).json(clienteGuardado);
  } catch (error) {
    console.error('Error al registrar cliente:', error);
    res.status(500).json({ error: 'Error al registrar el cliente' });
  }
};

// @desc    Obtener todos los clientes
// @route   GET /api/clientes
// @access  Private
exports.obtenerClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.json(clientes);
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    res.status(500).json({ error: 'Error al obtener la lista de clientes' });
  }
};

// @desc    Obtener cliente por ID
// @route   GET /api/clientes/:id
// @access  Private
exports.obtenerClientePorId = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json(cliente);
  } catch (error) {
    console.error('Error al obtener cliente:', error);
    res.status(500).json({ error: 'Error al obtener los datos del cliente' });
  }
};

// @desc    Buscar cliente por documento
// @route   GET /api/clientes/documento/:documento
// @access  Private
exports.buscarClientePorDocumento = async (req, res) => {
  try {
    const cliente = await Cliente.findOne({ documento: req.params.documento });
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    res.json(cliente);
  } catch (error) {
    console.error('Error al buscar cliente:', error);
    res.status(500).json({ error: 'Error al buscar el cliente' });
  }
};

// @desc    Actualizar cliente
// @route   PUT /api/clientes/:id
// @access  Private
exports.actualizarCliente = async (req, res) => {
  try {
    const { nombre, telefono, email, tipoSuscripcion } = req.body;
    
    const clienteActualizado = await Cliente.findByIdAndUpdate(
      req.params.id,
      { nombre, telefono, email, tipoSuscripcion },
      { new: true }
    );
    
    if (!clienteActualizado) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    // Actualizar fechas de suscripción si es necesario
    if (['diaria', 'mensual'].includes(tipoSuscripcion) && 
        (!clienteActualizado.fechaInicio || clienteActualizado.fechaFin < new Date())) {
      
      clienteActualizado.fechaInicio = new Date();
      clienteActualizado.fechaFin = new Date();
      
      if (tipoSuscripcion === 'diaria') {
        clienteActualizado.fechaFin.setDate(clienteActualizado.fechaFin.getDate() + 1);
      } else { // mensual
        clienteActualizado.fechaFin.setMonth(clienteActualizado.fechaFin.getMonth() + 1);
      }
      
      await clienteActualizado.save();
    }
    
    res.json(clienteActualizado);
  } catch (error) {
    console.error('Error al actualizar cliente:', error);
    res.status(500).json({ error: 'Error al actualizar los datos del cliente' });
  }
};

// @desc    Obtener historial de usos de un cliente
// @route   GET /api/clientes/:id/historial
// @access  Private
exports.obtenerHistorialCliente = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    
    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }
    
    // Obtener también los vehículos actuales en el parqueadero
    const vehiculosActuales = await Vehiculo.find({ 
      clienteId: cliente._id,
      estado: 'estacionado'
    });
    
    res.json({
      historial: cliente.historicoUsos,
      vehiculosActuales
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error al obtener el historial del cliente' });
  }
};