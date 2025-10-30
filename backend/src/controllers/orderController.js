// Order Controller
// Contains business logic for handling order operations

import prisma from '../utils/prisma.js';
import { createOrderSchema } from '../validators/schemas.js';
import * as calculationService from '../services/calculationService.js';

/**
 * Create a new chicken order
 */
export const createOrder = async (req, res) => {
  try {
    const validatedData = createOrderSchema.parse(req.body);
    
    // Calculate total weight
    const totalKg = calculationService.calculateTotalWeight(validatedData.bags);
    
    // Calculate costs
    const costs = calculationService.calculateCosts(totalKg, validatedData.pricePerKg);
    
    // Get current budget status
    const budgetStatus = await calculationService.getBudgetStatus();
    
    if (!budgetStatus.activeBudget) {
      return res.status(400).json({
        success: false,
        error: 'No active budget found. Please create a budget first.'
      });
    }
    
    // Check if order will exceed budget
    const exceedCheck = calculationService.checkBudgetExceed(
      budgetStatus.remaining,
      costs.totalCost
    );
    
    // Create order with all related data in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // 1. Create the order
      const newOrder = await tx.order.create({
        data: {
          budgetId: budgetStatus.activeBudget.id,
          date: new Date(validatedData.date),
          pieces: validatedData.pieces,
          chopCount: validatedData.chopCount,
          buoCount: validatedData.buoCount,
          totalKg: totalKg,
        },
      });
      
      // 2. Create bag weights
      await tx.bagWeight.createMany({
        data: validatedData.bags.map(bag => ({
          orderId: newOrder.id,
          weightKg: bag.weightKg,
          bagType: bag.bagType,
        })),
      });
      
      // 3. Create cost record
      await tx.cost.create({
        data: {
          orderId: newOrder.id,
          pricePerKg: validatedData.pricePerKg,
          chickenCost: costs.chickenCost,
          sauceDaily: costs.sauceDaily,
          seasoningDaily: costs.seasoningDaily,
          totalCost: costs.totalCost,
          budgetBefore: budgetStatus.allocated,
          budgetAfter: budgetStatus.remaining - costs.totalCost,
          exceeded: exceedCheck.exceeded,
          exceededBy: exceedCheck.exceededBy,
        },
      });
      
      return newOrder;
    });
    
    // Return success response
    res.status(201).json({
      success: true,
      order: {
        id: order.id,
        date: order.date,
        pieces: order.pieces,
        totalKg: order.totalKg,
        cost: costs,
      },
      budget: {
        allocated: budgetStatus.allocated,
        spent: budgetStatus.spent + costs.totalCost,
        remaining: budgetStatus.remaining - costs.totalCost,
        status: exceedCheck.exceeded ? 'exceeded' : 'ok',
        exceededBy: exceedCheck.exceededBy,
      },
    });
    
  } catch (error) {
    console.error('Error creating order:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create order',
    });
  }
};

/**
 * Get all orders
 */
export const getAllOrders = async (req, res) => {
  try {
    const { limit = 20, offset = 0, startDate, endDate } = req.query;
    
    const where = {};
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    
    const orders = await prisma.order.findMany({
      where,
      include: {
        cost: true,
        bags: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: parseInt(limit),
      skip: parseInt(offset),
    });
    
    const total = await prisma.order.count({ where });
    
    res.json({
      success: true,
      orders: orders.map(order => ({
        id: order.id,
        date: order.date,
        pieces: order.pieces,
        chopCount: order.chopCount,
        buoCount: order.buoCount,
        totalKg: order.totalKg,
        totalCost: order.cost?.totalCost || 0,
        exceeded: order.cost?.exceeded || false,
        bagCount: order.bags.length,
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch orders',
    });
  }
};

/**
 * Get single order by ID
 */
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        cost: true,
        bags: true,
        budget: true,
      },
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }
    
    res.json({
      success: true,
      order: {
        id: order.id,
        date: order.date,
        pieces: order.pieces,
        chopCount: order.chopCount,
        buoCount: order.buoCount,
        totalKg: order.totalKg,
        bags: order.bags.map(bag => ({
          id: bag.id,
          weightKg: bag.weightKg,
          bagType: bag.bagType,
        })),
        cost: order.cost ? {
          pricePerKg: order.cost.pricePerKg,
          chickenCost: order.cost.chickenCost,
          sauceDaily: order.cost.sauceDaily,
          seasoningDaily: order.cost.seasoningDaily,
          totalCost: order.cost.totalCost,
          exceeded: order.cost.exceeded,
          exceededBy: order.cost.exceededBy,
        } : null,
        budget: {
          id: order.budget.id,
          startDate: order.budget.startDate,
          amount: order.budget.amount,
        },
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch order',
    });
  }
};

/**
 * Delete an order
 */
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }
    
    // Delete order (cascade will delete related bags and costs)
    await prisma.order.delete({
      where: { id: parseInt(id) },
    });
    
    res.json({
      success: true,
      message: 'Order deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete order',
    });
  }
};
