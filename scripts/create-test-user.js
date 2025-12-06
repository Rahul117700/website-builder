const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('👤 Creating test user...');

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });

    if (existingUser) {
      console.log('✅ User already exists:', existingUser.email);
      return existingUser;
    }

    // Create new user
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'USER',
        emailVerified: new Date(),
        image: null
      }
    });

    console.log('✅ Test user created successfully:');
    console.log(`  - ID: ${user.id}`);
    console.log(`  - Name: ${user.name}`);
    console.log(`  - Email: ${user.email}`);
    console.log(`  - Role: ${user.role}`);

    return user;

  } catch (error) {
    console.error('❌ Failed to create test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();
