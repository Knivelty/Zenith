import { logDebug } from "../debug";

export const spellStealPassive = async () => {
  const db = globalThis.Simulator.db;

  const basiliskPieces = await db.battle_entity
    .find({
      selector: {
        creature_idx: 2,
      },
    })
    .exec();

  if (!basiliskPieces.length) {
    return;
  }

  const actionPieceEntity = basiliskPieces[0].entity;

  const piecesWithAbility = await db.battle_entity
    .find({
      selector: { ability: { $ne: "" } },
    })
    .exec();

  if (piecesWithAbility.length === 0) {
    logDebug("not ability to steal");
    return;
  }

  // steal the first ability, and copy mana
  const p = piecesWithAbility[0];
  await db.battle_entity
    .find({ selector: { entity: actionPieceEntity } })
    .incrementalPatch({ ability: p.ability, maxMana: p.maxMana });
};
