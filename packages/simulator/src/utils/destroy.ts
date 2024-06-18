export async function destroyDB() {
  const db = globalThis.Simulator.db;
  await db.destroy();
}
