import fs from 'fs';
import path from 'path';
import clientPromise from '@/lib/mongodb';

const DATA_FILE = path.join(process.cwd(), 'src/data/portfolio_db.json');

// Read JSON fallback file safely
export function getLocalData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Error reading local portfolio_db.json:', e);
  }
  return {};
}

// Write to JSON fallback file safely
export function saveLocalData(updater) {
  try {
    const current = getLocalData();
    const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    return updated;
  } catch (e) {
    console.error('Error saving local portfolio_db.json:', e);
    return null;
  }
}

// Get collection or property
export async function getCollectionData(collectionName, fallbackValue = []) {
  try {
    if (clientPromise) {
      const client = await clientPromise;
      const db = client.db('portfolio_db');
      if (collectionName === 'mainInfo') {
        const item = await db.collection(collectionName).findOne({});
        if (item) return item;
      } else {
        const items = await db.collection(collectionName).find({}).sort({ _id: -1 }).toArray();
        if (items && items.length > 0) return items;
      }
    }
  } catch (e) {
    // MongoDB offline/not configured, fallback to local storage
  }

  // Fallback to local JSON file
  const local = getLocalData();
  if (local[collectionName] !== undefined) {
    return local[collectionName];
  }
  return fallbackValue;
}

// Save collection or property
export async function saveCollectionData(collectionName, data) {
  // 1. Always save to local JSON file
  saveLocalData((prev) => ({
    ...prev,
    [collectionName]: data,
  }));

  // 2. Also save to MongoDB if connected
  try {
    if (clientPromise) {
      const client = await clientPromise;
      const db = client.db('portfolio_db');

      if (collectionName === 'mainInfo') {
        await db.collection(collectionName).updateOne({}, { $set: data }, { upsert: true });
      } else if (Array.isArray(data)) {
        await db.collection(collectionName).deleteMany({});
        if (data.length > 0) {
          await db.collection(collectionName).insertMany(data);
        }
      }
    }
  } catch (e) {
    console.warn(`MongoDB sync failed for ${collectionName}, saved to local JSON instead.`);
  }

  return { success: true };
}
