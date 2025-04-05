const mongoose = require('mongoose');

const ClienteSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  documento: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  telefono: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  tipoSuscripcion: {
    type: String,
    enum: ['ninguna', 'diaria', 'mensual'],
    default: 'ninguna'
  },
  fechaInicio: {
    type: Date
  },
  fechaFin: {
    type: Date
  },
  vehiculos: [{
    placa: String,
    tipoVehiculo: String
  }],
  historicoUsos: [{
    fechaEntrada: Date,
    fechaSalida: Date,
    tiempoEstacionado: Number, // en milisegundos
    costo: Number
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Cliente', ClienteSchema);