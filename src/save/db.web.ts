export async function getDatabaseAsync(): Promise<never> {
  throw new Error(
    'SQLite persistence is only available in native builds for this project.'
  );
}
