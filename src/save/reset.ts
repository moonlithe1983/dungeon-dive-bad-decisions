import { getDatabaseAsync } from '@/src/save/db';

export async function resetAllSaveDataAsync() {
  const db = await getDatabaseAsync();

  await db.execAsync(`
    DELETE FROM run_history;
    DELETE FROM run_backup_slots;
    DELETE FROM active_run_slots;
    DELETE FROM profiles;
  `);
}
