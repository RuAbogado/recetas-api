const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs'); 
const Receta = require('../models/Receta');
const Counter = require('../models/Counter');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });


router.post('/', upload.array('imagenes', 5), async (req, res) => {
    try {
        const { titulo, autor, ingredientes, pasos } = req.body;
        
   
        console.log("Archivos recibidos:", req.files);

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ mensaje: "Debes subir al menos una imagen" });
        }

        const imagenes = req.files.map(file => file.path);

      
        let counter = await Counter.findOneAndUpdate(
            { name: "recetaId" }, 
            { $inc: { seq: 1 } }, 
            { new: true, upsert: true }
        );

        if (!counter || !counter.seq) {
            return res.status(500).json({ mensaje: "Error al generar ID de receta" });
        }

        console.log("Nuevo ID generado:", counter.seq);

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



router.get('/', async (req, res) => {
    try {
        const recetas = await Receta.find();
        res.json(recetas);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener recetas", error });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const receta = await Receta.findOne({ id: req.params.id });
        if (!receta) return res.status(404).json({ mensaje: "Receta no encontrada" });
        res.json(receta);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener receta", error });
    }
});


router.put('/:id', upload.array('imagenes', 5), async (req, res) => {
    try {
        const { titulo, autor, ingredientes, pasos } = req.body;
        const recetaId = Number(req.params.id); 

        const receta = await Receta.findOne({ id: recetaId });

        if (!receta) return res.status(404).json({ mensaje: "Receta no encontrada" });

        
        let imagenes = receta.imagenes;
        if (req.files.length > 0) {
           
            receta.imagenes.forEach(imgPath => {
                if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
            });
            
            imagenes = req.files.map(file => file.path);
        }

        
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


router.delete('/:id', async (req, res) => {
    try {
        const receta = await Receta.findOne({ id: req.params.id });

        if (!receta) return res.status(404).json({ mensaje: "Receta no encontrada" });

       
        receta.imagenes.forEach(imgPath => {
            if (fs.existsSync(imgPath)) {
                fs.unlinkSync(imgPath);
            }
        });

        
        await Receta.findOneAndDelete({ id: req.params.id });

        res.json({ mensaje: "Receta eliminada" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar receta", error });
    }
});


router.delete('/', async (req, res) => {
    try {
        const recetas = await Receta.find();
        
        
        recetas.forEach(receta => {
            receta.imagenes.forEach(imgPath => {
                if (fs.existsSync(imgPath)) {
                    fs.unlinkSync(imgPath);
                }
            });
        });
        
       
        await Receta.deleteMany();

        res.json({ mensaje: "Todas las recetas han sido eliminadas" });
    } catch (error) {
        res.status(500).json({ mensaje: "Error al eliminar todas las recetas", error });
    }
});

module.exports = router;
