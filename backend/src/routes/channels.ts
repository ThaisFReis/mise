import { Router } from 'express';
import channelController from '../controllers/channelController';

const router = Router();

router.get('/', channelController.getChannels);
router.get('/performance', channelController.getChannelPerformance);
router.get('/top-products', channelController.getTopProductsByChannel);
router.get('/peak-hours', channelController.getPeakHoursByChannel);
router.get('/timeline', channelController.getChannelTimeline);

export default router;
