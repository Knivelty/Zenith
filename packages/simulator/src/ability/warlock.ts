import { AbilityFunction } from "./interface";

import { getEffectName } from "../effect/interface";
import { getBattlePiece } from "../utils/dbHelper";

const ConstPrimaryDmg: Record<number, number> = {
  1: 150,
  2: 225,
  3: 300,
};

const ConstSecondaryDmg: Record<number, number> = {
  1: 50,
  2: 75,
  3: 100,
};

export const warlock_interlockedInferno: AbilityFunction = async ({ actionPieceId }) => {
  const db = globalThis.Simulator.db;

  const pieceInBattle = await getBattlePiece(actionPieceId);

  // find the enemy piece with the highest health
  const target = await db.battle_entity.findOne({
    selector: {
      isHome: !pieceInBattle.isHome,
    },
    sort: [{ health: "desc" }],
  }).exec();

  if(target) {
    // deal 150+40%AP magical dmg to the target
    await globalThis.Simulator.eventSystem.emit("damage", {
      pieceId: actionPieceId,
      targetPieceId: target.id,
      value: ConstPrimaryDmg[pieceInBattle.level] + Math.floor(pieceInBattle.spell_amp * 0.4),
      type: "Magical",
    });

    // deal 50+15%AP magical dmg to enemies in 3x3 area around the target
    const affectedPiece = await db.battle_entity.find({
      selector: {
        x: { $gte: target.x - 1, $lte: target.x + 1 },
        y: { $gte: target.y - 1, $lte: target.y + 1 },
        isHome: !pieceInBattle.isHome,
      },
    }).exec();

    await Promise.all(affectedPiece.map(async (p) => {
      await globalThis.Simulator.eventSystem.emit("damage", {
        pieceId: actionPieceId,
        targetPieceId: p.id,
        value: ConstSecondaryDmg[pieceInBattle.level] + Math.floor(pieceInBattle.spell_amp * 0.15),
        type: "Magical",
      });
    }));
  } else {
    return;
  }
};
