import 'dotenv/config';
import { connectDB, isMemoryMode } from './db.js';
import { Claim } from './models/Claim.js';
import { seedClaims } from './seedData.js';

async function run() {
  await connectDB();
  if (isMemoryMode()) {
    console.log('Running in memory mode — seeding not required (auto-seeded on boot).');
    return process.exit(0);
  }
  const existing = await Claim.countDocuments();
  if (existing > 0) {
    console.log(`Database already has ${existing} claims. Skipping seed.`);
    return process.exit(0);
  }
  await Claim.insertMany(seedClaims);
  console.log(`Seeded ${seedClaims.length} sample claims.`);
  return process.exit(0);
}

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
