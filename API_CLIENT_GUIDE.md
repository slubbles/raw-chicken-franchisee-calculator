# API Client Guide

## Overview
Enhanced API client with production-grade features for the Calamias Fried Chicken calculator app.

## Features

### 🔄 Automatic Retry Logic
- **3 retry attempts** with exponential backoff
- Retries on network errors and 5xx server errors
- Base delay: 1 second (increases with each retry)

### ⏱️ Timeout Protection
- **10-second timeout** on all requests
- Prevents hanging requests
- Returns 408 status code on timeout

### 💾 Smart Caching
- **30-second TTL** (Time To Live) for GET requests
- In-memory cache for faster page loads
- Automatic cache invalidation on mutations
- Cache hit logging for debugging

### ❌ Structured Error Handling
- Custom `APIError` class with:
  - `statusCode`: HTTP status code
  - `endpoint`: Failed endpoint path
  - `details`: Additional error information
- Clear error messages for debugging

### 🚀 Bulk Operations
- Bulk delete orders
- Bulk update supplies
- Efficient batch processing

---

## Configuration

```typescript
const API_CONFIG = {
  timeout: 10000,        // 10 seconds
  retryAttempts: 3,      // 3 retry attempts
  retryDelay: 1000,      // 1 second base delay
};
```

---

## API Methods

### Orders API

#### `ordersAPI.create(data)`
Create a new chicken order
```typescript
const order = await ordersAPI.create({
  date: '2024-01-15',
  pieces: 50,
  chopCount: 10,
  buoCount: 5,
  pricePerKg: 180,
  bags: [
    { weightKg: 10, bagType: 'full_bag' },
    { weightKg: 5.5, bagType: 'manual' }
  ]
});
```

#### `ordersAPI.getAll(useCache?)`
Get all orders (cached by default)
```typescript
// With cache (default)
const orders = await ordersAPI.getAll();

// Force fresh data
const orders = await ordersAPI.getAll(false);
```

#### `ordersAPI.getById(id)`
Get single order by ID
```typescript
const order = await ordersAPI.getById(123);
```

#### `ordersAPI.delete(id)`
Delete an order
```typescript
await ordersAPI.delete(123);
```

#### `ordersAPI.bulkDelete(ids)`
Delete multiple orders at once
```typescript
await ordersAPI.bulkDelete([1, 2, 3, 4, 5]);
```

#### `ordersAPI.exportCSV(startDate?, endDate?)`
Export orders to CSV
```typescript
// All orders
const csv = await ordersAPI.exportCSV();

// Date range
const csv = await ordersAPI.exportCSV('2024-01-01', '2024-01-31');
```

---

### Budgets API

#### `budgetsAPI.create(data)`
Create a new budget
```typescript
const budget = await budgetsAPI.create({
  startDate: '2024-01-01',
  amount: 50000,
  notes: 'January 2024 budget'
});
```

#### `budgetsAPI.getAll(useCache?)`
Get all budgets (cached)
```typescript
const budgets = await budgetsAPI.getAll();
```

#### `budgetsAPI.getCurrent(useCache?)`
Get currently active budget (cached)
```typescript
const current = await budgetsAPI.getCurrent();
```

#### `budgetsAPI.update(id, data)`
Update a budget
```typescript
await budgetsAPI.update(1, {
  amount: 55000,
  notes: 'Increased budget'
});
```

#### `budgetsAPI.delete(id)`
Delete a budget
```typescript
await budgetsAPI.delete(1);
```

#### `budgetsAPI.exportCSV()`
Export budgets to CSV
```typescript
const csv = await budgetsAPI.exportCSV();
```

---

### Supplies API

#### `suppliesAPI.getAll(useCache?)`
Get all supplies (cached)
```typescript
const supplies = await suppliesAPI.getAll();
```

#### `suppliesAPI.refill(id, refillDate)`
Mark supply as refilled
```typescript
await suppliesAPI.refill(1, '2024-01-15');
```

#### `suppliesAPI.initialize()`
Initialize default supplies
```typescript
await suppliesAPI.initialize();
```

