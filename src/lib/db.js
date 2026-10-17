import fs from 'fs';
import path from 'path';
import clientPromise from '@/lib/mongodb';

const DATA_FILE = path.join(process.cwd(), 'src/data/portfolio_db.json');
const DB_NAME = process.env.MONGODB_DB_NAME || 'portfolio_db';

// Read JSON fallback file safely (development / offline only)
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

// Write to JSON fallback file safely (development only)
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
  const isProd = process.env.NODE_ENV === 'production';

  if (clientPromise) {
    try {
      const client = await clientPromise;
      const db = client.db(DB_NAME);

      if (collectionName === 'mainInfo') {
        const item = await db.collection(collectionName).findOne({});
        if (item) {
          const { _id, ...cleanItem } = item;
          return cleanItem;
        }
      } else {
        const items = await db.collection(collectionName).find({}).toArray();
        if (items && items.length > 0) {
          return items.map(({ _id, ...clean }) => clean);
        }
      }
    } catch (e) {
      console.error(`MongoDB error reading collection "${collectionName}":`, e);
      if (isProd) {
        throw new Error(`Database Error: Failed to query "${collectionName}" from MongoDB in production.`);
      }
    }
  } else if (isProd) {
    console.warn(`[db] MONGODB_URI not configured in production; falling back to local dataset for "${collectionName}".`);
  }

  // Development, build, or offline fallback to local JSON file
  const local = getLocalData();
  if (local[collectionName] !== undefined) {
    return local[collectionName];
  }
  return fallbackValue;
}

// Save collection or property
export async function saveCollectionData(collectionName, data) {
  const isProd = process.env.NODE_ENV === 'production';

  if (clientPromise) {
    try {
      const client = await clientPromise;
      const db = client.db(DB_NAME);

      if (collectionName === 'mainInfo') {
        await db.collection(collectionName).updateOne({}, { $set: data }, { upsert: true });
      } else if (Array.isArray(data)) {
        await db.collection(collectionName).deleteMany({});
        if (data.length > 0) {
          await db.collection(collectionName).insertMany(data);
        }
      }
    } catch (e) {
      console.error(`MongoDB error saving collection "${collectionName}":`, e);
      if (isProd) {
        throw new Error(`Database Error: Failed to persist "${collectionName}" to MongoDB in production.`);
      }
    }
  } else if (isProd) {
    throw new Error('Database Error: MONGODB_URI is required for persistent production database writes.');
  }

  // Keep local JSON in sync during non-production
  if (!isProd) {
    saveLocalData((prev) => ({
      ...prev,
      [collectionName]: data,
    }));
  }

  return { success: true };
}

// Retrieve administrative settings (passcode hash and admin email)
export async function getAdminSettings() {
  const isProd = process.env.NODE_ENV === 'production';

  if (clientPromise) {
    try {
      const client = await clientPromise;
      const db = client.db(DB_NAME);
      const settings = await db.collection('adminSettings').findOne({});
      if (settings) {
        const { _id, ...clean } = settings;
        return clean;
      }
    } catch (e) {
      console.error('MongoDB error reading adminSettings:', e);
      if (isProd) {
        throw new Error('Database Error: Failed to retrieve adminSettings from MongoDB in production.');
      }
    }
  } else if (isProd) {
    console.warn('[db] MONGODB_URI not configured in production; falling back to local admin settings.');
  }

  const local = getLocalData();
  return local.adminSettings || {};
}

// Persist administrative settings
export async function saveAdminSettings(settings) {
  const isProd = process.env.NODE_ENV === 'production';

  if (clientPromise) {
    try {
      const client = await clientPromise;
      const db = client.db(DB_NAME);
      await db.collection('adminSettings').updateOne({}, { $set: settings }, { upsert: true });
    } catch (e) {
      console.error('MongoDB error saving adminSettings:', e);
      if (isProd) {
        throw new Error('Database Error: Failed to save adminSettings to MongoDB in production.');
      }
    }
  } else if (isProd) {
    throw new Error('Database Error: MONGODB_URI is required to update adminSettings in production.');
  }

  if (!isProd) {
    saveLocalData((prev) => ({
      ...prev,
      adminSettings: {
        ...prev.adminSettings,
        ...settings
      }
    }));
  }

  return { success: true };
}
