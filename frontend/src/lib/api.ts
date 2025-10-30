// API Client - Handles all backend communication
// Enhanced with retry logic, timeout, and better error handling

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Configuration
const API_CONFIG = {
  timeout: 10000, // 10 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

/**
 * Custom API Error class with more details
 */
class APIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if error is retryable (network errors, 5xx errors)
 */
function isRetryableError(error: any, statusCode?: number): boolean {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  // Server errors (5xx)
  if (statusCode && statusCode >= 500) {
    return true;
  }
  return false;
}

/**
 * Enhanced fetch wrapper with timeout, retry, and error handling
 */
async function apiCall(
  endpoint: string, 
  options: RequestInit = {},
  retryCount = 0
): Promise<any> {
  const url = `${API_URL}${endpoint}`;
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Parse response
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle errors
    if (!response.ok) {
      const errorMessage = typeof data === 'object' 
        ? (data.error || data.message || 'API request failed')
        : data || 'API request failed';

      // Retry logic for retryable errors
      if (isRetryableError(null, response.status) && retryCount < API_CONFIG.retryAttempts) {
        console.warn(`Retrying ${endpoint} (attempt ${retryCount + 1}/${API_CONFIG.retryAttempts})`);
        await sleep(API_CONFIG.retryDelay * (retryCount + 1)); // Exponential backoff
        return apiCall(endpoint, options, retryCount + 1);
      }

      throw new APIError(
        errorMessage,
        response.status,
        endpoint,
        data
      );
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIError(
        'Request timeout - server took too long to respond',
        408,
        endpoint
      );
    }

    // Handle network errors with retry
    if (error instanceof TypeError && retryCount < API_CONFIG.retryAttempts) {
      console.warn(`Network error, retrying ${endpoint} (attempt ${retryCount + 1}/${API_CONFIG.retryAttempts})`);
      await sleep(API_CONFIG.retryDelay * (retryCount + 1));
      return apiCall(endpoint, options, retryCount + 1);
    }

    // Re-throw APIError as-is
    if (error instanceof APIError) {
      throw error;
    }

    // Wrap other errors
    console.error(`API Error (${endpoint}):`, error);
    throw new APIError(
      error instanceof Error ? error.message : 'Network error - failed to connect to server',
      undefined,
      endpoint,
      error
    );
  }
}

/**
 * Simple in-memory cache for GET requests
 */
