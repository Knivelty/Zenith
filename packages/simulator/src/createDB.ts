import { addRxPlugin, createRxDatabase } from "rxdb";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
import { getRxStorageMemory } from "rxdb/plugins/storage-memory";
import { disableWarnings } from "rxdb/plugins/dev-mode";
import { CreatureSchema } from "./schema/creature";
import { BattleEntitySchema } from "./schema/battle_entity";
import { MyDatabase } from "./schema/db";
import { InitEntitySchema } from "./schema/entity";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";

export type DB = Awaited<ReturnType<typeof createDB>>;

export async function createDB() {
  disableWarnings();
  addRxPlugin(RxDBDevModePlugin);
  addRxPlugin(RxDBQueryBuilderPlugin);
  addRxPlugin(RxDBUpdatePlugin);

  const db = await createRxDatabase<MyDatabase>({
    name: "db",
    storage: getRxStorageMemory(),
  });

  await db.addCollections({
    creature: {
      schema: CreatureSchema,
    },
    battle_entity: { schema: BattleEntitySchema },
    init_entity: { schema: InitEntitySchema },
  });
  return db;
}
