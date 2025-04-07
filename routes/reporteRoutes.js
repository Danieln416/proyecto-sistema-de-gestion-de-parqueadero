const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');
const { verifyToken } = require('../utils');

/**
 * @swagger
 * /api/reportes/ocupacion:
 *   get:
 *     summary: Obtener reporte de ocupación actual
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reporte de ocupación exitoso
 *       500:
 *         description: Error del servidor
 */
router.get('/ocupacion', verifyToken, reporteController.reporteOcupacion);

/**
 * @swagger
 * /api/reportes/ingresos:
 *   get:
 *     summary: Obtener reporte de ingresos
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha inicial para el reporte (YYYY-MM-DD)
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha final para el reporte (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Reporte de ingresos exitoso
 *       500:
 *         description: Error del servidor
 */
router.get('/ingresos', verifyToken, reporteController.reporteIngresos);

/**
 * @swagger
 * /api/reportes/vehiculos:
 *   get:
 *     summary: Obtener reporte de vehículos por tipo
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reporte de vehículos exitoso
 *       500:
 *         description: Error del servidor
 */
router.get('/vehiculos', verifyToken, reporteController.reporteVehiculos);

/**
 * @swagger
 * /api/reportes/suscripciones:
 *   get:
 *     summary: Obtener reporte de suscripciones
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Reporte de suscripciones exitoso
 *       500:
 *         description: Error del servidor
 */
router.get('/suscripciones', verifyToken, reporteController.reporteSuscripciones);

/**
 * @swagger
 * /api/reportes/uso-diario:
 *   get:
 *     summary: Obtener reporte de uso diario
 *     tags: [Reportes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fecha
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha para el reporte (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Reporte de uso diario exitoso
 *       500:
 *         description: Error del servidor
 */
router.get('/uso-diario', verifyToken, reporteController.reporteUsoDiario);

module.exports = router;