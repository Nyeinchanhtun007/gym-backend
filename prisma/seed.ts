import 'dotenv/config';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

async function main() {
  console.log('Seeding database with raw SQL...');

  try {
    // 0. Ensure Schema Exists
    console.log('Ensuring schema exists...');
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'TRAINER');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" SERIAL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "name" TEXT,
        "role" "Role" NOT NULL DEFAULT 'USER',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Membership" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "startDate" TIMESTAMP(3) NOT NULL,
        "endDate" TIMESTAMP(3) NOT NULL,
        "type" TEXT NOT NULL,
        "status" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Class" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "trainerId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "schedule" TIMESTAMP(3) NOT NULL,
        "capacity" INTEGER NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Booking" (
        "id" SERIAL PRIMARY KEY,
        "userId" INTEGER NOT NULL REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "classId" INTEGER NOT NULL REFERENCES "Class"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 1. Create Admin
    console.log('Creating Admin...');
    await pool.query(`
      INSERT INTO "User" (email, password, name, role, "createdAt", "updatedAt")
      VALUES ($1, $2, $3, 'ADMIN'::"Role", NOW(), NOW())
      ON CONFLICT (email) DO NOTHING
    `, ['admin@gym.com', 'password123', 'Admin User']);

    // 2. Create 10 Trainers
    console.log('Creating 10 Trainers...');
    const trainers: any[] = [];
    for (let i = 1; i <= 10; i++) {
      const email = `trainer${i}@gym.com`;
      const res = await pool.query(`
        INSERT INTO "User" (email, password, name, role, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, 'TRAINER'::"Role", NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
        RETURNING id, name
      `, [email, 'password123', `Trainer ${i}`]);
      trainers.push(res.rows[0]);
    }

    // 3. Create 100 Users
    console.log('Creating 100 Users...');
    for (let i = 1; i <= 100; i++) {
      const email = `user${i}@gym.com`;
      const userRes = await pool.query(`
        INSERT INTO "User" (email, password, name, role, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, 'USER'::"Role", NOW(), NOW())
        ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
        RETURNING id
      `, [email, 'password123', `User ${i}`]);

      const userId = userRes.rows[0].id;

      // Create Membership
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      await pool.query(`
        INSERT INTO "Membership" ("userId", "startDate", "endDate", type, status, "createdAt", "updatedAt")
        VALUES ($1, $2, $3, 'MONTHLY', 'ACTIVE', NOW(), NOW())
      `, [userId, startDate, endDate]);
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

      // Check existence
      const check = await pool.query('SELECT id FROM "Class" WHERE name = $1', [data.name]);
      if (check.rows.length === 0) {
        await pool.query(`
          INSERT INTO "Class" (name, description, "trainerId", schedule, capacity, "createdAt", "updatedAt")
          VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
        `, [data.name, data.desc, trainer.id, schedule, data.capacity]);
        console.log(`Created class: ${data.name}`);
      } else {
        console.log(`Class ${data.name} already exists.`);
      }
    }

    console.log('Seeding finished.');

  } catch (e) {
    console.error('Error during seeding:', e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
