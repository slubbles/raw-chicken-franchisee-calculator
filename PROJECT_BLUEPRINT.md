# Franchise Reorder Calculator - Complete Blueprint

**Project Name:** Franchise Reorder Calculator  
**Codename:** ChickOrder Pro  
**Purpose:** Real-time chicken order tracking + budget management + profit analytics  
**Developer:** slubbles  
**Started:** October 28, 2025  
**Environment:** GitHub Codespaces

---

## 📋 TABLE OF CONTENTS

1. [Project Overview](#project-overview)
2. [Business Context](#business-context)
3. [Technical Architecture](#technical-architecture)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [User Flows](#user-flows)
7. [Development Phases](#development-phases)
8. [Tech Stack Details](#tech-stack-details)
9. [Deployment Strategy](#deployment-strategy)
10. [Session Recovery Guide](#session-recovery-guide)

---

## 🎯 PROJECT OVERVIEW

### What We're Building

A full-stack web application to manage daily chicken deliveries for a fried chicken franchisee, including:

- **Daily Order Entry:** Record chicken weights, calculate costs automatically
- **Budget Tracking:** Monitor spending against allocated weekly/monthly budgets
- **Supply Management:** Track sauce & seasoning reorder schedules
- **Analytics Dashboard:** Weekly/monthly profit reports
- **Alert System:** Notifications when budget exceeds or supplies need reordering

### Why This Project

1. **Practical Use:** Solves real business problem (currently done manually)
2. **Learning Goal:** Master backend development through real-world application
3. **Portfolio Piece:** Full-stack app with deployment (not for resume, personal use)

---

## 💼 BUSINESS CONTEXT

### The Current Manual Process

**Daily Flow:**
1. Franchisee calls: "I need 40 pieces (25 Chop, 15 Buo)"
2. You go to storage, weigh chickens:
   - Bag 1 (15 pcs): 13.68 kg
   - Bag 2 (15 pcs): 13.78 kg
   - Manual (10 pcs): 8.9 kg
3. Calculate manually: 36.36 kg × ₱150/kg = ₱5,454
4. Check budget: ₱25,000 allocated, ₱12,300 spent → ₱12,700 remaining
5. Message franchisee: "Delivered. ₱5,454. Budget left: ₱7,246"
6. Track sauce/seasoning: Last refill Oct 20 → Due Oct 27

**Pain Points:**
- Manual calculations (prone to errors)
- No historical tracking
- Hard to see weekly/monthly trends
- Forget sauce/seasoning reorder dates
- Budget tracking on paper/notes

### Business Rules

#### Chicken Pricing
- **Price fluctuates** (₱150/kg today, might be ₱160 tomorrow)
- Must record price per order (historical accuracy)
- Two types: **Chop** (chopped parts) and **Buo** (whole chicken)
  - Same price per kg, distinction is for franchisee inventory

#### Budget Management
- **Manual reset** (not automatic weekly)
- New budget created when:
  - Previous budget fully spent
  - Previous budget exceeded (but continuing operations)
  - Manual decision to allocate more
- **Exceed handling:**
  - Show warning/notification
  - Allow to continue (mark as exceeded)
  - Track exceeded amount for repayment

#### Supplies (Sauce & Seasoning)
- **Weekly bulk reorder:** Every 7 days
- **Cost:** ₱1,400 per item × 2 = ₱2,800 total
- **Daily allocation:** ₱2,800 ÷ 7 = ₱400/day (for cost tracking)
- **Alert:** When due date approaches (2 days before)

---

## 🏗️ TECHNICAL ARCHITECTURE

### System Overview

```
┌─────────────────────────────────────────┐
│         USER (Phone/Laptop)             │
│       https://chickorder.app            │
└─────────────────────────────────────────┘
                    ↓ HTTPS
┌─────────────────────────────────────────┐
│   FRONTEND (React + shadcn/ui)          │
│   Deployed: Netlify                     │
│   - Order entry forms                   │
│   - Dashboard displays                  │
│   - Budget management UI                │
└─────────────────────────────────────────┘
                    ↓ REST API
┌─────────────────────────────────────────┐
│   BACKEND (Node.js + Express)           │
│   Deployed: Railway                     │
│   - API endpoints                       │
│   - Business logic                      │
│   - Data validation (Zod)              │
│   - Telegram notifications              │
└─────────────────────────────────────────┘
                    ↓ SQL (Prisma ORM)
┌─────────────────────────────────────────┐
│   DATABASE (PostgreSQL)                 │
│   Hosted: Supabase                      │
│   - Orders, budgets, costs, supplies    │
└─────────────────────────────────────────┘
```

### Why This Stack?

| Technology | Reason |
|------------|--------|
| **React** | Frontend framework (no Vite - using Create React App or Next.js) |
| **shadcn/ui** | Modern, accessible components (Tailwind-based) |
| **Node.js + Express** | Simple, powerful backend (same language as frontend) |
| **PostgreSQL** | Reliable relational DB (perfect for structured data) |
| **Prisma** | Type-safe ORM (easier than raw SQL) |
| **Zod** | Runtime validation (clean data inputs) |
| **Railway** | Backend deployment (free tier, auto-deploy) |
| **Netlify** | Frontend deployment (free tier, auto-deploy) |
| **Supabase** | Managed PostgreSQL (free tier, nice UI) |

---

## 🗄️ DATABASE SCHEMA

### Table 1: `budgets`
Tracks budget allocations (manually created)

```sql
CREATE TABLE budgets (
  id SERIAL PRIMARY KEY,
  start_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'active',  -- 'active', 'completed', 'exceeded'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Example Data:**
```
id | start_date | amount   | status  | notes
---|------------|----------|---------|------------------
1  | 2025-10-21 | 25000.00 | active  | Weekly allocation
2  | 2025-10-14 | 25000.00 | completed | Fully spent
```

---

### Table 2: `orders`
Daily chicken deliveries

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  budget_id INTEGER REFERENCES budgets(id),
  date DATE NOT NULL,
  pieces INTEGER NOT NULL,
  chop_count INTEGER NOT NULL,
  buo_count INTEGER NOT NULL,
  total_kg DECIMAL(10,2),  -- Calculated from bag_weights
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Example Data:**
```
id | budget_id | date       | pieces | chop | buo | total_kg
---|-----------|------------|--------|------|-----|----------
47 | 1         | 2025-10-28 | 40     | 25   | 15  | 36.36
```

---

### Table 3: `bag_weights`
Individual bag measurements (one order has multiple bags)

```sql
CREATE TABLE bag_weights (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  weight_kg DECIMAL(10,2) NOT NULL,
  bag_type VARCHAR(20),  -- 'full_bag' (15 pcs) or 'manual' (loose)
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Example Data:**
```
id | order_id | weight_kg | bag_type
---|----------|-----------|----------
1  | 47       | 13.68     | full_bag
2  | 47       | 13.78     | full_bag
3  | 47       | 8.90      | manual
```

---

### Table 4: `costs`
Calculated costs per order (stores historical pricing)

```sql
CREATE TABLE costs (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
  price_per_kg DECIMAL(10,2) NOT NULL,  -- Historical price
  chicken_cost DECIMAL(10,2) NOT NULL,  -- total_kg × price_per_kg
  sauce_daily DECIMAL(10,2) DEFAULT 200.00,
  seasoning_daily DECIMAL(10,2) DEFAULT 200.00,
  total_cost DECIMAL(10,2) NOT NULL,
  budget_before DECIMAL(10,2),
  budget_after DECIMAL(10,2),
  exceeded BOOLEAN DEFAULT FALSE,
  exceeded_by DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Example Data:**
```
id | order_id | price_per_kg | chicken_cost | total_cost | exceeded
---|----------|--------------|--------------|------------|----------
47 | 47       | 150.00       | 5454.00      | 5854.00    | false
```

---

### Table 5: `supplies`
Sauce & Seasoning reorder tracking

```sql
CREATE TABLE supplies (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL,  -- 'sauce' or 'seasoning'
  last_refill DATE NOT NULL,
  cost_per_refill DECIMAL(10,2) DEFAULT 1400.00,
  refill_frequency INTEGER DEFAULT 7,  -- days
  next_refill_due DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'ok',  -- 'ok', 'due_soon', 'overdue'
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Example Data:**
```
id | type      | last_refill | cost  | next_due   | status
---|-----------|-------------|-------|------------|--------
1  | sauce     | 2025-10-20  | 1400  | 2025-10-27 | overdue
2  | seasoning | 2025-10-20  | 1400  | 2025-10-27 | overdue
```

---

### Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Budget {
  id         Int      @id @default(autoincrement())
  startDate  DateTime @map("start_date") @db.Date
  amount     Decimal  @db.Decimal(10, 2)
  status     String   @default("active") @db.VarChar(20)
  notes      String?  @db.Text
  createdAt  DateTime @default(now()) @map("created_at")
  
  orders     Order[]
  
  @@map("budgets")
}

model Order {
  id         Int      @id @default(autoincrement())
  budgetId   Int      @map("budget_id")
  date       DateTime @db.Date
  pieces     Int
  chopCount  Int      @map("chop_count")
  buoCount   Int      @map("buo_count")
  totalKg    Decimal? @map("total_kg") @db.Decimal(10, 2)
  createdAt  DateTime @default(now()) @map("created_at")
  
  budget     Budget      @relation(fields: [budgetId], references: [id])
  bags       BagWeight[]
  cost       Cost?
  
  @@map("orders")
}

model BagWeight {
  id        Int      @id @default(autoincrement())
  orderId   Int      @map("order_id")
  weightKg  Decimal  @map("weight_kg") @db.Decimal(10, 2)
  bagType   String?  @map("bag_type") @db.VarChar(20)
  createdAt DateTime @default(now()) @map("created_at")
  
  order     Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  @@map("bag_weights")
}

model Cost {
  id              Int      @id @default(autoincrement())
  orderId         Int      @unique @map("order_id")
  pricePerKg      Decimal  @map("price_per_kg") @db.Decimal(10, 2)
  chickenCost     Decimal  @map("chicken_cost") @db.Decimal(10, 2)
  sauceDaily      Decimal  @default(200.00) @map("sauce_daily") @db.Decimal(10, 2)
  seasoningDaily  Decimal  @default(200.00) @map("seasoning_daily") @db.Decimal(10, 2)
  totalCost       Decimal  @map("total_cost") @db.Decimal(10, 2)
  budgetBefore    Decimal? @map("budget_before") @db.Decimal(10, 2)
  budgetAfter     Decimal? @map("budget_after") @db.Decimal(10, 2)
  exceeded        Boolean  @default(false)
  exceededBy      Decimal  @default(0) @map("exceeded_by") @db.Decimal(10, 2)
  createdAt       DateTime @default(now()) @map("created_at")
  
  order           Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  @@map("costs")
}

model Supply {
  id              Int      @id @default(autoincrement())
  type            String   @db.VarChar(20)
  lastRefill      DateTime @map("last_refill") @db.Date
  costPerRefill   Decimal  @default(1400.00) @map("cost_per_refill") @db.Decimal(10, 2)
  refillFrequency Int      @default(7) @map("refill_frequency")
  nextRefillDue   DateTime @map("next_refill_due") @db.Date
  status          String   @default("ok") @db.VarChar(20)
  updatedAt       DateTime @updatedAt @map("updated_at")
  
  @@map("supplies")
}
```

---

## 🔌 API ENDPOINTS

### Orders API

#### `POST /api/orders`
Create new chicken delivery order

**Request Body:**
```json
{
  "date": "2025-10-28",
  "pieces": 40,
  "chopCount": 25,
  "buoCount": 15,
  "pricePerKg": 150,
  "bags": [
    { "weightKg": 13.68, "bagType": "full_bag" },
    { "weightKg": 13.78, "bagType": "full_bag" },
    { "weightKg": 8.9, "bagType": "manual" }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": 47,
    "date": "2025-10-28",
    "totalKg": 36.36,
    "cost": {
      "chickenCost": 5454.00,
      "sauceDaily": 200.00,
      "seasoningDaily": 200.00,
      "totalCost": 5854.00
    }
  },
  "budget": {
    "allocated": 25000.00,
    "spent": 17754.00,
    "remaining": 7246.00,
    "percentage": 71,
    "status": "ok"
  }
}
```

**If Budget Exceeded:**
```json
{
  "success": false,
  "status": "exceeded",
  "exceededBy": 350.00,
  "message": "Order costs ₱5,900 but only ₱5,550 remaining",
  "options": ["save_anyway", "adjust_budget", "cancel"]
}
```

#### `GET /api/orders`
List all orders (with pagination)

**Query Params:**
- `page` (default: 1)
- `limit` (default: 20)
- `startDate` (optional)
- `endDate` (optional)
- `budgetId` (optional)

**Response:**
```json
{
  "orders": [
    {
      "id": 47,
      "date": "2025-10-28",
      "pieces": 40,
      "totalKg": 36.36,
      "cost": 5854.00,
      "exceeded": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156,
    "pages": 8
  }
}
```

#### `GET /api/orders/:id`
Get single order details

**Response:**
```json
{
  "id": 47,
  "date": "2025-10-28",
  "pieces": 40,
  "chopCount": 25,
  "buoCount": 15,
  "totalKg": 36.36,
  "bags": [
    { "weightKg": 13.68, "bagType": "full_bag" },
    { "weightKg": 13.78, "bagType": "full_bag" },
    { "weightKg": 8.9, "bagType": "manual" }
  ],
  "cost": {
    "pricePerKg": 150.00,
    "chickenCost": 5454.00,
    "totalCost": 5854.00
  },
  "budget": {
    "id": 1,
    "startDate": "2025-10-21",
    "amount": 25000.00
  }
}
```

---

### Budgets API

#### `POST /api/budgets`
Create new budget allocation

**Request Body:**
```json
{
  "startDate": "2025-10-28",
  "amount": 25000,
  "notes": "Weekly allocation for Nov 1"
}
```

**Response:**
```json
{
  "success": true,
  "budget": {
    "id": 2,
    "startDate": "2025-10-28",
    "amount": 25000.00,
    "status": "active"
  },
  "previousBudget": {
    "id": 1,
    "status": "completed",
    "totalSpent": 23500.00
  }
}
```

#### `GET /api/budgets`
List all budgets

**Response:**
```json
{
  "budgets": [
    {
      "id": 1,
      "startDate": "2025-10-21",
      "amount": 25000.00,
      "status": "active",
      "spent": 17754.00,
      "remaining": 7246.00,
      "orderCount": 6
    }
  ]
}
```

#### `GET /api/budgets/:id`
Get budget details with all orders

**Response:**
```json
{
  "id": 1,
  "startDate": "2025-10-21",
  "amount": 25000.00,
  "status": "active",
  "spent": 17754.00,
  "remaining": 7246.00,
  "orders": [
    {
      "id": 42,
      "date": "2025-10-21",
      "cost": 4200.00
    },
    {
      "id": 43,
      "date": "2025-10-22",
      "cost": 3850.00
    }
  ]
}
```

---

### Supplies API

#### `GET /api/supplies`
Get sauce & seasoning status

**Response:**
```json
{
  "supplies": [
    {
      "id": 1,
      "type": "sauce",
      "lastRefill": "2025-10-20",
      "nextRefillDue": "2025-10-27",
      "daysUntilDue": -1,
      "status": "overdue",
      "message": "Reorder NOW! 1 day overdue"
    },
    {
      "id": 2,
      "type": "seasoning",
      "lastRefill": "2025-10-20",
      "nextRefillDue": "2025-10-27",
      "daysUntilDue": -1,
      "status": "overdue",
      "message": "Reorder NOW! 1 day overdue"
    }
  ]
}
```

#### `PUT /api/supplies/:id/refill`
Mark supply as refilled

**Request Body:**
```json
{
  "refillDate": "2025-10-28"
}
```

**Response:**
```json
{
  "success": true,
  "supply": {
    "id": 1,
    "type": "sauce",
    "lastRefill": "2025-10-28",
    "nextRefillDue": "2025-11-04",
    "status": "ok"
  }
}
```

---

### Dashboard API

#### `GET /api/dashboard/weekly`
Get weekly summary

**Query Params:**
- `startDate` (optional, defaults to current week)

**Response:**
```json
{
  "week": {
    "start": "2025-10-21",
    "end": "2025-10-27"
  },
  "budget": {
    "allocated": 25000.00,
    "spent": 17754.00,
    "remaining": 7246.00,
    "percentage": 71
  },
  "orders": {
    "count": 6,
    "totalKg": 215.4,
    "totalCost": 17754.00
  },
  "dailyBreakdown": [
    { "date": "2025-10-21", "cost": 4200.00, "kg": 28.0 },
    { "date": "2025-10-22", "cost": 3850.00, "kg": 25.7 },
    { "date": "2025-10-23", "cost": 5100.00, "kg": 34.0 }
  ],
  "alerts": [
    {
      "type": "budget",
      "severity": "warning",
      "message": "71% of budget spent"
    },
    {
      "type": "supplies",
      "severity": "critical",
      "message": "Sauce overdue by 1 day"
    }
  ]
}
```

---

## 🎨 USER FLOWS

### Flow 1: Daily Order Entry

```
┌─────────────────────────────────┐
│  1. User opens app              │
│     "Add New Order"             │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  2. Fill Order Form             │
│     - Date: Oct 28              │
│     - Pieces: 40                │
│     - Chop: 25, Buo: 15         │
│     - Price: ₱150/kg            │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  3. Add Bag Weights             │
│     Bag 1: 13.68 kg             │
│     Bag 2: 13.78 kg             │
│     Manual: 8.9 kg              │
│     [+ Add Bag]                 │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  4. Auto-Calculation            │
│     Total: 36.36 kg             │
│     Cost: ₱5,454                │
│     Budget left: ₱7,246         │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  5. Click "Save Order"          │
│     → POST /api/orders          │
└─────────────────────────────────┘
              ↓
    ┌─────────────────────┐
    │  Budget OK?         │
    └─────────────────────┘
         ↙          ↘
    YES              NO
     ↓                ↓
┌────────┐      ┌────────────┐
│Success │      │Exceed Alert│
│Message │      │Show options│
└────────┘      └────────────┘
     ↓                ↓
┌─────────────────────────────────┐
│  6. Redirect to Dashboard       │
│     Show updated budget         │
└─────────────────────────────────┘
```

---

### Flow 2: Budget Exceeded Handling

```
┌─────────────────────────────────┐
│  Order costs ₱5,900             │
│  Budget left: ₱5,550            │
│  → EXCEEDED by ₱350             │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  Alert Modal                    │
│  ⚠️ Budget Alert                │
│                                  │
│  Order: ₱5,900                  │
│  Remaining: ₱5,550              │
│  EXCEEDED: ₱350                 │
│                                  │
│  Options:                       │
│  ○ Save anyway (mark exceeded)  │
│  ○ Adjust budget (+₱350)        │
│  ○ Cancel order                 │
│                                  │
│  [Confirm] [Cancel]             │
└─────────────────────────────────┘
              ↓
    User chooses option
              ↓
    ┌─────────────────────┐
    │  Save Anyway?       │
    └─────────────────────┘
         ↙          ↘
    YES              NO (Adjust)
     ↓                ↓
┌────────────┐   ┌──────────────┐
│Save order  │   │Update budget │
│Mark exceed │   │Save order    │
│Send notif  │   │Mark adjusted │
└────────────┘   └──────────────┘
```

---

### Flow 3: Weekly Dashboard View

```
┌─────────────────────────────────┐
│  User clicks "Dashboard"        │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  GET /api/dashboard/weekly      │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  Display:                       │
│  ┌──────────────────────────┐   │
│  │ Budget Overview          │   │
│  │ ₱17,754 / ₱25,000 (71%) │   │
│  │ [████████░░] 71%         │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │ Daily Breakdown          │   │
│  │ Mon ₱4,200               │   │
│  │ Tue ₱3,850               │   │
│  │ Wed ₱5,100               │   │
│  │ Thu ₱6,300               │   │
│  │ Fri ₱5,900 ⚠️ Exceeded   │   │
│  │ Sat ₱5,454               │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │ Supply Alerts            │   │
│  │ ⚠️ Sauce overdue (1 day) │   │
│  │ ⚠️ Seasoning overdue     │   │
│  │ [Mark as Refilled]       │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

---

### Flow 4: Supply Refill Tracking

```
┌─────────────────────────────────┐
│  Dashboard shows:               │
│  "Sauce overdue by 1 day"       │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  User buys sauce (₱1,400)       │
│  Clicks "Mark as Refilled"      │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  Confirm Modal                  │
│  "Mark sauce as refilled?"      │
│  Date: [Oct 28] (auto)          │
│  [Confirm]                      │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  PUT /api/supplies/1/refill     │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  Update Database:               │
│  last_refill = Oct 28           │
│  next_refill_due = Nov 4        │
│  status = 'ok'                  │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│  Success Message:               │
│  "Sauce refilled. Next due:     │
│   Nov 4, 2025"                  │
└─────────────────────────────────┘
```

---

## 📅 DEVELOPMENT PHASES

### Phase 1: Backend Foundation (Week 1)
**Goal:** Core API + Database working

**Tasks:**
- [ ] Initialize Node.js project
- [ ] Setup Express server
- [ ] Connect Supabase PostgreSQL
- [ ] Setup Prisma ORM
- [ ] Create database schema
- [ ] Implement Zod validation schemas
- [ ] Create endpoints:
  - `POST /api/orders` (simplified - no budget check)
  - `GET /api/orders`
  - `GET /api/orders/:id`
- [ ] Test with Postman/Thunder Client

**Deliverable:** Working API that can save/retrieve orders

---

### Phase 2: Budget Tracking (Week 2)
**Goal:** Budget management system

**Tasks:**
- [ ] Create budget endpoints:
  - `POST /api/budgets`
  - `GET /api/budgets`
  - `GET /api/budgets/:id`
- [ ] Implement budget calculation logic
- [ ] Add exceed detection
- [ ] Update `POST /api/orders` to check budget
- [ ] Test budget scenarios (normal, exceeded)

**Deliverable:** Orders respect budget constraints

---

### Phase 3: Supplies & Dashboard (Week 3)
**Goal:** Complete backend functionality

**Tasks:**
- [ ] Create supplies endpoints:
  - `GET /api/supplies`
  - `PUT /api/supplies/:id/refill`
- [ ] Implement date calculations (days until due)
- [ ] Create dashboard endpoint:
  - `GET /api/dashboard/weekly`
- [ ] Add Telegram notification integration
- [ ] Test full workflow

**Deliverable:** Full backend ready for frontend

---

### Phase 4: Frontend (Week 4)
**Goal:** User interface with shadcn/ui

**Tasks:**
- [ ] Setup React project (Create React App or Next.js)
- [ ] Install shadcn/ui components
- [ ] Create pages:
  - Dashboard (home)
  - New Order form
  - Budget management
  - Order history
- [ ] Implement API client (fetch/axios)
- [ ] Connect frontend to backend API
- [ ] Add responsive design (mobile-friendly)

**Deliverable:** Working web app (local)

---

### Phase 5: Deployment (Week 5)
**Goal:** Live production app

**Tasks:**
- [ ] Deploy backend to Railway
- [ ] Configure environment variables
- [ ] Deploy frontend to Netlify
- [ ] Setup custom domain (optional)
- [ ] Test production environment
- [ ] Add error tracking (Sentry - optional)

**Deliverable:** Live app at `chickorder.app`

---

### Phase 6: Real Usage & Iteration (Ongoing)
**Goal:** Use daily, find bugs, improve

**Tasks:**
- [ ] Use for daily orders (1 week trial)
- [ ] Fix bugs discovered
- [ ] Add missing features
- [ ] Optimize performance
- [ ] Add export to Excel (future)
- [ ] Add monthly reports (future)

---

## 🛠️ TECH STACK DETAILS

### Backend Stack

```javascript
// package.json (backend)
{
  "name": "franchisee-calculator-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "@prisma/client": "^5.7.0",
    "zod": "^3.22.4",
    "node-telegram-bot-api": "^0.64.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "prisma": "^5.7.0"
  }
}
```

### Frontend Stack

```javascript
// package.json (frontend)
{
  "name": "franchisee-calculator-frontend",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "next": "^14.0.4",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.2.0",
    "tailwindcss": "^3.4.0",
    "date-fns": "^3.0.6",
    "recharts": "^2.10.3"
  }
}
```

### Project Structure

```
/raw-chicken-franchisee-calculator
│
├── backend/
│   ├── src/
│   │   ├── index.js              # Express server entry
│   │   ├── routes/
│   │   │   ├── orders.js         # Order routes
│   │   │   ├── budgets.js        # Budget routes
│   │   │   ├── supplies.js       # Supply routes
│   │   │   └── dashboard.js      # Dashboard routes
│   │   ├── controllers/
│   │   │   ├── orderController.js
│   │   │   ├── budgetController.js
│   │   │   ├── supplyController.js
│   │   │   └── dashboardController.js
│   │   ├── services/
│   │   │   ├── calculationService.js  # Business logic
│   │   │   └── notificationService.js # Telegram
│   │   ├── validators/
│   │   │   └── schemas.js        # Zod schemas
│   │   └── utils/
│   │       ├── prisma.js         # Prisma client
│   │       └── errors.js         # Error handlers
│   ├── prisma/
│   │   └── schema.prisma         # Database schema
│   ├── package.json
│   ├── .env
│   └── README.md
│
├── frontend/
│   ├── app/                      # Next.js 14 app directory
│   │   ├── layout.jsx
│   │   ├── page.jsx              # Dashboard
│   │   ├── orders/
│   │   │   ├── page.jsx          # Order list
│   │   │   └── new/
│   │   │       └── page.jsx      # New order form
│   │   └── budgets/
│   │       └── page.jsx          # Budget management
│   ├── components/
│   │   ├── ui/                   # shadcn components
│   │   │   ├── button.jsx
│   │   │   ├── dialog.jsx
│   │   │   ├── input.jsx
│   │   │   └── ...
│   │   ├── OrderForm.jsx
│   │   ├── BudgetCard.jsx
│   │   ├── SupplyAlert.jsx
│   │   └── WeeklyChart.jsx
│   ├── lib/
│   │   ├── api.js                # API client
│   │   └── utils.js              # Helper functions
│   ├── styles/
│   │   └── globals.css
│   ├── package.json
│   ├── .env.local
│   └── next.config.js
│
├── .gitignore
├── PROJECT_BLUEPRINT.md          # This file
└── README.md                     # Project overview
```

---

## 🚀 DEPLOYMENT STRATEGY

### Railway (Backend)

**Setup Steps:**
1. Create Railway account
2. New project → Deploy from GitHub
3. Select `backend/` directory
4. Add environment variables:
   ```
   DATABASE_URL=postgresql://...
   PORT=3000
   NODE_ENV=production
   TELEGRAM_BOT_TOKEN=...
   ```
5. Deploy command: `npm start`
6. Railway auto-generates URL: `https://chickorder.up.railway.app`

**Auto-Deploy:**
- Push to `main` branch → Railway rebuilds automatically

---

### Netlify (Frontend)

**Setup Steps:**
1. Create Netlify account
2. New site → Import from GitHub
3. Build settings:
   - Base directory: `frontend/`
   - Build command: `npm run build`
   - Publish directory: `.next/`
4. Environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://chickorder.up.railway.app/api
   ```
5. Deploy

**Auto-Deploy:**
- Push to `main` branch → Netlify rebuilds automatically

---

### Supabase (Database)

**Setup Steps:**
1. Create Supabase account
2. New project → Choose region (Singapore)
3. Copy database URL from settings
4. Paste into backend `.env`:
   ```
   DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres
   ```
5. Run migrations from local:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

---

### Environment Variables Summary

#### Backend `.env`
```env
# Database
DATABASE_URL=postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres

# Server
PORT=3000
NODE_ENV=development

# Telegram (optional)
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=your_chat_id_here

# CORS
FRONTEND_URL=http://localhost:3000  # Dev
# FRONTEND_URL=https://chickorder.netlify.app  # Production
```

#### Frontend `.env.local`
```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api  # Dev
# NEXT_PUBLIC_API_URL=https://chickorder.up.railway.app/api  # Production
```

---

## 🔄 SESSION RECOVERY GUIDE

**If this Codespaces session is lost, here's how to resume:**

### 1. Check Current State

```bash
# Navigate to project
cd /workspaces/raw-chicken-franchisee-calculator

# Check what exists
ls -la

# Check git status
git status

# Check last commit
git log --oneline -5
```

### 2. Determine Phase

Read this file (`PROJECT_BLUEPRINT.md`) to see:
- Which phase we were on
- What was completed (check git commits)
- What's next

### 3. Resume Development

**If backend doesn't exist yet:**
```bash
# Create backend directory
mkdir backend
cd backend

# Initialize Node.js
npm init -y

# Install dependencies
npm install express cors dotenv @prisma/client zod
npm install -D nodemon prisma

# Continue from Phase 1 tasks
```

**If backend exists:**
```bash
cd backend

# Install dependencies (in case of fresh container)
npm install

# Start dev server
npm run dev
```

**If frontend doesn't exist yet:**
```bash
# Create frontend with Next.js
npx create-next-app@latest frontend
cd frontend

# Install shadcn
npx shadcn-ui@latest init

# Continue from Phase 4 tasks
```

### 4. Check Database Connection

```bash
cd backend

# Test Prisma connection
npx prisma studio

# If fails, check .env file exists and has correct DATABASE_URL
```

### 5. Resume from Last Task

Check git commits to see last completed task:
```bash
git log --oneline --all

# Example output:
# abc123 Added order creation endpoint
# def456 Setup Prisma schema
# ghi789 Initial backend setup
```

Then continue from next uncompleted task in the relevant phase.

---

## 📝 IMPORTANT NOTES

### Code Environment
- **Platform:** GitHub Codespaces (cloud-based VS Code)
- **OS:** Ubuntu
- **Shell:** bash
- **Node.js:** v18+ (check with `node -v`)

### Database Access
- Use **Prisma Studio** to view data: `npx prisma studio`
- Supabase has web UI: `supabase.com` → Your project → Table Editor

### Testing
- Backend: Use Thunder Client (VS Code extension) or Postman
- Frontend: Browser at `localhost:3000`

### Git Workflow
```bash
# After completing a task
git add .
git commit -m "Descriptive message of what was done"
git push origin main

# This triggers auto-deploy (if Railway/Netlify connected)
```

### Common Commands

**Backend:**
```bash
cd backend
npm run dev          # Start dev server (nodemon)
npm start            # Start production server
npx prisma studio    # Open database UI
npx prisma migrate dev --name migration_name  # Create migration
npx prisma generate  # Generate Prisma client
```

**Frontend:**
```bash
cd frontend
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm start            # Start production server
npx shadcn-ui@latest add button  # Add shadcn component
```

---

## 🎯 SUCCESS METRICS

### Technical Goals
- [ ] All 5 database tables created
- [ ] 10+ API endpoints working
- [ ] Frontend connects to backend successfully
- [ ] Deployed and accessible online
- [ ] Mobile-responsive design

### Business Goals
- [ ] Can enter order in < 2 minutes
- [ ] Auto-calculates costs correctly
- [ ] Budget tracking prevents overspending
- [ ] Sauce/seasoning reminders work
- [ ] Weekly reports show accurate data

### Learning Goals
- [ ] Understand REST API design
- [ ] Can write SQL queries (via Prisma)
- [ ] Know how backend validates data (Zod)
- [ ] Understand frontend ↔ backend communication
- [ ] Deployed full-stack app to production

---

## 📚 RESOURCES

### Documentation
- [Express.js](https://expressjs.com/)
- [Prisma](https://www.prisma.io/docs)
- [Zod](https://zod.dev/)
- [Next.js](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Railway Docs](https://docs.railway.app/)
- [Netlify Docs](https://docs.netlify.com/)

### Tutorials (if stuck)
- Prisma + PostgreSQL setup
- Express REST API basics
- Next.js data fetching
- shadcn/ui components

---

## 🔐 SECURITY NOTES

### Do NOT Commit to Git:
- `.env` files (add to `.gitignore`)
- Database passwords
- API keys
- Telegram bot tokens

### Safe to Commit:
- `.env.example` (template without real values)
- All source code
- `schema.prisma`
- `package.json`

### `.gitignore` (root)
```
# Environment
.env
.env.local
.env.production

# Dependencies
node_modules/
backend/node_modules/
frontend/node_modules/

# Build output
backend/dist/
frontend/.next/
frontend/out/

# Prisma
backend/prisma/migrations/**/migration.sql

# Logs
*.log

# OS
.DS_Store
```

---

## 🏁 FINAL CHECKLIST

Before considering project "complete":

### Backend
- [ ] All endpoints return correct data
- [ ] Validation catches invalid inputs
- [ ] Error handling works (500, 404, 400)
- [ ] Database constraints prevent bad data
- [ ] Budget exceed logic correct
- [ ] Supply alerts calculate correctly
- [ ] Deployed to Railway
- [ ] Environment variables set

### Frontend
- [ ] All pages render correctly
- [ ] Forms validate user input
- [ ] API calls handle errors gracefully
- [ ] Mobile responsive (test on phone)
- [ ] Loading states show (spinners)
- [ ] Success/error messages display
- [ ] Deployed to Netlify
- [ ] Connected to production API

### Integration
- [ ] Frontend can create orders
- [ ] Orders appear in dashboard
- [ ] Budget updates in real-time
- [ ] Supply alerts show on dashboard
- [ ] Can create new budgets
- [ ] Can mark supplies as refilled

### Real World Test
- [ ] Use for 1 week of real orders
- [ ] Calculations match manual calculations
- [ ] No crashes or errors
- [ ] Usable on phone
- [ ] Faster than manual process

---

**Last Updated:** October 28, 2025  
**Status:** Planning Complete, Ready to Start Phase 1  
**Next Action:** Initialize backend project

---

**Remember:** This is a learning project. If something breaks, it's an opportunity to debug and understand deeper. Take notes of challenges faced and solutions found!
