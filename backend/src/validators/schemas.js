// Validation Schemas with Zod
// These define what valid data looks like for API requests

import { z } from 'zod';

// ============================================
// BAG WEIGHT SCHEMA
// ============================================
export const bagWeightSchema = z.object({
  weightKg: z.number()
    .positive('Weight must be positive')
    .max(30, 'Single bag cannot exceed 30kg'),
  bagType: z.enum(['full_bag', 'manual'], {
    errorMap: () => ({ message: 'Bag type must be "full_bag" or "manual"' })
  })
});

// ============================================
// CREATE ORDER SCHEMA
// ============================================
export const createOrderSchema = z.object({
  date: z.string()
    .datetime({ message: 'Date must be in ISO format' })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format')),
  
  pieces: z.number()
    .int('Pieces must be a whole number')
    .positive('Pieces must be positive')
    .min(1, 'Must have at least 1 piece')
    .max(200, 'Cannot exceed 200 pieces in one order'),
  
  chopCount: z.number()
    .int('Chop count must be a whole number')
    .nonnegative('Chop count cannot be negative'),
  
  buoCount: z.number()
    .int('Buo count must be a whole number')
    .nonnegative('Buo count cannot be negative'),
  
  pricePerKg: z.number()
    .positive('Price must be positive')
    .min(50, 'Price seems too low (min ₱50/kg)')
    .max(500, 'Price seems too high (max ₱500/kg)'),
  
  bags: z.array(bagWeightSchema)
    .min(1, 'Must have at least 1 bag')
    .max(20, 'Cannot exceed 20 bags in one order')
}).refine(
  (data) => data.chopCount + data.buoCount === data.pieces,
  {
    message: 'Chop count + Buo count must equal total pieces',
    path: ['pieces']
  }
);

// ============================================
// CREATE BUDGET SCHEMA
// ============================================
export const createBudgetSchema = z.object({
  startDate: z.string()
    .datetime()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format')),
  
  amount: z.number()
    .positive('Budget amount must be positive')
    .min(1000, 'Budget seems too low (min ₱1,000)')
    .max(1000000, 'Budget exceeds limit (max ₱1,000,000)'),
  
  notes: z.string()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
});

// ============================================
// REFILL SUPPLY SCHEMA
// ============================================
export const refillSupplySchema = z.object({
  refillDate: z.string()
    .datetime()
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'))
});
