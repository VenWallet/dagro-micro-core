import express from 'express';
const router = express.Router();
import ImageController from '../controllers/image.controllers';
import authMiddleware from '../middleware/auth.middleware';



/**
 * Post track
 * @swagger
 * /image/status:
 *    get:
 *      tags:
 *        - image
 *      summary: .
 *      description: .
 *      requestBody:
 *          content:
 *            application/json:
 *              schema:
 *                type: "object"
 *                properties: {
 *                }
 *      responses:
 *        '200':
 *          description: .
 *        '400':
 *          description: .
 *        '500':
 *          description: server internal error.
 */
router.get('/status', authMiddleware, ImageController.status)

router.post('/upload-image', authMiddleware, ImageController.uploadImage);

router.post('/upload-images', authMiddleware, ImageController.uploadImages);



export { router }