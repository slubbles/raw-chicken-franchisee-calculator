// Supply Controller
// Business logic for supply tracking operations

import prisma from '../utils/prisma.js';
import { refillSupplySchema } from '../validators/schemas.js';

export const getAllSupplies = async (req, res) => {
  try {
    const supplies = await prisma.supply.findMany({
      orderBy: {
        type: 'asc',
      },
    });
    
    const now = new Date();
    
    const suppliesWithStatus = supplies.map(supply => {
      const nextDue = new Date(supply.nextRefillDue);
      const daysUntilDue = Math.ceil((nextDue - now) / (1000 * 60 * 60 * 24));
      
      let status = 'ok';
      let message = `Next refill: ${nextDue.toLocaleDateString()}`;
      
      if (daysUntilDue < 0) {
        status = 'overdue';
        message = `Overdue by ${Math.abs(daysUntilDue)} day(s)! Reorder NOW`;
      } else if (daysUntilDue <= 2) {
        status = 'due_soon';
        message = `Due in ${daysUntilDue} day(s) - order soon`;
      }
      
      return {
        id: supply.id,
        type: supply.type,
        lastRefill: supply.lastRefill,
        nextRefillDue: supply.nextRefillDue,
        costPerRefill: supply.costPerRefill,
        refillFrequency: supply.refillFrequency,
        daysUntilDue,
        status,
        message,
      };
    });
    
    res.json({
      success: true,
      supplies: suppliesWithStatus,
    });
  } catch (error) {
    console.error('Error fetching supplies:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch supplies',
    });
  }
};

export const refillSupply = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = refillSupplySchema.parse(req.body);
    
    const supply = await prisma.supply.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!supply) {
      return res.status(404).json({
        success: false,
        error: 'Supply not found',
      });
    }
    
    const refillDate = new Date(validatedData.refillDate);
    const nextRefillDue = new Date(refillDate);
    nextRefillDue.setDate(nextRefillDue.getDate() + supply.refillFrequency);
    
    const updatedSupply = await prisma.supply.update({
      where: { id: parseInt(id) },
      data: {
        lastRefill: refillDate,
        nextRefillDue: nextRefillDue,
        status: 'ok',
      },
    });
    
    res.json({
      success: true,
      message: `${supply.type} marked as refilled`,
      supply: {
        id: updatedSupply.id,
        type: updatedSupply.type,
        lastRefill: updatedSupply.lastRefill,
        nextRefillDue: updatedSupply.nextRefillDue,
        status: updatedSupply.status,
      },
    });
  } catch (error) {
    console.error('Error refilling supply:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid input data',
        details: error.errors,
      });
    }
    
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to refill supply',
    });
  }
};

export const initializeSupplies = async (req, res) => {
  try {
    // Check if supplies already exist
    const existingSupplies = await prisma.supply.count();
    
    if (existingSupplies > 0) {
      return res.status(400).json({
        success: false,
        error: 'Supplies already initialized',
      });
    }
    
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    await prisma.supply.createMany({
      data: [
        {
          type: 'sauce',
          lastRefill: today,
          costPerRefill: 1400,
          refillFrequency: 7,
          nextRefillDue: nextWeek,
          status: 'ok',
        },
        {
          type: 'seasoning',
          lastRefill: today,
          costPerRefill: 1400,
          refillFrequency: 7,
          nextRefillDue: nextWeek,
          status: 'ok',
        },
      ],
    });
    
    res.json({
      success: true,
      message: 'Supplies initialized successfully',
    });
  } catch (error) {
    console.error('Error initializing supplies:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to initialize supplies',
    });
  }
};
