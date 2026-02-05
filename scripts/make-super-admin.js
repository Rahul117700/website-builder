const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function makeSuperAdmin() {
    const email = process.argv[2];

    if (!email) {
        console.log('❌ Please provide an email address.');
        console.log('Usage: node scripts/make-super-admin.js user@example.com');
        process.exit(1);
    }

    try {
        console.log(`🔍 Searching for user with email: ${email}...`);

        // Find the user by email
        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            console.log(`❌ User not found with email: ${email}`);
            return;
        }

        // Update to Super Admin
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                role: 'SUPER_ADMIN',
                updatedAt: new Date()
            }
        });

        console.log('✅ Successfully made user Super Admin!');
        console.log('📊 User details:');
        console.log(`   Name: ${updatedUser.name}`);
        console.log(`   Email: ${updatedUser.email}`);
        console.log(`   Role: ${updatedUser.role}`);
        console.log('');
        console.log(`🎉 ${updatedUser.name} can now access the Super Admin dashboard.`);

    } catch (error) {
        console.error('❌ Error making user super admin:', error);
    } finally {
        await prisma.$disconnect();
    }
}

makeSuperAdmin();
