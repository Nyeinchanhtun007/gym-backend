const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  console.log('Starting simple seed...');

  // 1. Cleanup
  console.log('Cleaning existing data...');
  await prisma.booking.deleteMany();
  await prisma.class.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 2. Create Admin
  console.log('Creating Admin...');
  await prisma.user.create({
    data: {
      email: 'admin@ygngym.com',
      name: 'Head Coach',
      role: 'ADMIN',
      password: hashedPassword,
    },
  });

  // 3. Create Trainer
  console.log('Creating Trainer...');
  const trainer = await prisma.user.create({
    data: {
      email: 'trainer@ygngym.com',
      name: 'Master Viktor',
      role: 'TRAINER',
      password: hashedPassword,
    },
  });

  // 4. Create Members with different Tiers
  console.log('Creating Members...');
  const plans = [
    { tier: 'Basic', cycle: 'Monthly', price: 30, daily: 1, monthly: 10 },
    { tier: 'Standard', cycle: 'Monthly', price: 60, daily: 2, monthly: 25 },
    { tier: 'Premium', cycle: 'Monthly', price: 100, daily: 5, monthly: 999 },
  ];

  for (const plan of plans) {
    await prisma.user.create({
      data: {
        email: `${plan.tier.toLowerCase()}@test.com`,
        name: `${plan.tier} Member`,
        role: 'USER',
        password: hashedPassword,
        memberships: {
          create: {
            planTier: plan.tier,
            billingCycle: plan.cycle,
            status: 'ACTIVE',
            price: plan.price,
            dailyClassLimit: plan.daily,
            monthlyClassLimit: plan.monthly,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
    });
  }

  // 5. Create Classes
  console.log('Creating Classes...');
  const classNames = [
    'Yoga Zen',
    'Iron Pump',
    'Shadow Boxing',
    'Tactical HIIT',
  ];
  for (let i = 0; i < classNames.length; i++) {
    const schedule = new Date();
    schedule.setDate(schedule.getDate() + i);
    schedule.setHours(10 + i, 0, 0, 0);

    await prisma.class.create({
      data: {
        name: classNames[i],
        description: `Experience the power of ${classNames[i]} with our expert trainers.`,
        capacity: 20,
        schedule: schedule,
        trainerId: trainer.id,
      },
    });
  }

  console.log('Simple seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
