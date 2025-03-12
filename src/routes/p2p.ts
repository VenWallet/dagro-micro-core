import express from 'express';
const router = express.Router();
import p2pController from '../controllers/p2p.controllers';
import authMiddleware from '../middleware/auth.middleware';
import ImageController from '../controllers/image.controllers';

router.get('/status', p2pController.status)

router.post('/create-order', authMiddleware, p2pController.createOrder)
router.post('/aprove-order', authMiddleware, p2pController.aproveOrder)
router.post('/cancel-order', authMiddleware, p2pController.cancelOrder)
router.post('/dispute-order', authMiddleware, p2pController.disputeOrder)


export { router }