const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.update({
    where: { email: 'i.am.rahul4550@gmail.com' },
    data: { role: 'SUPER_ADMIN' },
  });
  console.log('Updated user:', user.email, 'role:', user.role);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 