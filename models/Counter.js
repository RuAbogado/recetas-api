// Importamos mongoose para definir el esquema
const mongoose = require('mongoose');

// Creamos el esquema para llevar la cuenta de IDs incrementales
const CounterSchema = new mongoose.Schema({
    // Nombre del contador (por ejemplo: "recetaId", "productoId", etc.)
    name: { type: String, required: true, unique: true },

    // Valor actual del contador (se incrementa cada vez que se crea una nueva entidad)
    seq: { type: Number, default: 0 }
});

// Exportamos el modelo para poder usarlo en otras partes de la app
module.exports = mongoose.model('Counter', CounterSchema);