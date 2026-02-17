const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');

async function main() {
  console.log('Starting massive seed...');

  // 1. Cleanup
  console.log('Cleaning existing data...');
  await prisma.booking.deleteMany();
  await prisma.class.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 2. Create 20 Trainers
  console.log('Creating 20 Trainers...');
  const trainerDetails = [
    { name: 'Viktor', specialty: 'Heavyweight Boxing' },
    { name: 'Sarah', specialty: 'Tactical HIIT' },
    { name: 'Maya', specialty: 'Mobility & Yoga' },
    { name: 'John', specialty: 'Powerlifting' },
    { name: 'Elena', specialty: 'Calisthenics' },
    { name: 'Marcus', specialty: 'Crossfit Elite' },
    { name: 'Aria', specialty: 'Pilates Core' },
    { name: 'Leo', specialty: 'MMA Striking' },
    { name: 'Nova', specialty: 'Endurance Training' },
    { name: 'Kai', specialty: 'Rehab & Recovery' },
    { name: 'Axel', specialty: 'Olympic Lifting' },
    { name: 'Jade', specialty: 'Kettlebell Flow' },
    { name: 'Silas', specialty: 'Functional Strength' },
    { name: 'Rhea', specialty: 'Muay Thai' },
    { name: 'Orion', specialty: 'Breathwork Mastery' },
    { name: 'Lyra', specialty: 'Gymnastics Pro' },
    { name: 'Finn', specialty: 'Speed & Agility' },
    { name: 'Zara', specialty: 'Body Composition' },
    { name: 'Hugo', specialty: 'Nutrition Coaching' },
    { name: 'Cleo', specialty: 'Mindset Optimization' },
  ];

  const trainers = [];
  for (let i = 0; i < trainerDetails.length; i++) {
    const trainer = await prisma.user.create({
      data: {
        email: `assistant.trainer${i + 1}@ygngym.com`,
        name: `Master ${trainerDetails[i].name}`,
        role: 'TRAINER',
        password: hashedPassword,
      },
    });
    trainers.push({ ...trainer, specialty: trainerDetails[i].specialty });
  }

  // 3. Create 100 Members (Users with Memberships)
  console.log('Creating 100 Members...');
  const tiers = ['Initiate', 'Zenith', 'Titan'];
  for (let i = 0; i < 100; i++) {
    const user = await prisma.user.create({
      data: {
        email: `member${i + 1}@ygndemo.com`,
        name: `Member ${i + 1}`,
        role: 'USER',
        password: hashedPassword,
        memberships: {
          create: {
            type: tiers[i % 3],
            status: 'ACTIVE',
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        },
      },
    });
  }

  // 4. Create 50 Classes
  console.log('Creating 50 Classes...');
  const classNames = [
    'Shadow Boxing',
    'Iron Pump',
    'Zen Yoga',
    'Core Blast',
    'Combat HIIT',
    'Neural Focus',
    'Heavy Lift',
    'Agility Pro',
    'Mobility Flow',
    'Speed Drills',
  ];

  for (let i = 0; i < 50; i++) {
    const trainerIndex = i % trainers.length;
    const nameIndex = i % classNames.length;

    const schedule = new Date();
    schedule.setDate(schedule.getDate() + (i % 7));
    schedule.setHours(8 + (i % 12), 0, 0, 0);

    await prisma.class.create({
      data: {
        name: `${classNames[nameIndex]} ${Math.floor(i / 10) + 1}`,
        description: `High-performance training session focusing on ${classNames[nameIndex].toLowerCase()} techniques and elite conditioning.`,
        capacity: 10 + (i % 20),
        schedule: schedule,
        trainerId: trainers[trainerIndex].id,
      },
    });
  }

  console.log('Seeding complete!');
  console.log('Generated:');
  console.log(`- ${trainers.length} Trainers`);
  console.log('- 100 Members with active memberships');
  console.log('- 50 Classes distributed across the week');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
