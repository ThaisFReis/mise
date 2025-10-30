import { Router } from 'express';
import productController from '../controllers/productController';

const router = Router();

router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.get('/:id/customizations', productController.getProductCustomizations);

export default router;
