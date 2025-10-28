// API Client - Handles all backend communication
// This file contains functions to call backend endpoints

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Generic fetch wrapper with error handling
 */
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// ============================================
// ORDERS API
// ============================================

export interface BagWeight {
  weightKg: number;
  bagType: 'full_bag' | 'manual';
}

export interface CreateOrderData {
  date: string; // ISO date string
  pieces: number;
  chopCount: number;
  buoCount: number;
  pricePerKg: number;
  bags: BagWeight[];
}

export interface Order {
  id: number;
  date: string;
  pieces: number;
  chopCount: number;
  buoCount: number;
  totalKg: number;
  createdAt: string;
}

export const ordersAPI = {
  /**
   * Create a new chicken order
   */
  create: async (data: CreateOrderData) => {
    return apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all orders
   */
  getAll: async () => {
    return apiCall('/orders');
  },

  /**
   * Get a single order by ID
   */
  getById: async (id: number) => {
    return apiCall(`/orders/${id}`);
  },
};

// ============================================
// BUDGETS API
// ============================================

export interface CreateBudgetData {
  startDate: string;
  amount: number;
  notes?: string;
}

export const budgetsAPI = {
  /**
   * Create a new budget
   */
  create: async (data: CreateBudgetData) => {
    return apiCall('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get all budgets
   */
  getAll: async () => {
    return apiCall('/budgets');
  },

  /**
   * Get current active budget
   */
  getCurrent: async () => {
    return apiCall('/budgets/current');
  },
};

// ============================================
// SUPPLIES API
// ============================================

export const suppliesAPI = {
  /**
   * Get all supplies status
   */
  getAll: async () => {
    return apiCall('/supplies');
  },

  /**
   * Mark supply as refilled
   */
  refill: async (id: number, refillDate: string) => {
    return apiCall(`/supplies/${id}/refill`, {
      method: 'PUT',
      body: JSON.stringify({ refillDate }),
    });
  },
};

// ============================================
// DASHBOARD API
// ============================================

export const dashboardAPI = {
  /**
   * Get weekly summary
   */
  getWeekly: async (startDate?: string) => {
    const query = startDate ? `?startDate=${startDate}` : '';
    return apiCall(`/dashboard/weekly${query}`);
  },
};

// ============================================
// HEALTH CHECK
// ============================================

export const healthAPI = {
  /**
   * Check if backend is running
   */
  check: async () => {
    return apiCall('/health');
  },

  /**
   * Test database connection
   */
  dbTest: async () => {
    return apiCall('/db-test');
  },
};
