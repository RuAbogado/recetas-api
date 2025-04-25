// routes/recetas.js
const express = require('express');
const router = express.Router();
const Receta = require('../models/Receta');
const Counter = require('../models/Counter');

// Crear receta con URLs (no archivos)
router.post('/', async (req, res) => {
  try {
    const { titulo, autor, ingredientes, pasos, imagenes } = req.body;

    if (!imagenes || imagenes.length === 0) {
      return res.status(400).json({ mensaje: "Debes proporcionar al menos una imagen" });
    }

    let counter = await Counter.findOneAndUpdate(
      { name: "recetaId" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    if (!counter || !counter.seq) {
      return res.status(500).json({ mensaje: "Error al generar ID de receta" });
    }

    const nuevaReceta = new Receta({
      id: counter.seq,
      titulo,
      autor,
      ingredientes: ingredientes.split('\n'),
      pasos: pasos.split('\n'),
      imagenes
    });

    await nuevaReceta.save();

    res.json({ mensaje: "Receta creada con éxito", receta: nuevaReceta });
  } catch (error) {
    console.error("Error al crear receta:", error);
    res.status(500).json({ mensaje: "Error al crear receta", error });
  }
});

// Obtener todas las recetas
router.get('/', async (req, res) => {
  try {
    const recetas = await Receta.find();
    res.json(recetas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener recetas", error });
  }
});

// Obtener receta por ID
router.get('/:id', async (req, res) => {
  try {
    const receta = await Receta.findOne({ id: req.params.id });
    if (!receta) return res.status(404).json({ mensaje: "Receta no encontrada" });
    res.json(receta);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener receta", error });
  }
});

// Actualizar receta
router.put('/:id', async (req, res) => {
  try {
    const { titulo, autor, ingredientes, pasos, imagenes } = req.body;
    const recetaId = Number(req.params.id);

    const recetaActualizada = await Receta.findOneAndUpdate(
      { id: recetaId },
      {
        titulo,
        autor,
        ingredientes: ingredientes.split('\n'),
        pasos: pasos.split('\n'),
        imagenes
      },
      { new: true }
    );

    if (!recetaActualizada) return res.status(404).json({ mensaje: "Receta no encontrada" });

    res.json({ mensaje: "Receta actualizada", receta: recetaActualizada });
  } catch (error) {
    console.error("Error al actualizar receta:", error);
    res.status(500).json({ mensaje: "Error al actualizar receta", error });
  }
});

// Eliminar receta
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Receta.findOneAndDelete({ id: req.params.id });
    if (!deleted) return res.status(404).json({ mensaje: "Receta no encontrada" });
    res.json({ mensaje: "Receta eliminada" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar receta", error });
  }
});

module.exports = router;
