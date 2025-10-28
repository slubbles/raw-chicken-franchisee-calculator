-- CreateTable
CREATE TABLE "budgets" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "start_date" DATETIME NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "orders" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "budget_id" INTEGER NOT NULL,
    "date" DATETIME NOT NULL,
    "pieces" INTEGER NOT NULL,
    "chop_count" INTEGER NOT NULL,
    "buo_count" INTEGER NOT NULL,
    "total_kg" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "orders_budget_id_fkey" FOREIGN KEY ("budget_id") REFERENCES "budgets" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bag_weights" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order_id" INTEGER NOT NULL,
    "weight_kg" REAL NOT NULL,
    "bag_type" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "bag_weights_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "costs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order_id" INTEGER NOT NULL,
    "price_per_kg" REAL NOT NULL,
    "chicken_cost" REAL NOT NULL,
    "sauce_daily" REAL NOT NULL DEFAULT 200.00,
    "seasoning_daily" REAL NOT NULL DEFAULT 200.00,
    "total_cost" REAL NOT NULL,
    "budget_before" REAL,
    "budget_after" REAL,
    "exceeded" BOOLEAN NOT NULL DEFAULT false,
    "exceeded_by" REAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "costs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "supplies" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "type" TEXT NOT NULL,
    "last_refill" DATETIME NOT NULL,
    "cost_per_refill" REAL NOT NULL DEFAULT 1400.00,
    "refill_frequency" INTEGER NOT NULL DEFAULT 7,
    "next_refill_due" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ok',
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "costs_order_id_key" ON "costs"("order_id");
