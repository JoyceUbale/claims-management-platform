import mongoose from 'mongoose';
import { seedMemory } from './memoryStore.js';
import { seedClaims } from './seedData.js';
import { Claim } from './models/Claim.js';

let memoryMode = false;

export function isMemoryMode() {
  return memoryMode;
}

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[db] MONGODB_URI not set — running in in-memory seed mode.');
    memoryMode = true;
    seedMemory();
    return;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
    memoryMode = false;
    console.log('[db] Connected to MongoDB.');
    await seedIfEmpty();
  } catch (err) {
    console.warn(`[db] MongoDB unreachable (${err.message}) — falling back to in-memory seed mode.`);
    memoryMode = true;
    seedMemory();
  }
}

async function seedIfEmpty() {
  const count = await Claim.countDocuments();
  if (count === 0) {
    await Claim.insertMany(seedClaims);
    console.log(`[db] Seeded ${seedClaims.length} sample claims.`);
  }
}
