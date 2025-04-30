import express from 'express';
const router = express.Router();
import walletController from '../controllers/wallet.controllers';
import authMiddleware from '../middleware/auth.middleware';
import ImageController from '../controllers/image.controllers';


/**
 * @swagger
 * /wallet/status:
 *   get:
 *     tags:
 *       - wallet
 *     summary: Verifica el estado del servicio
 *     description: Este endpoint devuelve un mensaje de estado del servicio.
 *     responses:
 *       200:
 *         description: Estado del servicio
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "ok"
 */
router.get('/status', walletController.status)

/**
 * Post track
 * @swagger
 * /wallet/login-seed-phrase:
 *    post:
 *      tags:
 *        - wallet
 *      summary: .
 *      description: .
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  seedPhrase:
 *                    type: string
 *      responses:
 *        '200':
 *          description: .
 *        '400':
 *          description: .
 *        '500':
 *          description: server internal error.
 */
router.post('/login-seed-phrase', walletController.loginSeedPhrase);

/**
 * @swagger
 * /wallet/get-profile:
 *   get:
 *     tags:
 *       - wallet
 *     summary: Obtiene el perfil del usuario autenticado
 *     description: Este endpoint devuelve la información del perfil del usuario autenticado.
 *     security:
 *       - tokenAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 wallet:
 *                   type: string
 *                   description: Dirección de la billetera del usuario
 *                 email:
 *                   type: string
 *                   description: Correo electrónico del usuario
 *                 name:
 *                   type: string
 *                   description: Nombre del usuario
 *                 phoneNumber:
 *                   type: string
 *                   description: Número de teléfono del usuario
 *                 image:
 *                   type: string
 *                   description: URL de la imagen del usuario
 *                 headingQuantity:
 *                   type: string
 *                   description: Cantidad de encabezados asociados al usuario
 *                 heading:
 *                   type: number
 *                   description: ID del encabezado asociado al usuario
 *                 ladnName:
 *                   type: string
 *                   description: Nombre del terreno asociado al usuario
 *                 landAddress:
 *                   type: string
 *                   description: Dirección del terreno asociado al usuario
 *                 telegram:
 *                   type: string
 *                   description: red social del usuario
 *       401:
 *         description: Token inválido o no autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/get-profile', authMiddleware, walletController.getProfile);

/**
 * @swagger
 * /wallet/get-profile-custom/{wallet}:
 *   get:
 *     tags:
 *       - wallet
 *     summary: Obtiene un perfil personalizado basado en la dirección de la billetera
 *     description: Este endpoint devuelve información personalizada del perfil de un usuario basado en su dirección de billetera.
 *     security:
 *       - tokenAuth: []
 *     parameters:
 *       - in: path
 *         name: wallet
 *         required: true
 *         schema:
 *           type: string
 *           description: Dirección de la billetera del usuario
 *     responses:
 *       200:
 *         description: Perfil personalizado obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: Nombre del usuario
 *                 image:
 *                   type: string
 *                   description: URL de la imagen del usuario
 *                 ladnName:
 *                   type: string
 *                   description: Nombre del terreno asociado al usuario
 *       401:
 *         description: Token inválido o no autorizado
 *       404:
 *         description: Usuario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/get-profile-custom/:wallet', authMiddleware, walletController.getProfileCustom);

/**
 * @swagger
 * /wallet/get-headings:
 *   get:
 *     tags:
 *       - wallet
 *     summary: Obtiene los encabezados activos
 *     description: Este endpoint devuelve una lista de encabezados activos disponibles en el sistema.
 *     security:
 *       - tokenAuth: []
 *     responses:
 *       200:
 *         description: Lista de encabezados obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                     description: ID del encabezado
 *                   name:
 *                     type: string
 *                     description: Nombre del encabezado
 *                   isActive:
 *                     type: boolean
 *                     description: Indica si el encabezado está activo
 *       401:
 *         description: Token inválido o no autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/get-headings', authMiddleware, walletController.getHeadings);


/**
 * @swagger
 * /wallet/put-profile:
 *   put:
 *     tags:
 *       - wallet
 *     summary: Actualiza el perfil del usuario autenticado
 *     description: Este endpoint permite actualizar la información del perfil del usuario autenticado utilizando datos enviados en formato form-data.
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Correo electrónico del usuario
 *               name:
 *                 type: string
 *                 description: Nombre del usuario
 *               phoneNumber:
 *                 type: string
 *                 description: Número de teléfono del usuario (opcional)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Imagen del usuario (archivo, opcional)
 *               headingQuantity:
 *                 type: string
 *                 description: Cantidad de encabezados asociados al usuario (opcional)
 *               heading:
 *                 type: number
 *                 description: ID del encabezado asociado al usuario (opcional)
 *               ladnName:
 *                 type: string
 *                 description: Nombre del terreno asociado al usuario (opcional)
 *               landAddress:
 *                 type: string
 *                 description: Dirección del terreno asociado al usuario (opcional)
 *              telegram:
 *                type: string
 *                description: red social del usuario (opcional)
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 wallet:
 *                   type: string
 *                   description: Dirección de la billetera del usuario
 *                 email:
 *                   type: string
 *                   description: Correo electrónico del usuario
 *                 name:
 *                   type: string
 *                   description: Nombre del usuario
 *                 phoneNumber:
 *                   type: string
 *                   description: Número de teléfono del usuario
 *                 image:
 *                   type: string
 *                   description: URL de la imagen del usuario
 *                 headingQuantity:
 *                   type: string
 *                   description: Cantidad de encabezados asociados al usuario
 *                 heading:
 *                   type: number
 *                   description: ID del encabezado asociado al usuario
 *                 ladnName:
 *                   type: string
 *                   description: Nombre del terreno asociado al usuario
 *                 landAddress:
 *                   type: string
 *                   description: Dirección del terreno asociado al usuario
 *                 telegram:
 *                  type: string
 *                  description: red social del usuario
 *       400:
 *         description: Error en los datos proporcionados
 *       401:
 *         description: Token inválido o no autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/put-profile', authMiddleware, walletController.putProfile);

/**
 * @swagger
 * /wallet/function-call:
 *   post:
 *     tags:
 *       - wallet
 *     summary: Realiza una llamada a un contrato inteligente
 *     description: Este endpoint permite realizar una llamada a un contrato inteligente en la blockchain de NEAR.
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contractId:
 *                 type: string
 *                 description: ID del contrato inteligente al que se realizará la llamada
 *               methodName:
 *                 type: string
 *                 description: Nombre del método del contrato que se ejecutará
 *               args:
 *                 type: object
 *                 description: Argumentos que se enviarán al método del contrato
 *               gas:
 *                 type: string
 *                 description: Cantidad de gas que se adjuntará a la transacción (en formato string)
 *               attachedDeposit:
 *                 type: string
 *                 description: Depósito adjunto a la transacción (en formato string)
 *     responses:
 *       200:
 *         description: Llamada al contrato realizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 transactionId:
 *                   type: string
 *                   description: ID de la transacción en la blockchain
 *                 status:
 *                   type: string
 *                   description: Estado de la transacción
 *       400:
 *         description: Error en los datos proporcionados
 *       401:
 *         description: Token inválido o no autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/function-call', authMiddleware, walletController.functionCall);

/**
 * @swagger
 * /wallet/upload-image:
 *   post:
 *     tags:
 *       - wallet
 *     summary: Sube una imagen para el usuario autenticado
 *     description: Este endpoint permite subir una imagen asociada al usuario autenticado. La imagen debe enviarse en formato form-data.
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Imagen que se subirá (archivo)
 *     responses:
 *       200:
 *         description: Imagen subida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL de la imagen subida
 *       400:
 *         description: Error en los datos proporcionados o imagen no encontrada
 *       401:
 *         description: Token inválido o no autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/upload-image', authMiddleware, ImageController.uploadImage);

/**
 * @swagger
 * /wallet/upload-images:
 *   post:
 *     tags:
 *       - wallet
 *     summary: Sube múltiples imágenes para el usuario autenticado
 *     description: Este endpoint permite subir múltiples imágenes asociadas al usuario autenticado. Las imágenes deben enviarse en formato form-data.
 *     security:
 *       - tokenAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Lista de imágenes que se subirán (archivos)
 *     responses:
 *       200:
 *         description: Imágenes subidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 urls:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Lista de URLs de las imágenes subidas
 *       400:
 *         description: Error en los datos proporcionados o imágenes no encontradas
 *       401:
 *         description: Token inválido o no autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/upload-images', authMiddleware, ImageController.uploadImages);


export { router }