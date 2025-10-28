// Prisma Client Instance
// Import this file whenever you need to talk to the database

import { PrismaClient } from '@prisma/client';

// Create single instance (singleton pattern)
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'], // Log SQL queries (helpful for learning!)
});

// Handle shutdown gracefully
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
