import type { SQLiteDatabase } from 'expo-sqlite';

import { createTimestamp } from '@/src/utils/time';

export const LATEST_SCHEMA_VERSION = 8;

async function getUserVersionAsync(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version;'
  );

  return Number(row?.user_version ?? 0);
}

export async function runMigrationsAsync(db: SQLiteDatabase) {
  const currentVersion = await getUserVersionAsync(db);

  if (currentVersion < 1) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS app_meta (
        key TEXT PRIMARY KEY NOT NULL,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY NOT NULL,
        payload TEXT NOT NULL,
        schema_version INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS active_run_slots (
        slot TEXT PRIMARY KEY NOT NULL,
        run_id TEXT NOT NULL,
        hero_class_id TEXT NOT NULL,
        active_companion_id TEXT NOT NULL,
        floor_index INTEGER NOT NULL,
        run_status TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS run_backup_slots (
        slot TEXT PRIMARY KEY NOT NULL,
        run_id TEXT NOT NULL,
        hero_class_id TEXT NOT NULL,
        active_companion_id TEXT NOT NULL,
        floor_index INTEGER NOT NULL,
        run_status TEXT NOT NULL,
        payload TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      PRAGMA user_version = 1;
    `);
  }

  if (currentVersion < 2) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS run_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        run_id TEXT NOT NULL,
        result TEXT NOT NULL,
        class_id TEXT NOT NULL,
        class_name TEXT NOT NULL,
        floor_reached INTEGER NOT NULL,
        updated_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      );

      PRAGMA user_version = 2;
    `);
  }

  if (currentVersion < 3) {
    await db.execAsync(`
      PRAGMA user_version = 3;
    `);
  }

  if (currentVersion < 4) {
    await db.execAsync(`
      ALTER TABLE run_history
      ADD COLUMN summary_payload TEXT;

      PRAGMA user_version = 4;
    `);
  }

  if (currentVersion < 5) {
    await db.execAsync(`
      PRAGMA user_version = 5;
    `);
  }

  if (currentVersion < 6) {
    await db.execAsync(`
      PRAGMA user_version = 6;
    `);
  }

  if (currentVersion < 7) {
    await db.execAsync(`
      PRAGMA user_version = 7;
    `);
  }

  if (currentVersion < 8) {
    await db.execAsync(`
      PRAGMA user_version = 8;
    `);
  }

  await db.runAsync(
    `
      INSERT INTO app_meta (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at;
    `,
    ['schema_version', String(LATEST_SCHEMA_VERSION), createTimestamp()]
  );
}
