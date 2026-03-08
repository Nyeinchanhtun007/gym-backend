import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('TOTAL_USERS_COUNT:' + users.length);
    const updated = await prisma.user.update({
      where: { email: 'user1@gmail.com' },
      data: { role: 'ADMIN' }
    });
    console.log('UPDATED_USER:' + JSON.stringify({ name: updated.name, role: updated.role }));
  } catch (error) {
    console.error('DATABASE_CHECK_ERROR:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
