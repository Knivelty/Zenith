import { BattleEntityType } from "../schema";

export async function applyEntityOverride(overrides?: {
  battleEntity?: Partial<BattleEntityType>[];
}) {
  if (!overrides) {
    return;
  }

  const db = globalThis.Simulator.db;

  for (const o of overrides.battleEntity || []) {
    const battleEntity = await db.battle_entity
      .findOne({
        selector: { entity: o.entity },
      })
      .exec();

    await db.battle_entity
      .findOne({ selector: { entity: o.entity } })
      .incrementalPatch(o);

    if (o.health) {
      await globalThis.Simulator.eventSystem.emit("healthDecrease", {
        pieceId: o.entity!,
        value: battleEntity?.maxHealth! - o.health,
      });
    }
  }
}
