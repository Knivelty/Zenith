import { addRxPlugin, createRxDatabase } from "rxdb";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { getRxStorageMemory } from "rxdb/plugins/storage-memory";
import { disableWarnings } from "rxdb/plugins/dev-mode";
import { CreatureSchema } from "./schema/creature";
import { BattleEntitySchema } from "./schema/battle_entity";
import { DBCollections, MyDatabase } from "./schema/db";
import { RxDBUpdatePlugin } from "rxdb/plugins/update";
import { BaseStateSchema } from "./schema";
import { PieceAttackSchema } from "./schema/attack";
import { calculatePieceAttack } from "./schema/attack/handler";
import { PieceMaxHealthSchema } from "./schema/maxHealth";
import {
  calculateMaxHealth,
  healthFollowMaxHealth,
} from "./schema/maxHealth/handler";
import { EffectSchema } from "./schema/effect";
import { handleEffectChange } from "./schema/effect/handler";
import { AbilityProfileSchema } from "./schema/ability_profile";

export type DB = Awaited<ReturnType<typeof createDB>>;

export async function createDB() {
  disableWarnings();
  addRxPlugin(RxDBDevModePlugin);
  addRxPlugin(RxDBUpdatePlugin);

  const db = await createRxDatabase<MyDatabase>({
    name: "db",
    storage: getRxStorageMemory(),
  });

  await db.addCollections<DBCollections>({
    creature: {
      schema: CreatureSchema,
    },
    base_state: { schema: BaseStateSchema },
    ability_profile: { schema: AbilityProfileSchema },
    battle_entity: { schema: BattleEntitySchema },
    piece_attack: { schema: PieceAttackSchema },
    piece_max_health: { schema: PieceMaxHealthSchema },
    effect: { schema: EffectSchema },
  });

  //
  db.piece_attack.$.subscribe(calculatePieceAttack);

  db.piece_max_health.$.subscribe(calculateMaxHealth);

  db.battle_entity.$.subscribe(healthFollowMaxHealth);

  db.effect.$.subscribe(handleEffectChange);

  return db;
}
