import express from 'express';
const router = express.Router();
import walletController from '../controllers/wallet.controllers';
import authMiddleware from '../middleware/auth.middleware';

router.get('/status', walletController.status)

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
router.post('/login-seed-phrase', walletController.loginSeedPhrase)

router.get('/get-grofile', authMiddleware, walletController.getProfile)

router.get('/get-headings', authMiddleware, walletController.getHeadings)

router.put('/put-profile', authMiddleware, walletController.putProfile)


export { router }