#### `suppliesAPI.bulkUpdate(updates)`
Update multiple supplies at once
```typescript
await suppliesAPI.bulkUpdate([
  { id: 1, quantity: 100 },
  { id: 2, quantity: 50 },
  { id: 3, quantity: 25 }
]);
```

#### `suppliesAPI.create(data)`
Create new supply item
```typescript
await suppliesAPI.create({
  name: 'Paper Bags',
  quantity: 1000,
  unit: 'pieces'
});
```

#### `suppliesAPI.delete(id)`
Delete supply item
```typescript
await suppliesAPI.delete(1);
```

---

### Dashboard API

#### `dashboardAPI.getWeekly(startDate?, useCache?)`
Get weekly summary (cached)
```typescript
// Current week
const weekly = await dashboardAPI.getWeekly();

// Specific week
const weekly = await dashboardAPI.getWeekly('2024-01-15');

// Force refresh
const weekly = await dashboardAPI.getWeekly(undefined, false);
```

#### `dashboardAPI.getStats(useCache?)`
Get dashboard statistics (cached)
```typescript
const stats = await dashboardAPI.getStats();
```

#### `dashboardAPI.getRecentActivity()`
Get recent activity
```typescript
const activity = await dashboardAPI.getRecentActivity();
```

#### `dashboardAPI.getAlerts(useCache?)`
Get budget alerts (cached)
```typescript
const alerts = await dashboardAPI.getAlerts();
```

---

### Health API

#### `healthAPI.check()`
Check if backend is running
```typescript
const health = await healthAPI.check();
// Returns: { status: 'healthy' | 'unhealthy', error?: string }
```

#### `healthAPI.dbTest()`
Test database connection
```typescript
const dbStatus = await healthAPI.dbTest();
```

---

### Utility Functions

#### `apiUtils.clearCache()`
Clear all cached data
```typescript
apiUtils.clearCache();
```

#### `apiUtils.clearCacheFor(resource)`
Clear cache for specific resource
```typescript
apiUtils.clearCacheFor('/orders');
apiUtils.clearCacheFor('/budgets');
```

#### `apiUtils.getConfig()`
Get current API configuration
```typescript
const config = apiUtils.getConfig();
// Returns: { timeout: 10000, retryAttempts: 3, retryDelay: 1000 }
```

#### `apiUtils.isAvailable()`
Check if API is available
```typescript
const isOnline = await apiUtils.isAvailable();
if (isOnline) {
  console.log('Backend is healthy');
}
```

#### `apiUtils.refreshAll()`
Clear all caches and force refresh
```typescript
apiUtils.refreshAll();
```

---

## Error Handling

### APIError Class
```typescript
class APIError extends Error {
  statusCode?: number;
  endpoint: string;
  details?: any;
}
```

### Example Error Handling
```typescript
try {
  const orders = await ordersAPI.getAll();
} catch (error) {
  if (error instanceof APIError) {
    console.error(`API Error at ${error.endpoint}:`, error.message);
    console.error('Status:', error.statusCode);
    console.error('Details:', error.details);
    
    // Handle specific errors
    if (error.statusCode === 404) {
      console.log('Resource not found');
    } else if (error.statusCode === 408) {
      console.log('Request timeout');
    } else if (error.statusCode === 500) {
      console.log('Server error');
    }
  }
}
```

---

## Caching Strategy

### How It Works
1. **Cache Hit**: Returns cached data (< 30 seconds old)
2. **Cache Miss**: Fetches from server and caches result
3. **Cache Invalidation**: Automatic on mutations (create, update, delete)

### Manual Cache Control
```typescript
// Clear everything
apiUtils.clearCache();

// Clear specific resources
apiUtils.clearCacheFor('/orders');

// Force fresh data
const orders = await ordersAPI.getAll(false);
```

### Cache Invalidation
Mutations automatically invalidate related caches:
- `ordersAPI.create()` → invalidates `/orders` and `/dashboard`
- `budgetsAPI.update()` → invalidates `/budgets` and `/dashboard`
- `suppliesAPI.refill()` → invalidates `/supplies`

---

## Retry Logic

### Retryable Errors
- Network errors (connection failed)
- 500-599 server errors (temporary issues)

### Non-Retryable Errors
- 400-499 client errors (bad request, not found, unauthorized)
- Timeout errors (after 10 seconds)

