// Cargar variables de entorno desde .env (como la URI de MongoDB)
require('dotenv').config();

// Importo express para crear el servidor
const express = require('express');

// Importo mongoose para conectarme a MongoDB Atlas
const mongoose = require('mongoose');

// Habilito CORS para permitir peticiones desde el frontend
const cors = require('cors');

// Importo path para poder usar rutas absolutas al servir archivos
const path = require('path');

// Inicializo la aplicación
const app = express();

// Activar CORS globalmente (permite peticiones desde cualquier origen)
app.use(cors());

// Middleware para interpretar JSON en las peticiones
app.use(express.json());

// Middleware para interpretar formularios codificados (como los enviados por forms)
app.use(express.urlencoded({ extended: true }));

// Configuración para servir las imágenes estáticas desde la carpeta "uploads"
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexión a la base de datos de MongoDB Atlas usando URI del archivo .env
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Conectado a MongoDB")) // Mensaje si se conecta bien
.catch(err => console.error("Error en la conexión", err)); // Mensaje si hay error

// Ruta base de la API para recetas
app.use('/api/recetas', require('./routes/recetas')); // Todas las rutas están en ese archivo

// Levanto el servidor en el puerto definido (por variable de entorno o 3000 por defecto)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en Atlas ${PORT}`);
});