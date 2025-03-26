import express from 'express';
const router = express.Router();
import ImageController from '../controllers/image.controllers';
import authMiddleware from '../middleware/auth.middleware';



/**
 * Post track
 * @swagger
 * /image/status:
 *   get:
 *     tags:
 *      - image
 *     summary: Verifica el estado del servicio image
 *     responses:
 *       200:
 *         description: Servicio funcionando correctamente
 */
router.get('/status', ImageController.status)

/**
 * @swagger
 * /image/upload-image:
 *   post:
 *     tags:
 *       - image
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
 * /image/upload-images:
 *   post:
 *     tags:
 *       - image
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