const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const administradores = new Schema({
    rut: String,
    email: String,
    pass: String,
    nombre: String
});

module.exports = mongoose.model('administradores', administradores);