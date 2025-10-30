// Dashboard Controller
// Business logic for dashboard analytics

import prisma from '../utils/prisma.js';

export const getWeeklySummary = async (req, res) => {
  try {
    const { startDate } = req.query;
    
    // Determine week range
    let weekStart, weekEnd;
    if (startDate) {
      weekStart = new Date(startDate);
      weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
    } else {
      // Default to current week (Monday to Sunday)
      const today = new Date();
      const dayOfWeek = today.getDay();
      weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      weekStart.setHours(0, 0, 0, 0);
      
      weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 7);
    }
    
    // Get current active budget
    const budget = await prisma.budget.findFirst({
      where: { status: 'active' },
      include: {
        orders: {
          where: {
            date: {
              gte: weekStart,
              lt: weekEnd,
            },
          },
          include: {
            cost: true,
          },
          orderBy: {
            date: 'asc',
          },
        },
      },
    });
    
    // Get all orders for this budget (for total spent)
    const allOrders = await prisma.order.findMany({
      where: {
        budgetId: budget?.id,
      },
      include: {
        cost: true,
      },
    });
    
    const totalBudgetSpent = allOrders.reduce((sum, order) => {
      return sum + (order.cost?.totalCost || 0);
    }, 0);
    
    const weeklyOrders = budget?.orders || [];
    const weeklySpent = weeklyOrders.reduce((sum, order) => {
      return sum + (order.cost?.totalCost || 0);
    }, 0);
    
    const weeklyKg = weeklyOrders.reduce((sum, order) => {
      return sum + (order.totalKg || 0);
    }, 0);
    
    // Daily breakdown
    const dailyBreakdown = {};
    weeklyOrders.forEach(order => {
      const dateKey = order.date.toISOString().split('T')[0];
      if (!dailyBreakdown[dateKey]) {
        dailyBreakdown[dateKey] = {
          date: dateKey,
          orders: 0,
          totalKg: 0,
          totalCost: 0,
          exceeded: false,
        };
      }
      dailyBreakdown[dateKey].orders += 1;
      dailyBreakdown[dateKey].totalKg += order.totalKg || 0;
      dailyBreakdown[dateKey].totalCost += order.cost?.totalCost || 0;
      if (order.cost?.exceeded) {
        dailyBreakdown[dateKey].exceeded = true;
      }
    });
    
    // Get supplies status
    const supplies = await prisma.supply.findMany();
    const now = new Date();
    
    const alerts = [];
    
    // Budget alerts
    if (budget) {
      const budgetRemaining = budget.amount - totalBudgetSpent;
      const budgetPercentage = Math.round((totalBudgetSpent / budget.amount) * 100);
      
      if (budgetPercentage >= 90) {
        alerts.push({
          type: 'budget',
          severity: 'critical',
          message: `Budget ${budgetPercentage}% spent - only ₱${budgetRemaining.toFixed(2)} remaining`,
        });
      } else if (budgetPercentage >= 75) {
        alerts.push({
          type: 'budget',
          severity: 'warning',
          message: `Budget ${budgetPercentage}% spent`,
        });
      }
    }
    
    // Supply alerts
    supplies.forEach(supply => {
      const nextDue = new Date(supply.nextRefillDue);
      const daysUntilDue = Math.ceil((nextDue - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDue < 0) {
        alerts.push({
          type: 'supplies',
          severity: 'critical',
          message: `${supply.type} overdue by ${Math.abs(daysUntilDue)} day(s)!`,
        });
      } else if (daysUntilDue <= 2) {
        alerts.push({
          type: 'supplies',
          severity: 'warning',
          message: `${supply.type} due in ${daysUntilDue} day(s)`,
        });
      }
    });
    
    res.json({
      success: true,
      week: {
        start: weekStart.toISOString().split('T')[0],
        end: weekEnd.toISOString().split('T')[0],
      },
      budget: budget ? {
        id: budget.id,
        allocated: budget.amount,
        spent: totalBudgetSpent,
        remaining: budget.amount - totalBudgetSpent,
        percentage: Math.round((totalBudgetSpent / budget.amount) * 100),
      } : null,
      weekly: {
        orderCount: weeklyOrders.length,
        totalKg: weeklyKg,
        totalCost: weeklySpent,
      },
      dailyBreakdown: Object.values(dailyBreakdown).sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      ),
      alerts,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch dashboard data',
    });
  }
};
