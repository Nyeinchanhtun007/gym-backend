import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with Prisma Client...');
  const saltRounds = 10;
  const hashedDefaultPassword = await bcrypt.hash('password123', saltRounds);

  // 0. Create Membership Plans
  console.log('Creating Membership Plans...');
  const plans = [
    {
      name: 'Basic',
      description: 'Essential access for consistent fitness evolution.',
      monthlyPrice: 30,
      yearlyPrice: 300,
      dailyClassLimit: 1,
      monthlyClassLimit: 10,
      features: ['1 Class per day', '10 Classes per month', 'Locker room access', 'Basic nutritional guide', 'Community support'],
      isPopular: false,
    },
    {
      name: 'Standard',
      description: 'Multi-session access for high-intensity athletes.',
      monthlyPrice: 60,
      yearlyPrice: 600,
      dailyClassLimit: 2,
      monthlyClassLimit: 25,
      features: ['2 Classes per day', '25 Classes per month', 'Full locker room amenities', '4 Guest passes per month', 'Priority class reservation', '10% Discount on fuel bar'],
      isPopular: true,
    },
    {
      name: 'Premium',
      description: 'Unrestricted access for the elite performance seekers.',
      monthlyPrice: 100,
      yearlyPrice: 1000,
      dailyClassLimit: 5,
      monthlyClassLimit: 999,
      features: ['5 Classes per day', 'Unlimited classes per month', 'Premium recovery lounge', 'Daily laundry & private locker', 'Monthly bio-metric review', 'Priority global access'],
      isPopular: false,
    },
  ];

  for (const plan of plans) {
    await (prisma as any).membershipPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }

  // 1. Create Admin
  console.log('Creating Admin...');
  await prisma.user.upsert({
    where: { email: 'admin@gym.com' },
    update: {
      password: hashedDefaultPassword,
    },
    create: {
      email: 'admin@gym.com',
      password: hashedDefaultPassword,
      name: 'Admin User',
      role: Role.ADMIN,
    },
  });

  // 2. Create 10 Trainers
  console.log('Creating 10 Trainers...');
  const trainers = [];
  for (let i = 1; i <= 10; i++) {
    const email = `trainer${i}@gym.com`;
    const trainer = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedDefaultPassword,
      },
      create: {
        email,
        password: hashedDefaultPassword,
        name: `Trainer ${i}`,
        role: Role.TRAINER,
      },
    });
    trainers.push(trainer);
  }

  // 3. Create 100 Users
  console.log('Creating 100 Users...');
  for (let i = 1; i <= 100; i++) {
    const email = `user${i}@gym.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        password: hashedDefaultPassword,
      },
      create: {
        email,
        password: hashedDefaultPassword,
        name: `User ${i}`,
        role: Role.USER,
      },
    });

    // Create Membership if not exists
    const existingMembership = await prisma.membership.findFirst({
      where: { userId: user.id, status: 'ACTIVE' },
    });

    if (!existingMembership) {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await prisma.membership.create({
        data: {
          userId: user.id,
          startDate,
          endDate,
          planTier: 'Standard',
          billingCycle: 'Monthly',
          status: 'ACTIVE',
          price: 50,
          dailyClassLimit: 2,
          monthlyClassLimit: 20,
        },
      });
    }
  }

  // 4. Create 5 Classes
  console.log('Creating 5 Classes...');
  const classData = [
    { name: 'Morning Yoga', desc: 'Start your day with zen', capacity: 20 },
    { name: 'HIIT Blast', desc: 'High Intensity Interval Training', capacity: 15 },
    { name: 'Power Lifting', desc: 'Build serious strength', capacity: 10 },
    { name: 'Zumba Dance', desc: 'Dance your way to fitness', capacity: 25 },
    { name: 'Evening Meditation', desc: 'Relax and unwind', capacity: 30 },
  ];

  for (let i = 0; i < 5; i++) {
    const trainerIndex = i % trainers.length;
    const trainer = trainers[trainerIndex];
    const data = classData[i];
    const schedule = new Date();
    schedule.setDate(schedule.getDate() + 1 + i); // Staggered days

    await prisma.class.upsert({
      where: { id: i + 1 }, // Assuming IDs 1-5
      update: {
        name: data.name,
        description: data.desc,
        trainerId: trainer.id,
        schedule,
        capacity: data.capacity,
      },
      create: {
        id: i + 1,
        name: data.name,
        description: data.desc,
        trainerId: trainer.id,
        schedule,
        capacity: data.capacity,
      },
    });
    console.log(`Upserted class: ${data.name}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
