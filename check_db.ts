import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('TOTAL_USERS_COUNT:' + users.length);
    console.log('USER_NAMES:' + users.map(u => u.name).join(', '));
  } catch (error) {
    console.error('DATABASE_CHECK_ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
