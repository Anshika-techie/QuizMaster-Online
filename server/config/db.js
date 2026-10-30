import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

let localServer = null;
const here = path.dirname(fileURLToPath(import.meta.url));

async function tryConnect(uri, timeoutMs) {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: timeoutMs });
}

// Order of attempts:
// 1. MONGO_URI from server/.env (Atlas or your own MongoDB)
// 2. A MongoDB already running on this computer (mongodb://127.0.0.1:27017)
// 3. A built-in local MongoDB (downloaded once, data kept in server/.data)
export default async function connectDB() {
  if (process.env.MONGO_URI) {
    try {
      await tryConnect(process.env.MONGO_URI, 5000);
      console.log('MongoDB connected (MONGO_URI)');
      return;
    } catch (err) {
      console.warn(`WARNING: MONGO_URI (${process.env.MONGO_URI.replace(/\/\/.*@/, '//***@')}) did not work: ${err.message}`);
      console.warn('Falling back to a local MongoDB. Remove MONGO_URI from server/.env or your system variables if you do not use it.');
      await mongoose.disconnect().catch(() => {});
    }
  }

  try {
    await tryConnect('mongodb://127.0.0.1:27017/quiz-master', 2000);
    console.log('MongoDB connected (local MongoDB on port 27017)');
    return;
  } catch {
    await mongoose.disconnect().catch(() => {});
  }

  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    const dbPath = path.join(here, '..', '.data');
    fs.mkdirSync(dbPath, { recursive: true });
    console.log('No MongoDB found, starting a built-in one. The first run downloads it once, please wait...');
    localServer = await MongoMemoryServer.create({ instance: { dbPath, storageEngine: 'wiredTiger' } });
    await tryConnect(localServer.getUri('quiz-master'), 15000);
    console.log('MongoDB connected (built-in)');
  } catch (err) {
    throw new Error(
      `Could not start the built-in MongoDB (${err.message}).\n` +
        '  Fix: either connect to the internet once so it can download, install MongoDB Community Server,\n' +
        '  or create a free Atlas cluster and put its link in server/.env as MONGO_URI=...'
    );
  }
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (localServer) await localServer.stop({ doCleanup: false });
}
