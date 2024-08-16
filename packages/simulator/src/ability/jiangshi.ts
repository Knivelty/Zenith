import { AbilityFunction } from "./interface";
import { getBattlePiece } from "../utils/dbHelper";
import { asyncMap } from "../utils/asyncHelper";
import { logDebug } from "../debug";
import { addEffectToPiece } from "../effect/utils";
import { findTargetPiece } from "../mechanism/enemySearch";

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

export const jiangshi_penetrationInfection_passive = async () => {
  const db = globalThis.Simulator.db;

  const jiangshiPieces = await db.battle_entity
    .find({
      selector: {
        creature_idx: 3005,
      },
    })
    .exec();

  // add initiative bonus to all hunter piece
  await asyncMap(jiangshiPieces, async (p) => {
    await p.update({
      $inc: {
        maxHealth: p.armor * 5,
        attack: p.armor,
      },
    });
    logDebug(
      `add ${p.armor} * 5 HP and ${p.armor} attack to piece ${p.entity}`
    );
  });
};

export const jiangshi_penetrationInfection: AbilityFunction = async ({
  actionPieceId,
}) => {
  const db = globalThis.Simulator.db;

  const pieceInBattle = await getBattlePiece(actionPieceId);

  // find the enemy piece
  const targetPieceId = await findTargetPiece(actionPieceId);
  if (!targetPieceId) {
    // no target piece means all enemy's piece are dead the same as battle end
    return;
  }
  const target = await db.battle_entity
    .findOne({
      selector: {
        entity: targetPieceId,
      },
    })
    .exec();

  if (target) {
    await globalThis.Simulator.eventSystem.emit("abilityCast", {
      abilityName: "penetrationInfection",
      data: { actionPieceId: actionPieceId },
      affectedGrounds: [],
    });

    // deal ConstDmg+AtkFactor*ATK+80%AP physical dmg to the target
    // if the target is killed, summon a zombie with 100% of the target's stats and penetrationInfection ability
    addEffectToPiece({
      pieceId: target.entity,
      effectName: "Revive",
      stack: 1,
      duration: 1,
    });
    // TODO 75% armor penetration
    await globalThis.Simulator.eventSystem.emit("damage", {
      sourcePieceId: actionPieceId,
      targetPieceId: target.entity,
      value: Math.floor(
        ConstDmg[pieceInBattle.level] +
          pieceInBattle.attack * AtkFactor[pieceInBattle.level] +
          pieceInBattle.spell_amp * 0.8
      ),
      type: "Physical",
    });
  } else {
    return;
  }
};
