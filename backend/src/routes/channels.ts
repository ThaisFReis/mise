import { Router } from 'express';
import channelController from '../controllers/channelController';

const router = Router();

router.get('/performance', channelController.getChannelPerformance);

export default router;
