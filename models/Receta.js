const mongoose = require('mongoose');

const RecetaSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, 
    titulo: { type: String, required: true },
    autor: { type: String, required: true },
    ingredientes: { type: [String], default: [] },
    pasos: { type: [String], default: [] },
    imagenes: { type: [String], default: [] }
}, { timestamps: true });// Agrega automáticamente campos `createdAt` y `updatedAt`

module.exports = mongoose.model('Receta', RecetaSchema);
