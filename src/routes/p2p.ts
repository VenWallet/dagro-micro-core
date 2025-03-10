import express from 'express';
const router = express.Router();
import p2pController from '../controllers/p2p.controllers';
import authMiddleware from '../middleware/auth.middleware';
import ImageController from '../controllers/image.controllers';

router.get('/status', p2pController.status)



export { router }