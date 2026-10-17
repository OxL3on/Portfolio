import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoClient } from 'mongodb';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to load .env.local if present
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.join(rootDir, file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      content.split(/\r?\n/).forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx !== -1) {
            const key = trimmed.substring(0, eqIdx).trim();
            let val = trimmed.substring(eqIdx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
    }
  }
}

loadEnv();

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'portfolio_db';
const DATA_FILE = path.join(rootDir, 'src/data/portfolio_db.json');

async function main() {
  console.log('====================================================');
  console.log('PORTFOLIO DATA MIGRATION: JSON -> MONGODB ATLAS');
  console.log('====================================================\n');

  if (!MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI environment variable is not defined.');
    console.error('Please configure MONGODB_URI in .env.local or your shell environment before migrating.\n');
    console.error('Example: MONGODB_URI="mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority"');
    process.exit(1);
  }

  if (!fs.existsSync(DATA_FILE)) {
    console.error(`❌ ERROR: Source data file not found at ${DATA_FILE}`);
    process.exit(1);
  }

  // Read and parse the local JSON file
  const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
  let data;
  try {
    data = JSON.parse(rawData);
  } catch (err) {
    console.error('❌ ERROR: Failed to parse src/data/portfolio_db.json as JSON:', err.message);
    process.exit(1);
  }

  console.log('\nConnecting to MongoDB Atlas...');
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);
    console.log(`✅ Connected successfully to database: "${MONGODB_DB_NAME}"\n`);

    // 3. Migrate adminSettings
    if (data.adminSettings && typeof data.adminSettings === 'object') {
      await db.collection('adminSettings').updateOne(
        {},
        { $set: data.adminSettings },
        { upsert: true }
      );
      console.log('  ✓ adminSettings: Migrated credentials and admin configuration.');
    }

    // 4. Migrate mainInfo
    if (data.mainInfo && typeof data.mainInfo === 'object') {
      await db.collection('mainInfo').updateOne(
        {},
        { $set: data.mainInfo },
        { upsert: true }
      );
      console.log('  ✓ mainInfo: Migrated profile, title, bio, and resume settings.');
    }

    // Helper for idempotent array collections
    async function migrateCollection(collectionName, uniqueField = 'id') {
      const items = data[collectionName];
      if (!Array.isArray(items)) {
        console.log(`  - ${collectionName}: No array records found, skipping.`);
        return;
      }

      let count = 0;
      for (const item of items) {
        if (!item) continue;
        const query = item[uniqueField]
          ? { [uniqueField]: item[uniqueField] }
          : item.title
          ? { title: item.title }
          : item.name
          ? { name: item.name }
          : item;

        await db.collection(collectionName).updateOne(
          query,
          { $set: item },
          { upsert: true }
        );
        count++;
      }
      console.log(`  ✓ ${collectionName}: Migrated ${count} record(s) idempotently.`);
    }

    // 5. Migrate collections
    await migrateCollection('projects', 'id');
    await migrateCollection('education', 'id');
    await migrateCollection('skills', 'id');
    await migrateCollection('certifications', 'id');
    await migrateCollection('achievements', 'id');
    await migrateCollection('journey', 'id');
    await migrateCollection('blogs', 'slug');
    await migrateCollection('contact', 'name');

    // 6. Ensure TTL & Performance Indexes
    console.log('\nConfiguring database indexes...');
    
    // Rate limits TTL index (auto-purge expired entries)
    await db.collection('rateLimits').createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0, background: true }
    );
    console.log('  ✓ rateLimits: Configured TTL index on "expiresAt".');

    // Revoked sessions TTL index (auto-purge expired session tokens)
    await db.collection('revokedSessions').createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0, background: true }
    );
    console.log('  ✓ revokedSessions: Configured TTL index on "expiresAt".');

    console.log('\n====================================================');
    console.log('MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('Your portfolio data is now safely stored in MongoDB Atlas.');
    console.log('====================================================\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();
