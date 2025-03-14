import express from 'express';
const router = express.Router();
import walletController from '../controllers/wallet.controllers';
import authMiddleware from '../middleware/auth.middleware';
import ImageController from '../controllers/image.controllers';

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
router.post('/login-seed-phrase', walletController.loginSeedPhrase);

router.get('/get-profile', authMiddleware, walletController.getProfile);

router.get('/get-profile-custom', authMiddleware, walletController.getProfileCustom);

router.get('/get-headings', authMiddleware, walletController.getHeadings);

router.put('/put-profile', authMiddleware, walletController.putProfile);

router.post('/function-call', authMiddleware, walletController.functionCall);

router.post('/upload-image', authMiddleware, ImageController.uploadImage);

router.post('/upload-images', authMiddleware, ImageController.uploadImages);


export { router }