// Main Express Server
// This file starts the backend API server

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './utils/prisma.js';
import ordersRouter from './routes/orders.js';
import budgetsRouter from './routes/budgets.js';
import suppliesRouter from './routes/supplies.js';
import dashboardRouter from './routes/dashboard.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

// Enable CORS (allows frontend to call this API)
// Production: Whitelist only the frontend domain
// Development: Allow all origins for easier local dev
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);
    
    if (process.env.NODE_ENV === 'production') {
      // Production: Only allow whitelisted origins
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed`));
      }
    } else {
      // Development: Allow all origins
      callback(null, true);
    }
  },
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

// Mount API routes
app.use('/api/orders', ordersRouter);
app.use('/api/budgets', budgetsRouter);
app.use('/api/supplies', suppliesRouter);
app.use('/api/dashboard', dashboardRouter);

// API health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Try to get database info (different syntax for PostgreSQL vs SQLite)
    let dbInfo = 'connected';
    try {
      const version = await prisma.$queryRaw`SELECT current_setting('server_version') as version`;
      dbInfo = version[0]?.version || 'PostgreSQL';
    } catch {
      dbInfo = 'Database connected (version unknown)';
    }
    
    res.json({ 
      status: 'healthy',
      service: 'Franchise Reorder Calculator API',
      message: 'Backend is running',
      timestamp: new Date().toISOString(),
      database: {
        status: 'connected',
        info: dbInfo
      },
      uptime: Math.round(process.uptime()) + 's',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
      },
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'Franchise Reorder Calculator API',
      timestamp: new Date().toISOString(),
      database: {
        status: 'disconnected',
        error: error.message
      }
    });
  }
});

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
      orders: '/api/orders',
      budgets: '/api/budgets',
      supplies: '/api/supplies',
      dashboard: '/api/dashboard',
    },
    docs: 'Check /api for available endpoints'
  });
});

// Health check endpoint (test if server is running)
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({ 
      status: 'ok',
      service: 'Franchise Reorder Calculator API',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      service: 'Franchise Reorder Calculator API',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: error.message
    });
  }
});

// API version info
app.get('/api', (req, res) => {
  res.json({
    name: 'Franchise Reorder Calculator API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      db_test: '/api/db-test',
      orders: '/api/orders',
      budgets: '/api/budgets',
      supplies: '/api/supplies',
      dashboard: '/api/dashboard/weekly',
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
