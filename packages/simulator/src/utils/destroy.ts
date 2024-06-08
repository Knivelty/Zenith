import { DB } from "../createDB";

export async function destroyDB(db: DB) {
  await db.destroy();
}
