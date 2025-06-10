const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Importación de rutas
const authRoutes = require('./routes/authRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const espacioRoutes = require('./routes/espacioRoutes');
const vehiculoRoutes = require('./routes/vehiculoRoutes');
const reporteRoutes = require('./routes/reporteRoutes'); // Añadimos las rutas de reportes

// Inicializar app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Conexión a la base de datos
mongoose.connect(process.env.MONGODB_URI)
   .then(() => console.log('Conectado a MongoDB'))
   .catch(err => console.error('Error conectando a MongoDB:', err));
// mongoose.connect('mongodb://localhost:27017/parqueadero', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
//   .then(() => console.log('Conectado a MongoDB'))
//   .catch(err => console.error('Error conectando a MongoDB:', err));

// Configuración de rutas
app.use('/api/auth', authRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/espacios', espacioRoutes);
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/reportes', reporteRoutes); // Configuramos las rutas de reportes

// Ruta principal
app.get('/', (req, res) => {
  res.send('API del sistema de gestión de parqueadero funcionando');
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Manejador de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('¡Algo salió mal!');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = app;