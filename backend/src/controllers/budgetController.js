// Budget Controller
// Business logic for budget operations

import prisma from '../utils/prisma.js';
import { createBudgetSchema } from '../validators/schemas.js';

export const createBudget = async (req, res) => {
  try {
    const validatedData = createBudgetSchema.parse(req.body);
    
    // Mark previous active budgets as completed
    await prisma.budget.updateMany({
      where: { status: 'active' },
      data: { status: 'completed' },
    });
    
    // Create new budget
    const budget = await prisma.budget.create({
      data: {
        startDate: new Date(validatedData.startDate),
        amount: validatedData.amount,
        notes: validatedData.notes || null,
        status: 'active',
      },
    });
    
    res.status(201).json({
      success: true,
      budget: {
        id: budget.id,
        startDate: budget.startDate,
        amount: budget.amount,
        status: budget.status,
        notes: budget.notes,
      },
    });
  } catch (error) {
    console.error('Error creating budget:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create budget',
    });
  }
};

export const getAllBudgets = async (req, res) => {
  try {
    const budgets = await prisma.budget.findMany({
      include: {
        orders: {
          include: {
            cost: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });
    
    const budgetsWithStats = budgets.map(budget => {
      const totalSpent = budget.orders.reduce((sum, order) => {
        return sum + (order.cost?.totalCost || 0);
      }, 0);
      
      return {
        id: budget.id,
        startDate: budget.startDate,
        amount: budget.amount,
        status: budget.status,
        notes: budget.notes,
        orderCount: budget.orders.length,
        spent: totalSpent,
        remaining: budget.amount - totalSpent,
        percentage: Math.round((totalSpent / budget.amount) * 100),
      };
    });
    
    res.json({
      success: true,
      budgets: budgetsWithStats,
    });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch budgets',
    });
  }
};

export const getCurrentBudget = async (req, res) => {
  try {
    const budget = await prisma.budget.findFirst({
      where: { status: 'active' },
      include: {
        orders: {
          include: {
            cost: true,
          },
          orderBy: {
            date: 'desc',
          },
        },
      },
    });
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'No active budget found',
      });
    }
    
    const totalSpent = budget.orders.reduce((sum, order) => {
      return sum + (order.cost?.totalCost || 0);
    }, 0);
    
    res.json({
      success: true,
      budget: {
        id: budget.id,
        startDate: budget.startDate,
        amount: budget.amount,
        status: budget.status,
        notes: budget.notes,
        orderCount: budget.orders.length,
        spent: totalSpent,
        remaining: budget.amount - totalSpent,
        percentage: Math.round((totalSpent / budget.amount) * 100),
        recentOrders: budget.orders.slice(0, 5).map(order => ({
          id: order.id,
          date: order.date,
          pieces: order.pieces,
          totalKg: order.totalKg,
          totalCost: order.cost?.totalCost || 0,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching current budget:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch current budget',
    });
  }
};

export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if budget exists
    const budget = await prisma.budget.findUnique({
      where: { id: parseInt(id) },
      include: {
        orders: true,
      },
    });
    
    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'Budget not found',
      });
    }
    
    // Don't allow deleting budget with orders
    if (budget.orders.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete budget with ${budget.orders.length} existing order(s). Delete orders first.`,
      });
    }
    
    // Delete budget
    await prisma.budget.delete({
      where: { id: parseInt(id) },
    });
    
    res.json({
      success: true,
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting budget:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete budget',
    });
  }
};
