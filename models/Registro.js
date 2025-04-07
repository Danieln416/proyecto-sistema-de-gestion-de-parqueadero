const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const registroSchema = new Schema({
    cliente: {
        type: Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    vehiculo: {
        type: Schema.Types.ObjectId,
        ref: 'Vehiculo',
        required: true
    },
    espacio: {
        type: Schema.Types.ObjectId,
        ref: 'Espacio',
        required: true
    },
    fechaEntrada: {
        type: Date,
        default: Date.now,
        required: true
    },
    fechaSalida: {
        type: Date,
        default: null
    },
    duracion: { // Duración en minutos
        type: Number,
        default: 0
    },
    valorHora: {
        type: Number,
        required: true
    },
    valorTotal: {
        type: Number,
        default: 0
    },
    estado: {
        type: String,
        enum: ['activo', 'finalizado', 'cancelado'],
        default: 'activo'
    },
    operadorEntrada: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    operadorSalida: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    observaciones: {
        type: String
    }
}, { timestamps: true });

// Método para calcular valor total al finalizar registro
registroSchema.methods.finalizarRegistro = function() {
    if (this.fechaEntrada && !this.fechaSalida) {
        this.fechaSalida = new Date();
        const diff = (this.fechaSalida - this.fechaEntrada) / (1000 * 60); // Duración en minutos
        this.duracion = Math.ceil(diff);
        
        // Calcular valor según duración y tarifa por hora
        const horas = Math.ceil(this.duracion / 60); // Redondear hacia arriba las horas
        this.valorTotal = horas * this.valorHora;
        
        this.estado = 'finalizado';
    }
    return this;
};

module.exports = mongoose.model('Registro', registroSchema);