import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import { runMigrationsAsync } from '@/src/save/migrations';

const DATABASE_NAME = 'dungeon-dive-foundation.db';

let databasePromise: Promise<SQLiteDatabase> | null = null;

async function openDatabaseWithSetupAsync() {
  const db = await openDatabaseAsync(DATABASE_NAME);
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
  `);
  await runMigrationsAsync(db);
  return db;
}

export async function getDatabaseAsync() {
  if (!databasePromise) {
    databasePromise = openDatabaseWithSetupAsync();
  }

  return databasePromise;
}
