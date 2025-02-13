import express from 'express';
const router = express.Router();
import walletController from '../controllers/wallet.controllers';


/**
 * Post track
 * @swagger
 * /wallet/send-code:
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
router.post('/send-code', walletController.sendCode)


router.post('/send-code-verify-email', walletController.sendCodeVerifyEmail)



export { router }