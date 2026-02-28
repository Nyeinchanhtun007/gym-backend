const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Total Users:', users.length);
  console.log(
    'Users:',
    JSON.stringify(
      users.map((u) => ({ id: u.id, email: u.email, role: u.role })),
      null,
      2,
    ),
  );

  const classes = await prisma.class.findMany();
  console.log('Total Classes:', classes.length);
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
