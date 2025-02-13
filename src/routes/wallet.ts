import express from 'express';
const router = express.Router();
import walletController from '../controllers/wallet.controllers';


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


router.post('/send-code-verify-email', walletController.sendCodeVerifyEmail)



export { router }