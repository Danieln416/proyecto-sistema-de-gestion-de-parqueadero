const Espacio = require('../models/Espacio');

// @desc    Crear nuevo espacio
// @route   POST /api/espacios
// @access  Private/Admin
exports.crearEspacio = async (req, res) => {
  try {
    const { codigo, tipoEspacio, ubicacion } = req.body;

    // Verificar si ya existe este código
    const espacioExistente = await Espacio.findOne({ codigo });
    if (espacioExistente) {
      return res.status(400).json({ error: 'Ya existe un espacio con este código' });
    }

    const nuevoEspacio = new Espacio({
      codigo,
      tipoEspacio,
      ubicacion
    });

    const espacioGuardado = await nuevoEspacio.save();
    res.status(201).json(espacioGuardado);
  } catch (error) {
    console.error('Error al crear espacio:', error);
    res.status(500).json({ error: 'Error al crear el espacio de estacionamiento' });
  }
};

// @desc    Obtener todos los espacios
// @route   GET /api/espacios
// @access  Private
exports.obtenerEspacios = async (req, res) => {
  try {
    const espacios = await Espacio.find().populate('vehiculoActual', 'placa tipoVehiculo horaEntrada');
    res.json(espacios);
  } catch (error) {
    console.error('Error al obtener espacios:', error);
    res.status(500).json({ error: 'Error al obtener los espacios de estacionamiento' });
  }
};

// @desc    Obtener espacios disponibles por tipo
// @route   GET /api/espacios/disponibles/:tipo
// @access  Private
exports.espaciosDisponiblesPorTipo = async (req, res) => {
  try {
    const { tipo } = req.params;
    const espacios = await Espacio.find({ 
      tipoEspacio: tipo, 
      estado: 'disponible' 
    });
    
    res.json(espacios);
  } catch (error) {
    console.error('Error al obtener espacios disponibles:', error);
    res.status(500).json({ error: 'Error al obtener los espacios disponibles' });
  }
};

// @desc    Actualizar estado de un espacio
// @route   PUT /api/espacios/:codigo
// @access  Private/Admin
exports.actualizarEstadoEspacio = async (req, res) => {
  try {
    const { codigo } = req.params;
    const { estado } = req.body;

    const espacio = await Espacio.findOne({ codigo });
    if (!espacio) {
      return res.status(404).json({ error: 'Espacio no encontrado' });
    }

    espacio.estado = estado;
    if (estado !== 'ocupado') {
      espacio.vehiculoActual = null;
    }

    const espacioActualizado = await espacio.save();
    res.json(espacioActualizado);
  } catch (error) {
    console.error('Error al actualizar estado del espacio:', error);
    res.status(500).json({ error: 'Error al actualizar el estado del espacio' });
  }
};

// @desc    Eliminar un espacio
// @route   DELETE /api/espacios/:codigo
// @access  Private/Admin
exports.eliminarEspacio = async (req, res) => {
  try {
    const { codigo } = req.params;
    
    const espacio = await Espacio.findOne({ codigo });
    if (!espacio) {
      return res.status(404).json({ error: 'Espacio no encontrado' });
    }

    // No permitir eliminar si está ocupado
    if (espacio.estado === 'ocupado') {
      return res.status(400).json({ 
        error: 'No se puede eliminar un espacio ocupado' 
      });
    }

    await espacio.deleteOne();
    res.json({ mensaje: 'Espacio eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar espacio:', error);
    res.status(500).json({ error: 'Error al eliminar el espacio' });
  }
};
