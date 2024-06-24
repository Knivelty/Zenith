import { AbilityFunction } from "./interface";

import { getEffectName } from "../effect/interface";
import { getBattlePiece } from "../utils/dbHelper";

const ConstDmg: Record<number, number> = {
  1: 150,
  2: 225,
  3: 300,
};

const AtkFactor: Record<number, number> = {
  1: 1.2,
  2: 1.4,
  3: 1.8,
};

// TODO passive ability

export const jiangshi_penetrationInfection: AbilityFunction = async ({ actionPieceId }) => {
  const db = globalThis.Simulator.db;

  const pieceInBattle = await getBattlePiece(actionPieceId);

  // TODO detail the target selection, currently using the same as warlock
  // find the enemy piece with the highest health
  const target = await db.battle_entity.findOne({
    selector: {
      isHome: !pieceInBattle.isHome,
    },
    sort: [{ health: "desc" }],
  }).exec();

  if(target) {
    // deal ConstDmg+AtkFactor*ATK+80%AP physical dmg to the target
    // if the target is killed, summon a zombie with 100% of the target's stats and penetrationInfection ability
    await db.effect.insert({
      id: target.id,
      name: getEffectName("Revive"),
      stack: 1,
      duration: 1,
    });
    // TODO 75% armor penetration
    await globalThis.Simulator.eventSystem.emit("damage", {
      pieceId: actionPieceId,
      targetPieceId: target.id,
      value: Math.floor(ConstDmg[pieceInBattle.level] + pieceInBattle.attack * AtkFactor[pieceInBattle.level] + pieceInBattle.spell_amp * 0.8),
      type: "Physical",
    });
  } else {
    return;
  }
};
