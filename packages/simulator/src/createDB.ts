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
import { PlayerProfileSchema } from "./schema/player_profile";
import { PieceSpellAmpSchema } from "./schema/spell_amp";
import { calculatePieceSpellAmp } from "./schema/spell_amp/handler";
import { ActionOrderStackSchema } from "./schema/action_order_stack";

export type DB = Awaited<ReturnType<typeof createDB>>;

export async function createDB() {
  disableWarnings();
  addRxPlugin(RxDBDevModePlugin);
  addRxPlugin(RxDBUpdatePlugin);

  const db = await createRxDatabase<MyDatabase>({
    name: "db",
    storage: getRxStorageMemory(),
    multiInstance: false,
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
    piece_spell_amp: { schema: PieceSpellAmpSchema },
    effect: { schema: EffectSchema },
    player_profile: { schema: PlayerProfileSchema },
    action_order_stack: { schema: ActionOrderStackSchema },
  });

  //
  db.piece_attack.$.subscribe(calculatePieceAttack);

  db.piece_max_health.$.subscribe(calculateMaxHealth);

  db.piece_spell_amp.$.subscribe(calculatePieceSpellAmp);

  db.battle_entity.$.subscribe(healthFollowMaxHealth);

  db.effect.$.subscribe(handleEffectChange);

  return db;
}
