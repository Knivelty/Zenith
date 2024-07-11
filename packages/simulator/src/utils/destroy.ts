export async function cleanDB() {
  const db = globalThis.Simulator.db;

  await db.remove();
}
