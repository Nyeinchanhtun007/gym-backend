import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = process.argv[2] || 'admin@gym.com';
  const password = process.argv[3] || 'password123';
  const name = process.argv[4] || 'Admin User';

  console.log(`Creating admin with email: ${email}`);

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        role: Role.ADMIN,
        password: hashedPassword,
        name,
      },
      create: {
        email,
        password: hashedPassword,
        name,
        role: Role.ADMIN,
      },
    });

    console.log('✅ Admin user created/updated successfully:');
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Role: ${user.role}`);
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
