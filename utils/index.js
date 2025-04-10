const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware para verificar token JWT
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Acceso denegado' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Token inválido' });
  }
};

// Función para calcular el costo de estacionamiento
const calcularCosto = (tiempoEstacionado, tipoVehiculo) => {
  const tarifas = {
    carro: 4000, // por hora
    moto: 2000,  // por hora
    bicicleta: 1000 // por hora
  };

  // Tiempo en horas
  const horas = tiempoEstacionado / 3600000;
  return Math.ceil(horas) * (tarifas[tipoVehiculo] || tarifas.carro);
};

module.exports = {
  verifyToken,
  calcularCosto
};