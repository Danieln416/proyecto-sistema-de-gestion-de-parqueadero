const mongoose = require('mongoose');

const VehiculoSchema = new mongoose.Schema({
  placa: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  tipoVehiculo: {
    type: String,
    enum: ['carro', 'moto', 'bicicleta'],
    required: true
  },
  horaEntrada: {
    type: Date,
    default: Date.now
  },
  horaSalida: {
    type: Date
  },
  espacioAsignado: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['estacionado', 'retirado'],
    default: 'estacionado'
  },
  clienteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cliente'
  },
  costo: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Vehiculo', VehiculoSchema);