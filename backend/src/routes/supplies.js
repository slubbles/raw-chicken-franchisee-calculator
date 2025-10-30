// Supply Routes
// Defines the API endpoints for supply tracking operations

import express from 'express';
import { getAllSupplies, refillSupply, initializeSupplies } from '../controllers/supplyController.js';

const router = express.Router();

// GET /api/supplies - Get all supplies status
router.get('/', getAllSupplies);

// PUT /api/supplies/:id/refill - Mark supply as refilled
router.put('/:id/refill', refillSupply);

// POST /api/supplies/initialize - Initialize default supplies
router.post('/initialize', initializeSupplies);

export default router;
