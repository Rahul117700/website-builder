const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const email = 'i.am.rahul4550@gmail.com';
  
  console.log(`🔧 Making user ${email} a super admin...`);

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email }
    });

    if (!existingUser) {
      console.log(`❌ User with email ${email} not found!`);
      console.log('Please make sure the user exists in the database first.');
      return;
    }

    // Update user to super admin
    const updatedUser = await prisma.user.update({
      where: { email: email },
      data: { role: 'SUPER_ADMIN' }
    });

    console.log(`✅ Successfully made ${email} a super admin!`);
    console.log(`User ID: ${updatedUser.id}`);
    console.log(`Name: ${updatedUser.name || 'Not set'}`);
    console.log(`Role: ${updatedUser.role}`);
    console.log(`Created: ${updatedUser.createdAt}`);

  } catch (error) {
    console.error('❌ Error updating user:', error);
  }
}

main()
  .catch((e) => {
    console.error('❌ Script error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 