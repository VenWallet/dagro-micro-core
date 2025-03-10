import express from 'express';
const router = express.Router();
import ImageController from '../controllers/image.controllers';
import authMiddleware from '../middleware/auth.middleware';

router.get('/status', ImageController.status)

/**
 * Post track
 * @swagger
 * /wallet/login-seed-phrase:
 *    post:
 *      tags:
 *        - User
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

router.post('/upload-image', authMiddleware, ImageController.uploadImage);

router.post('/upload-images', ImageController.uploadImages);



export { router }