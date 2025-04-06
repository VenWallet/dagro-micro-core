import express from 'express';
const router = express.Router();
import p2pController from '../controllers/p2p.controllers';
import authMiddleware from '../middleware/auth.middleware';
import ImageController from '../controllers/image.controllers';


/**
 * Post track
 * @swagger
 * /p2p/status:
 *   get:
 *     tags:
 *      - p2p
 *     summary: Verifica el estado del servicio P2P
 *     responses:
 *       200:
 *         description: Servicio funcionando correctamente
 */
router.get('/status', p2pController.status)

/**
 * @swagger
 * /p2p/create-order:
 *   post:
 *     tags:
 *       - p2p
 *     summary: Crea una nueva orden P2P
 *     description: Este endpoint permite crear una nueva orden P2P para realizar transacciones entre usuarios.
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               offerId:
 *                 type: number
 *                 description: ID de la oferta seleccionada
 *               paymentMethodId:
 *                 type: number
 *                 description: ID del método de pago seleccionado
 *               amountOrder:
 *                 type: number
 *                 description: Monto de la orden
 *     responses:
 *       200:
 *         description: Orden creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: string
 *                   description: ID de la orden creada
 *                 status:
 *                   type: string
 *                   description: Estado de la orden
 *       400:
 *         description: Error en los datos proporcionados
 *       401:
 *         description: Token inválido o no autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/create-order', authMiddleware, p2pController.createOrder)

/**
* @swagger
* /p2p/aprove-order:
*   post:
*     tags:
*       - p2p
*     summary: Aprueba una orden P2P
*     description: Este endpoint permite aprobar una orden P2P existente.
*     security:
*       - tokenAuth: []
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               orderId:
*                 type: string
*                 description: ID de la orden que se desea aprobar
*     responses:
*       200:
*         description: Orden aprobada exitosamente
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 orderId:
*                   type: string
*                   description: ID de la orden aprobada
*                 status:
*                   type: string
*                   description: Estado actualizado de la orden
*       400:
*         description: Error en los datos proporcionados
*       401:
*         description: Token inválido o no autorizado
*       500:
*         description: Error interno del servidor
*/
router.post('/aprove-order', authMiddleware, p2pController.aproveOrder)

/**
 * @swagger
 * /p2p/cancel-order:
 *   post:
 *     tags:
 *       - p2p
 *     summary: Cancela una orden P2P
 *     description: Este endpoint permite cancelar una orden P2P existente.
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: ID de la orden que se desea cancelar
 *     responses:
 *       200:
 *         description: Orden cancelada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: string
 *                   description: ID de la orden cancelada
 *                 status:
 *                   type: string
 *                   description: Estado actualizado de la orden
 *       400:
 *         description: Error en los datos proporcionados
 *       401:
 *         description: Token inválido o no autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/cancel-order', authMiddleware, p2pController.cancelOrder)

/**
 * @swagger
 * /p2p/dispute-order:
 *   post:
 *     tags:
 *       - p2p
 *     summary: Inicia una disputa para una orden P2P
 *     description: Este endpoint permite iniciar una disputa para una orden P2P existente.
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               orderId:
 *                 type: string
 *                 description: ID de la orden que se desea disputar
 *               reason:
 *                 type: string
 *                 description: Razón para iniciar la disputa
 *     responses:
 *       200:
 *         description: Disputa iniciada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: string
 *                   description: ID de la orden en disputa
 *                 status:
 *                   type: string
 *                   description: Estado actualizado de la orden
 *       400:
 *         description: Error en los datos proporcionados
 *       401:
 *         description: Token inválido o no autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/dispute-order', authMiddleware, p2pController.disputeOrder)


export { router }