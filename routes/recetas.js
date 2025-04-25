// Importamos express y creamos el router
const express = require('express');
const router = express.Router();

// Importamos los modelos de Receta y Counter (para generar IDs personalizados)
const Receta = require('../models/Receta');
const Counter = require('../models/Counter');

// Ruta para crear una receta usando URLs de imágenes (no se suben archivos)
router.post('/', async (req, res) => {
  try {
    // Desestructuro los datos enviados desde el frontend
    const { titulo, autor, ingredientes, pasos, imagenes } = req.body;

    // Validación: debe haber al menos una imagen
    if (!imagenes || imagenes.length === 0) {
      return res.status(400).json({ mensaje: "Debes proporcionar al menos una imagen" });
    }

    // Incremento el contador para generar un ID único para la receta
    let counter = await Counter.findOneAndUpdate(
      { name: "recetaId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    // Si hay problema generando el ID, regreso error
    if (!counter || !counter.seq) {
      return res.status(500).json({ mensaje: "Error al generar ID de receta" });
    }

    // Creo el objeto de receta con el ID autoincremental y datos formateados
    const nuevaReceta = new Receta({
      id: counter.seq,
      titulo,
      autor,
      ingredientes: ingredientes.split('\n'), // separo los ingredientes por saltos de línea
      pasos: pasos.split('\n'),              // igual con los pasos
      imagenes
    });

    // Guardo la receta en la base de datos
    await nuevaReceta.save();

    // Devuelvo respuesta exitosa
    res.json({ mensaje: "Receta creada con éxito", receta: nuevaReceta });
  } catch (error) {
    console.error("Error al crear receta:", error);
    res.status(500).json({ mensaje: "Error al crear receta", error });
  }
});

// Ruta para obtener todas las recetas
router.get('/', async (req, res) => {
  try {
    const recetas = await Receta.find(); // busco todas las recetas
    res.json(recetas); // las devuelvo como JSON
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener recetas", error });
  }
});

// Ruta para obtener una receta por su ID
router.get('/:id', async (req, res) => {
  try {
    // Busco la receta que tenga el ID recibido por parámetro
    const receta = await Receta.findOne({ id: req.params.id });
    if (!receta) return res.status(404).json({ mensaje: "Receta no encontrada" });
    res.json(receta); // Devuelvo la receta encontrada
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener receta", error });
  }
});

// Ruta para actualizar una receta existente
router.put('/:id', async (req, res) => {
  try {
    const { titulo, autor, ingredientes, pasos, imagenes } = req.body;
    const recetaId = Number(req.params.id); // convierto el id a número

    // Busco y actualizo la receta
    const recetaActualizada = await Receta.findOneAndUpdate(
      { id: recetaId },
      {
        titulo,
        autor,
        ingredientes: ingredientes.split('\n'), // formateo de ingredientes
        pasos: pasos.split('\n'),              // formateo de pasos
        imagenes
      },
      { new: true } // para que devuelva la receta ya actualizada
    );

    // Si no se encontró la receta, devuelvo error
    if (!recetaActualizada) return res.status(404).json({ mensaje: "Receta no encontrada" });

    // Devuelvo la receta actualizada
    res.json({ mensaje: "Receta actualizada", receta: recetaActualizada });
  } catch (error) {
    console.error("Error al actualizar receta:", error);
    res.status(500).json({ mensaje: "Error al actualizar receta", error });
  }
});

// Ruta para eliminar una receta
router.delete('/:id', async (req, res) => {
  try {
    // Busco y elimino la receta por su ID
    const deleted = await Receta.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ mensaje: "Receta no encontrada" });

    // Devuelvo mensaje de éxito
    res.json({ mensaje: "Receta eliminada" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar receta", error });
  }
});

// Exporto el router para poder usarlo en app.js o donde se necesite
module.exports = router;