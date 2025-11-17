const express = require('express');
const router = express.Router();

const productController = require('../controllers/productController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const authController = require('../controllers/authController');
const contactController = require('../controllers/contactController');
const adminController = require('../controllers/adminController');
const contentController = require('../controllers/contentController');

// Temporary: debug endpoint to list registered routes
router.get('/_debug/routes', (req, res) => {
	try {
		const routes = [];
		router.stack.forEach((layer) => {
			if (layer.route && layer.route.path) {
				const methods = Object.keys(layer.route.methods).filter(Boolean);
				routes.push({ path: layer.route.path, methods });
			} else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
				layer.handle.stack.forEach((nested) => {
					if (nested.route && nested.route.path) {
						const methods = Object.keys(nested.route.methods).filter(Boolean);
						routes.push({ path: nested.route.path, methods, nested: true });
					}
				});
			}
		});
		res.json({ success: true, routes });
	} catch (e) {
		console.error(e);
		res.status(500).json({ success: false, message: 'route debug error' });
	}
});

// Public product endpoints
router.get('/products', productController.list);
router.get('/products/:id', productController.get);

// Cart operations
router.post('/cart', cartController.add);
router.get('/cart/:sessionId', cartController.get);
router.put('/cart/:sessionId', cartController.update);
router.delete('/cart/:sessionId/item/:itemId', cartController.removeItem);

// Orders
router.post('/checkout', orderController.checkout);
router.get('/orders/:id', orderController.getOrder);

// Contact
router.post('/contact', contactController.submit);

// Content
router.get('/faqs', contentController.listFaqs);
router.get('/categories', contentController.listCategories);
router.get('/settings', contentController.getSettings);
router.get('/banners', contentController.listBanners);
router.get('/testimonials', contentController.listTestimonials);
router.post('/newsletter', contentController.subscribeNewsletter); // backward compat
router.post('/newsletter/subscribe', contentController.subscribeNewsletter);

// Auth (admin)
router.post('/auth/login', authController.login);

// Admin-only endpoints (simple token-based middleware inside controller)
router.use('/admin', adminController.router);

module.exports = router;
