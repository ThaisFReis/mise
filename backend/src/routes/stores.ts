import { Router } from 'express';
import storeController from '../controllers/storeController';

const router = Router();

router.get('/', storeController.getStores);
router.get('/performance', storeController.getStorePerformance);

export default router;
