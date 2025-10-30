// Seed Script
// Run this to add initial test data to the database

import prisma from '../src/utils/prisma.js';

async function seed() {
  try {
    console.log('🌱 Seeding database...');
    
    // Create initial budget
    const budget = await prisma.budget.create({
      data: {
        startDate: new Date('2025-10-28'),
        amount: 25000.00,
        status: 'active',
        notes: 'Initial weekly budget for testing'
      }
    });
    
    console.log('✅ Created budget:', budget);
    
    // Create initial supplies
    const sauce = await prisma.supply.create({
      data: {
        type: 'sauce',
        lastRefill: new Date('2025-10-20'),
        costPerRefill: 1400.00,
        refillFrequency: 7,
        nextRefillDue: new Date('2025-10-27'),
        status: 'overdue'
      }
    });
    
    const seasoning = await prisma.supply.create({
      data: {
        type: 'seasoning',
        lastRefill: new Date('2025-10-20'),
        costPerRefill: 1400.00,
        refillFrequency: 7,
        nextRefillDue: new Date('2025-10-27'),
        status: 'overdue'
      }
    });
    
    console.log('✅ Created supplies:', { sauce, seasoning });
    
    console.log('');
    console.log('🎉 Seeding completed!');
    console.log('You can now create orders.');
    
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
