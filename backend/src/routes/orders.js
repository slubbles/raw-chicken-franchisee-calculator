// Orders Routes
// Defines the API endpoints for order operations

import express from 'express';
import { createOrder, getAllOrders, getOrderById, deleteOrder } from '../controllers/orderController.js';

const router = express.Router();

// POST /api/orders - Create new order
router.post('/', createOrder);

// GET /api/orders - Get all orders
router.get('/', getAllOrders);

// GET /api/orders/:id - Get single order
router.get('/:id', getOrderById);

// DELETE /api/orders/:id - Delete order
router.delete('/:id', deleteOrder);

export default router;
