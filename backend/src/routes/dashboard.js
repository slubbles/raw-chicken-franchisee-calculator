// Dashboard Routes
// Defines the API endpoints for dashboard analytics

import express from 'express';
import { getWeeklySummary } from '../controllers/dashboardController.js';

const router = express.Router();

// GET /api/dashboard/weekly - Get weekly summary
router.get('/weekly', getWeeklySummary);

export default router;
