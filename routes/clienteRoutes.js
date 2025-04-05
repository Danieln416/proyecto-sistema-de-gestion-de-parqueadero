const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { verifyToken } = require('../utils');

/**
 * @swagger
 * /api/clientes:
 *   post:
 *     summary: Registrar nuevo cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - documento
 *             properties:
 *               nombre:
 *                 type: string
 *               documento:
 *                 type: string
 *               telefono:
 *                 type: string
 *               email:
 *                 type: string
 *               tipoSuscripcion:
 *                 type: string
 *                 enum: [ninguna, diaria, mensual]
 *               vehiculos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     placa:
 *                       type: string
 *                     tipoVehiculo:
 *                       type: string
 *     responses:
 *       201:
 *         description: Cliente registrado exitosamente
 *       400:
 *         description: Datos inválidos o cliente ya existente
 *       500:
 *         description: Error del servidor
 */
router.post('/', verifyToken, clienteController.registrarCliente);

/**
 * @swagger
 * /api/clientes:
 *   get:
 *     summary: Obtener todos los clientes
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 *       500:
 *         description: Error del servidor
 */
router.get('/', verifyToken, clienteController.obtenerClientes);

/**
 * @swagger
 * /api/clientes/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Datos del cliente
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', verifyToken, clienteController.obtenerClientePorId);

/**
 * @swagger
 * /api/clientes/documento/{documento}:
 *   get:
 *     summary: Buscar cliente por documento
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: documento
 *         schema:
 *           type: string
 *         required: true
 *         description: Número de documento del cliente
 *     responses:
 *       200:
 *         description: Datos del cliente
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/documento/:documento', verifyToken, clienteController.buscarClientePorDocumento);

/**
 * @swagger
 * /api/clientes/{id}:
 *   put:
 *     summary: Actualizar cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               telefono:
 *                 type: string
 *               email:
 *                 type: string
 *               tipoSuscripcion:
 *                 type: string
 *                 enum: [ninguna, diaria, mensual]
 *     responses:
 *       200:
 *         description: Cliente actualizado
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', verifyToken, clienteController.actualizarCliente);

/**
 * @swagger
 * /api/clientes/{id}/historial:
 *   get:
 *     summary: Obtener historial de usos de un cliente
 *     tags: [Clientes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del cliente
 *     responses:
 *       200:
 *         description: Historial del cliente
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id/historial', verifyToken, clienteController.obtenerHistorialCliente);

module.exports = router;