const express = require('express');
const router = express.Router();
const espacioController = require('../controllers/espacioController');
const { verifyToken } = require('../utils');

/**
 * @swagger
 * /api/espacios:
 *   post:
 *     summary: Crear nuevo espacio de estacionamiento
 *     tags: [Espacios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo
 *               - tipoEspacio
 *             properties:
 *               codigo:
 *                 type: string
 *               tipoEspacio:
 *                 type: string
 *                 enum: [carro, moto, bicicleta]
 *               ubicacion:
 *                 type: object
 *                 properties:
 *                   seccion:
 *                     type: string
 *                   nivel:
 *                     type: number
 *                   posicion:
 *                     type: string
 *     responses:
 *       201:
 *         description: Espacio creado exitosamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/', verifyToken, espacioController.crearEspacio);

/**
 * @swagger
 * /api/espacios:
 *   get:
 *     summary: Obtener todos los espacios
 *     tags: [Espacios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de espacios
 *       500:
 *         description: Error del servidor
 */
router.get('/', verifyToken, espacioController.obtenerEspacios);

/**
 * @swagger
 * /api/espacios/disponibles/{tipo}:
 *   get:
 *     summary: Obtener espacios disponibles por tipo
 *     tags: [Espacios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [carro, moto, bicicleta]
 *         required: true
 *         description: Tipo de espacio
 *     responses:
 *       200:
 *         description: Lista de espacios disponibles
 *       500:
 *         description: Error del servidor
 */
router.get('/disponibles/:tipo', verifyToken, espacioController.espaciosDisponiblesPorTipo);

/**
 * @swagger
 * /api/espacios/{codigo}:
 *   put:
 *     summary: Actualizar estado de un espacio
 *     tags: [Espacios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: codigo
 *         schema:
 *           type: string
 *         required: true
 *         description: Código del espacio
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [disponible, ocupado, mantenimiento]
 *     responses:
 *       200:
 *         description: Espacio actualizado
 *       404:
 *         description: Espacio no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:codigo', verifyToken, espacioController.actualizarEstadoEspacio);

/**
 * @swagger
 * /api/espacios/{codigo}:
 *   delete:
 *     summary: Eliminar un espacio
 *     tags: [Espacios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: codigo
 *         schema:
 *           type: string
 *         required: true
 *         description: Código del espacio
 *     responses:
 *       200:
 *         description: Espacio eliminado
 *       400:
 *         description: No se puede eliminar un espacio ocupado
 *       404:
 *         description: Espacio no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:codigo', verifyToken, espacioController.eliminarEspacio);

module.exports = router;