class APICache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private ttl = 30000; // 30 seconds

  set(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    // Check if expired
    if (Date.now() - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  invalidate(pattern?: string) {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    // Invalidate keys matching pattern
    Array.from(this.cache.keys())
      .filter(key => key.includes(pattern))
      .forEach(key => this.cache.delete(key));
  }
}

const apiCache = new APICache();

/**
 * Cached GET request wrapper
 */
async function cachedGet(endpoint: string, useCache = true): Promise<any> {
  if (useCache) {
    const cached = apiCache.get(endpoint);
    if (cached) {
      console.log(`Cache hit: ${endpoint}`);
      return cached;
    }
  }

  const data = await apiCall(endpoint);
  if (useCache) {
    apiCache.set(endpoint, data);
  }
  return data;
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
    const result = await apiCall('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    apiCache.invalidate('/orders');
    apiCache.invalidate('/dashboard');
    return result;
  },

  /**
   * Get all orders (cached)
   */
  getAll: async (useCache = true) => {
    return cachedGet('/orders', useCache);
  },

  /**
   * Get a single order by ID
   */
  getById: async (id: number) => {
    return apiCall(`/orders/${id}`);
  },

  /**
   * Delete an order
   */
  delete: async (id: number) => {
    const result = await apiCall(`/orders/${id}`, {
      method: 'DELETE',
    });
    apiCache.invalidate('/orders');
    apiCache.invalidate('/dashboard');
    return result;
  },

  /**
   * Bulk delete orders
   */
  bulkDelete: async (ids: number[]) => {
    const result = await apiCall('/orders/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
    apiCache.invalidate('/orders');
    apiCache.invalidate('/dashboard');
    return result;
  },

  /**
   * Export orders to CSV
   */
  exportCSV: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString() ? `?${params.toString()}` : '';
    return apiCall(`/orders/export${query}`);
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
    const result = await apiCall('/budgets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    apiCache.invalidate('/budgets');
    apiCache.invalidate('/dashboard');
    return result;
  },

  /**
   * Get all budgets (cached)
   */
  getAll: async (useCache = true) => {
    return cachedGet('/budgets', useCache);
  },

  /**
   * Get current active budget (cached)
   */
  getCurrent: async (useCache = true) => {
    return cachedGet('/budgets/current', useCache);
  },

  /**
   * Update a budget
   */
  update: async (id: number, data: Partial<CreateBudgetData>) => {
    const result = await apiCall(`/budgets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    apiCache.invalidate('/budgets');
    apiCache.invalidate('/dashboard');
    return result;
  },

  /**
   * Delete a budget
   */
  delete: async (id: number) => {
    const result = await apiCall(`/budgets/${id}`, {
      method: 'DELETE',
    });
    apiCache.invalidate('/budgets');
    apiCache.invalidate('/dashboard');
    return result;
  },

  /**
   * Export budgets to CSV
   */
  exportCSV: async () => {
    return apiCall('/budgets/export');
  },
};

// ============================================
// SUPPLIES API
// ============================================

export const suppliesAPI = {
  /**
   * Get all supplies status (cached)
   */
  getAll: async (useCache = true) => {
    return cachedGet('/supplies', useCache);
  },

  /**
   * Mark supply as refilled
   */
  refill: async (id: number, refillDate: string) => {
    const result = await apiCall(`/supplies/${id}/refill`, {
      method: 'PUT',
      body: JSON.stringify({ refillDate }),
    });
    apiCache.invalidate('/supplies');
    return result;
  },

  /**
   * Initialize default supplies
   */
  initialize: async () => {
    const result = await apiCall('/supplies/initialize', {
      method: 'POST',
    });
    apiCache.invalidate('/supplies');
    return result;
  },

  /**
   * Bulk update supplies quantity
   */
  bulkUpdate: async (updates: Array<{ id: number; quantity: number }>) => {
    const result = await apiCall('/supplies/bulk-update', {
      method: 'POST',
      body: JSON.stringify({ updates }),
    });
    apiCache.invalidate('/supplies');
    return result;
  },

  /**
   * Create new supply item
   */
  create: async (data: { name: string; quantity: number; unit: string }) => {
    const result = await apiCall('/supplies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    apiCache.invalidate('/supplies');
    return result;
  },

  /**
   * Delete supply item
   */
  delete: async (id: number) => {
    const result = await apiCall(`/supplies/${id}`, {
      method: 'DELETE',
    });
    apiCache.invalidate('/supplies');
    return result;
  },
};

// ============================================
// DASHBOARD API
// ============================================

export const dashboardAPI = {
  /**
   * Get weekly summary (cached for 30s)
   */
  getWeekly: async (startDate?: string, useCache = true) => {
    const query = startDate ? `?startDate=${startDate}` : '';
    return cachedGet(`/dashboard/weekly${query}`, useCache);
  },

  /**
   * Get dashboard statistics
   */
  getStats: async (useCache = true) => {
    return cachedGet('/dashboard/stats', useCache);
  },

  /**
   * Get recent activity
   */
  getRecentActivity: async () => {
    return apiCall('/dashboard/activity');
  },

  /**
   * Get budget alerts
   */
  getAlerts: async (useCache = true) => {
    return cachedGet('/dashboard/alerts', useCache);
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
    try {
      const response = await apiCall('/health');
      return { status: 'healthy', ...response };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        error: error instanceof APIError ? error.message : 'Unknown error' 
      };
    }
  },

  /**
   * Test database connection
   */
  dbTest: async () => {
    return apiCall('/db-test');
  },
};

/**
 * Utility functions for API management
 */
export const apiUtils = {
  /**
   * Clear all caches
   */
  clearCache: () => {
    apiCache.invalidate();
  },

  /**
   * Clear specific cache by pattern
   */
  clearCacheFor: (resource: string) => {
    apiCache.invalidate(resource);
  },

  /**
   * Get API configuration
   */
  getConfig: () => ({ ...API_CONFIG }),

  /**
   * Check if API is available
   */
  isAvailable: async () => {
    const health = await healthAPI.check();
    return health.status === 'healthy';
  },

  /**
   * Refresh all data (clear cache and refetch)
   */
  refreshAll: () => {
    apiCache.invalidate();
  },
};
