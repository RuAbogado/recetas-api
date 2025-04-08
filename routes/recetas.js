// Importamos dependencias
const express = require('express');
const router = express.Router(); // Router de Express para definir rutas
const multer = require('multer'); // Para subir archivos (imágenes)
const fs = require('fs'); // Para manipular el sistema de archivos (borrar imágenes)
const Receta = require('../models/Receta'); // Modelo de receta (MongoDB)
const Counter = require('../models/Counter'); // Modelo para llevar el conteo (auto increment ID)

// Configuración del almacenamiento de archivos con multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Carpeta donde se guardan las imágenes
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Nombre único para evitar duplicados
    }
});
const upload = multer({ storage: storage }); // Middleware multer con la config de arriba

// ----------------------------
// Crear receta (POST)
// ----------------------------
router.post('/', upload.array('imagenes', 5), async (req, res) => {
    try {
        const { titulo, autor, ingredientes, pasos } = req.body;

        console.log("Archivos recibidos:", req.files);

        // Validación: debe haber al menos una imagen
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ mensaje: "Debes subir al menos una imagen" });
        }

        // Convertimos los paths de las imágenes en un array
        const imagenes = req.files.map(file => file.path);

        // Generar un nuevo ID usando el contador
        let counter = await Counter.findOneAndUpdate(
            { name: "recetaId" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        if (!counter || !counter.seq) {
            return res.status(500).json({ mensaje: "Error al generar ID de receta" });
        }

        console.log("Nuevo ID generado:", counter.seq);

        // Crear y guardar nueva receta
        const nuevaReceta = new Receta({
            id: counter.seq,
            titulo,
            autor,
            ingredientes,
            pasos,
            imagenes
        });

        await nuevaReceta.save();

        res.json({ mensaje: "Receta creada con éxito", receta: nuevaReceta });
    } catch (error) {
        console.error("Error al crear receta:", error);
        res.status(500).json({ mensaje: "Error al crear receta", error });
    }
});

// ----------------------------
// Obtener todas las recetas (GET)
// ----------------------------
router.get('/', async (req, res) => {
    try {
        const recetas = await Receta.find(); // Busca todas las recetas
        res.json(recetas);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener recetas", error });
    }
});

// ----------------------------
// Obtener receta por ID (GET)
// ----------------------------
router.get('/:id', async (req, res) => {
    try {
        const receta = await Receta.findOne({ id: req.params.id }); // Busca por ID personalizado
        if (!receta) return res.status(404).json({ mensaje: "Receta no encontrada" });
        res.json(receta);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener receta", error });
    }
});

// ----------------------------
// Actualizar receta (PUT)
// ----------------------------
router.put('/:id', upload.array('imagenes', 5), async (req, res) => {
    try {
        const { titulo, autor, ingredientes, pasos } = req.body;
        const recetaId = Number(req.params.id);

        const receta = await Receta.findOne({ id: recetaId });
        if (!receta) return res.status(404).json({ mensaje: "Receta no encontrada" });

        let imagenes = receta.imagenes;

        // Si se subieron nuevas imágenes, borrar las anteriores
        if (req.files.length > 0) {
            receta.imagenes.forEach(imgPath => {
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath); // Borra archivo si existe
            });

            imagenes = req.files.map(file => file.path); // Nuevas rutas de imagen
        }

        // Actualizar la receta en base de datos
        const recetaActualizada = await Receta.findOneAndUpdate(
            { id: recetaId },
            { titulo, autor, ingredientes, pasos, imagenes },
            { new: true }
        );

        res.json({ mensaje: "Receta actualizada", receta: recetaActualizada });

    } catch (error) {
        console.error("Error al actualizar receta:", error);
        res.status(500).json({ mensaje: "Error al actualizar receta", error });
    }
});

// ----------------------------
// Eliminar receta por ID (DELETE)
// ----------------------------
router.delete('/:id', async (req, res) => {
    try {
        const receta = await Receta.findOne({ id: req.params.id });

        if (!receta) return res.status(404).json({ mensaje: "Receta no encontrada" });

        // Borrar imágenes del sistema de archivos
        receta.imagenes.forEach(imgPath => {
            if (fs.existsSync(imgPath)) {
                fs.unlinkSync(imgPath);
            }
        });

        // Eliminar receta de la base de datos
        await Receta.findOneAndDelete({ id: req.params.id });

        res.json({ mensaje: "Receta eliminada" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar receta", error });
    }
});

// ----------------------------
// Eliminar todas las recetas (DELETE ALL)
// ----------------------------
router.delete('/', async (req, res) => {
    try {
        const recetas = await Receta.find();

        // Borrar todas las imágenes de todas las recetas
        recetas.forEach(receta => {
            receta.imagenes.forEach(imgPath => {
                if (fs.existsSync(imgPath)) {
                    fs.unlinkSync(imgPath);
                }
            });
        });

        // Eliminar todas las recetas de la base de datos
        await Receta.deleteMany();

        res.json({ mensaje: "Todas las recetas han sido eliminadas" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar todas las recetas", error });
    }
});

// Exportamos el router para usarlo en app.js o server.js
module.exports = router;