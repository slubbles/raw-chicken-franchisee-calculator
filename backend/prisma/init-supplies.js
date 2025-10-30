// Initialize Supplies
// Run this once to set up sauce and seasoning tracking

import prisma from '../src/utils/prisma.js';

async function initializeSupplies() {
  try {
    console.log('🔄 Checking existing supplies...');
    
    const existingSupplies = await prisma.supply.count();
    
    if (existingSupplies > 0) {
      console.log('✅ Supplies already initialized');
      console.log(`   Found ${existingSupplies} supply record(s)`);
      process.exit(0);
    }
    
    console.log('📦 Creating supply records...');
    
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    await prisma.supply.createMany({
      data: [
        {
          type: 'sauce',
          lastRefill: today,
          costPerRefill: 1400,
          refillFrequency: 7,
          nextRefillDue: nextWeek,
          status: 'ok',
        },
        {
          type: 'seasoning',
          lastRefill: today,
          costPerRefill: 1400,
          refillFrequency: 7,
          nextRefillDue: nextWeek,
          status: 'ok',
        },
      ],
    });
    
    console.log('✅ Supplies initialized successfully!');
    console.log('   - Sauce: Next refill due in 7 days');
    console.log('   - Seasoning: Next refill due in 7 days');
    
  } catch (error) {
    console.error('❌ Error initializing supplies:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

initializeSupplies();
