const express = require('express');
const productController = require('../controllers/productController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const upload = require('../middleware/uploadHandler');

const router = express.Router();

// Public routes
router.get('/', productController.getProducts);
router.get('/featured/ending-soon', productController.getEndingSoon);
router.get('/featured/trending', productController.getTrending);
router.get('/featured/high-price', productController.getHighPrice);
router.get('/:id', productController.getProductById);

// Protected routes
router.post('/', authMiddleware, upload.array('images', 10), productController.createProduct);
router.put('/:id', authMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);
router.get('/my-products', authMiddleware, productController.getSellerProducts);

module.exports = router;