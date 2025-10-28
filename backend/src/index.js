// Main Express Server
// This file starts the backend API server

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './utils/prisma.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// Enable CORS (allows frontend to call this API)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Log all requests (for debugging)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============================================
// ROUTES
// ============================================

// Root endpoint (welcome page)
app.get('/', (req, res) => {
  res.json({
    message: '🐔 Welcome to Franchise Reorder Calculator API!',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      root: '/',
      health: '/health',
      api_info: '/api',
      orders: '/api/orders (coming soon)',
      budgets: '/api/budgets (coming soon)',
      supplies: '/api/supplies (coming soon)',
      dashboard: '/api/dashboard (coming soon)'
    },
    docs: 'Check /api for available endpoints'
  });
});

// Health check endpoint (test if server is running)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Franchise Reorder Calculator API is running!',
    timestamp: new Date().toISOString()
  });
});

// API version info
app.get('/api', (req, res) => {
  res.json({
    name: 'Franchise Reorder Calculator API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      db_test: '/api/db-test',
      orders: '/api/orders (coming soon)',
      budgets: '/api/budgets (coming soon)',
      supplies: '/api/supplies (coming soon)',
      dashboard: '/api/dashboard (coming soon)'
    }
  });
});

// Database connection test
app.get('/api/db-test', async (req, res) => {
  try {
    // Count records in each table
    const budgetCount = await prisma.budget.count();
    const orderCount = await prisma.order.count();
    const bagCount = await prisma.bagWeight.count();
    const costCount = await prisma.cost.count();
    const supplyCount = await prisma.supply.count();
    
    res.json({
      status: 'Database connected! ✅',
      tables: {
        budgets: budgetCount,
        orders: orderCount,
        bag_weights: bagCount,
        costs: costCount,
        supplies: supplyCount
      },
      message: 'All tables are accessible'
    });
  } catch (error) {
    res.status(500).json({
      status: 'Database error ❌',
      error: error.message
    });
  }
});

// 404 handler (route not found)
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Server is running!');
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API info: http://localhost:${PORT}/api`);
  console.log('');
  console.log('Press Ctrl+C to stop the server');
  console.log('');
});
