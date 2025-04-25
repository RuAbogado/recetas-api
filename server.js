require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

//CORS global
app.use(cors());

//Middleware de Express
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Servir imágenes desde /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("Conectado a MongoDB"))
.catch(err => console.error("Error en la conexión", err));

//Ruta principal de la API
app.use('/api/recetas', require('./routes/recetas'));

//Levantar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en Atlas ${PORT}`);
});