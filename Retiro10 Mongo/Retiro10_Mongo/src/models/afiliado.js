const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const afiliados = new Schema({
    rut: String,
    n_documento: String,
    email: String,
    pass: String,
    nombre: String,
    nombre_afp: String,
    saldo_cuenta: Number,
    telefono: {
        n_telefono: String
    }
});

module.exports = mongoose.model('afiliados', afiliados);