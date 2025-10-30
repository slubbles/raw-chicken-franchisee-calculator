// Calculation Service
// Contains all business logic for calculating costs, weights, and budget status

import prisma from '../utils/prisma.js';

/**
 * Get current budget status with spending
 * @returns {Object} - Active budget and remaining amount
 */
export async function getBudgetStatus() {
  const activeBudget = await prisma.budget.findFirst({
    where: { status: 'active' },
    include: {
      orders: {
        include: {
          cost: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  if (!activeBudget) {
    return {
      activeBudget: null,
      spent: 0,
      remaining: 0
    };
  }

  const spent = activeBudget.orders.reduce((total, order) => {
    return total + (order.cost?.totalCost || 0);
  }, 0);

  const remaining = activeBudget.amount - spent;

  return {
    activeBudget,
    spent: parseFloat(spent.toFixed(2)),
    remaining: parseFloat(remaining.toFixed(2))
  };
}

/**
 * Check if an order will exceed the budget
 * @param {number} remaining - Remaining budget amount
 * @param {number} orderCost - Cost of the order
 * @returns {Object} - Exceed status
 */
export function checkBudgetExceed(remaining, orderCost) {
  const exceeded = remaining < orderCost;
  const exceededBy = exceeded ? orderCost - remaining : 0;
  
  return {
    exceeded,
    exceededBy: parseFloat(exceededBy.toFixed(2))
  };
}

/**
 * Calculate total weight from all bags
 * @param {Array} bags - Array of bag objects with weightKg
 * @returns {number} - Total weight in kg
 */
export function calculateTotalWeight(bags) {
  return bags.reduce((total, bag) => total + bag.weightKg, 0);
}

/**
 * Calculate all costs for an order
 * @param {number} totalKg - Total weight in kg
 * @param {number} pricePerKg - Price per kilogram
 * @param {number} sauceDaily - Daily sauce cost (default: 200)
 * @param {number} seasoningDaily - Daily seasoning cost (default: 200)
 * @returns {Object} - Cost breakdown
 */
export function calculateCosts(totalKg, pricePerKg, sauceDaily = 200, seasoningDaily = 200) {
  const chickenCost = totalKg * pricePerKg;
  const totalCost = chickenCost + sauceDaily + seasoningDaily;
  
  return {
    chickenCost: parseFloat(chickenCost.toFixed(2)),
    sauceDaily: parseFloat(sauceDaily.toFixed(2)),
    seasoningDaily: parseFloat(seasoningDaily.toFixed(2)),
    totalCost: parseFloat(totalCost.toFixed(2))
  };
}

/**
 * Check budget status and calculate remaining
 * @param {Object} budget - Budget object with amount
 * @param {number} alreadySpent - Amount already spent from budget
 * @param {number} orderCost - Cost of current order
 * @returns {Object} - Budget status
 */
export function checkBudgetStatus(budget, alreadySpent, orderCost) {
  const budgetBefore = budget.amount - alreadySpent;
  const budgetAfter = budgetBefore - orderCost;
  const exceeded = budgetAfter < 0;
  const exceededBy = exceeded ? Math.abs(budgetAfter) : 0;
  
  return {
    budgetBefore: parseFloat(budgetBefore.toFixed(2)),
    budgetAfter: parseFloat(budgetAfter.toFixed(2)),
    exceeded,
    exceededBy: parseFloat(exceededBy.toFixed(2)),
    percentage: parseFloat(((alreadySpent + orderCost) / budget.amount * 100).toFixed(2))
  };
}

/**
 * Calculate daily supply status
 * @param {Date} lastRefill - Last refill date
 * @param {Date} nextRefillDue - Next refill due date
 * @param {number} refillFrequency - Days between refills (default: 7)
 * @returns {Object} - Supply status
 */
export function calculateSupplyStatus(lastRefill, nextRefillDue, refillFrequency = 7) {
  const today = new Date();
  const dueDate = new Date(nextRefillDue);
  const diffTime = dueDate - today;
  const daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let status = 'ok';
  let message = `Next refill in ${daysUntilDue} days`;
  
  if (daysUntilDue < 0) {
    status = 'overdue';
    message = `OVERDUE by ${Math.abs(daysUntilDue)} days! Reorder NOW`;
  } else if (daysUntilDue <= 2) {
    status = 'due_soon';
    message = `Due soon (${daysUntilDue} days). Plan to reorder`;
  }
  
  return {
    daysUntilDue,
    status,
    message
  };
}

/**
 * Calculate next refill date
 * @param {Date} refillDate - The refill date
 * @param {number} frequency - Days between refills (default: 7)
 * @returns {Date} - Next refill due date
 */
export function calculateNextRefillDate(refillDate, frequency = 7) {
  const date = new Date(refillDate);
  date.setDate(date.getDate() + frequency);
  return date;
}
