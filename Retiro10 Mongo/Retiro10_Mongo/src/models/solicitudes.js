const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const solicitudes = new Schema({
  fecha: Date,
  porcentaje: Number,
  saldo_disponible: Number,
  monto: Number,
  rut: String,
  estado: {default: 'pendiente', type: String},
  tipo_cuenta_retiro: String,
  rut_administrador: {
    default: null,
    type: String
  }
});

module.exports = mongoose.model('solicitudes', solicitudes);