### Example Retry Flow
```
Attempt 1: Failed (500 error) → Wait 1 second
Attempt 2: Failed (network error) → Wait 2 seconds
Attempt 3: Failed → Throw error
```

---

## Best Practices

### 1. Use Caching for Read Operations
```typescript
// Good - uses cache
const orders = await ordersAPI.getAll();

// Use when you need fresh data
const orders = await ordersAPI.getAll(false);
```

### 2. Handle Errors Gracefully
```typescript
try {
  const orders = await ordersAPI.getAll();
} catch (error) {
  if (error instanceof APIError) {
    // Show user-friendly message
    toast.error(`Failed to load orders: ${error.message}`);
  }
}
```

### 3. Bulk Operations for Efficiency
```typescript
// Good - single request
await ordersAPI.bulkDelete([1, 2, 3, 4, 5]);

// Bad - multiple requests
for (const id of [1, 2, 3, 4, 5]) {
  await ordersAPI.delete(id);
}
```

### 4. Clear Cache After Manual Refreshes
```typescript
function handleRefresh() {
  apiUtils.clearCache();
  // Re-fetch data
  loadOrders();
}
```

### 5. Check API Health Before Critical Operations
```typescript
async function submitOrder() {
  const isOnline = await apiUtils.isAvailable();
  if (!isOnline) {
    toast.error('Backend is offline. Please try again later.');
    return;
  }
  
  // Proceed with order submission
  await ordersAPI.create(orderData);
}
```

---

## TypeScript Interfaces

### CreateOrderData
```typescript
interface CreateOrderData {
  date: string;
  pieces: number;
  chopCount: number;
  buoCount: number;
  pricePerKg: number;
  bags: BagWeight[];
}
```

### BagWeight
```typescript
interface BagWeight {
  weightKg: number;
  bagType: 'full_bag' | 'manual';
}
```

### Order
```typescript
interface Order {
  id: number;
  date: string;
  pieces: number;
  chopCount: number;
  buoCount: number;
  totalKg: number;
  createdAt: string;
}
```

### CreateBudgetData
```typescript
interface CreateBudgetData {
  startDate: string;
  amount: number;
  notes?: string;
}
```

---

## Migration Guide

### From Old API to New API

**Before:**
```typescript
// No cache control
const orders = await ordersAPI.getAll();

// No bulk operations
for (const id of orderIds) {
  await ordersAPI.delete(id);
}

// No error details
catch (error) {
  console.error(error);
}
```

**After:**
```typescript
// With cache control
const orders = await ordersAPI.getAll(true); // or false

// Bulk operations
await ordersAPI.bulkDelete(orderIds);

// Detailed errors
catch (error) {
  if (error instanceof APIError) {
    console.error(`${error.statusCode}: ${error.message}`);
  }
}
```

---

## Troubleshooting

### Issue: Stale Data
**Solution:** Clear cache or disable caching
```typescript
apiUtils.clearCache();
const freshOrders = await ordersAPI.getAll(false);
```

### Issue: Request Timeout
**Solution:** Check network connection and backend status
```typescript
const health = await healthAPI.check();
if (health.status === 'unhealthy') {
  console.log('Backend is down:', health.error);
}
```

### Issue: Too Many Retries
**Solution:** Check for 4xx errors (not retryable)
```typescript
catch (error) {
  if (error.statusCode >= 400 && error.statusCode < 500) {
    // Client error - fix request
    console.log('Bad request:', error.details);
  }
}
```

---

## Performance Tips

1. **Use caching** for frequently accessed data (orders, budgets, supplies)
2. **Disable caching** for real-time data (dashboard activity)
3. **Bulk operations** reduce network overhead
4. **Cache invalidation** keeps data fresh after mutations
5. **Health checks** prevent unnecessary API calls when backend is down

---

## Summary

✅ **Automatic retry** with exponential backoff  
✅ **10-second timeout** protection  
✅ **30-second cache** for faster loads  
✅ **Structured errors** for debugging  
✅ **Bulk operations** for efficiency  
✅ **TypeScript types** for safety  
✅ **Health checks** for reliability  

The API client is now production-ready and resilient! 🚀
