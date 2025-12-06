const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addUserStatus() {
  try {
    console.log('Adding user status field...');
    
    // Add status field to User model
    await prisma.$executeRaw`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'ACTIVE';
    `;
    
    console.log('✅ User status field added successfully!');
    
    // Update all existing users to ACTIVE status
    await prisma.user.updateMany({
      where: {
        status: null
      },
      data: {
        status: 'ACTIVE'
      }
    });
    
    console.log('✅ All existing users set to ACTIVE status');
    
  } catch (error) {
    console.error('❌ Error adding user status:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addUserStatus();
