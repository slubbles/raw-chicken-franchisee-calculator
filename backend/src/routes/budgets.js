// Budget Routes
// Defines the API endpoints for budget operations

import express from 'express';
import { createBudget, getAllBudgets, getCurrentBudget, deleteBudget } from '../controllers/budgetController.js';

const router = express.Router();

// POST /api/budgets - Create new budget
router.post('/', createBudget);

// GET /api/budgets - Get all budgets
router.get('/', getAllBudgets);

// GET /api/budgets/current - Get current active budget
router.get('/current', getCurrentBudget);

// DELETE /api/budgets/:id - Delete budget
router.delete('/:id', deleteBudget);

export default router;
