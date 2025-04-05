const mongoose = require('mongoose');

const EspacioSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  tipoEspacio: {
    type: String,
    enum: ['carro', 'moto', 'bicicleta'],
    required: true
  },
  estado: {
    type: String,
    enum: ['disponible', 'ocupado', 'mantenimiento'],
    default: 'disponible'
  },
  ubicacion: {
    seccion: String,
    nivel: Number,
    posicion: String
  },
  vehiculoActual: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehiculo'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Espacio', EspacioSchema);