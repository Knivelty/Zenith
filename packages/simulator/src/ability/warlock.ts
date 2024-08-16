import { AbilityFunction } from "./interface";

import { getBattlePiece } from "../utils/dbHelper";
import { AffectedGround } from "../misc/groundEffect";

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

export const warlock_interlockedInferno: AbilityFunction = async ({
  actionPieceId,
}) => {
  const db = globalThis.Simulator.db;

  const pieceInBattle = await getBattlePiece(actionPieceId);

  // find the enemy piece with the highest health
  const target = await db.battle_entity
    .findOne({
      selector: {
        isHome: !pieceInBattle.isHome,
      },
      sort: [{ health: "desc" }],
    })
    .exec();

  if (target) {
    const affectedGrounds = getAffectedGround(target.x, target.y);

    await globalThis.Simulator.eventSystem.emit("abilityCast", {
      abilityName: "interlockedInferno",
      data: { actionPieceId: actionPieceId },
      affectedGrounds: affectedGrounds,
    });

    await hitAndFission({ actionPieceId, x: target.x, y: target.y });
    await hitAndFission({ actionPieceId, x: target.x + 1, y: target.y });
    await hitAndFission({ actionPieceId, x: target.x - 1, y: target.y });
    await hitAndFission({ actionPieceId, x: target.x, y: target.y + 1 });
    await hitAndFission({ actionPieceId, x: target.x, y: target.y - 1 });
  }
};

async function hitAndFission({
  actionPieceId,
  x,
  y,
}: {
  actionPieceId: string;
  x: number;
  y: number;
}) {
  const db = globalThis.Simulator.db;

  const pieceInBattle = await getBattlePiece(actionPieceId);

  // deal 150+40%AP magical dmg to the target
  const centerTarget = await db.battle_entity
    .findOne({
      selector: {
        x,
        y,
        isHome: !pieceInBattle.isHome,
        dead: false,
      },
    })
    .exec();

  if (centerTarget) {
    await globalThis.Simulator.eventSystem.emit("damage", {
      sourcePieceId: actionPieceId,
      targetPieceId: centerTarget.entity,
      value:
        ConstPrimaryDmg[pieceInBattle.level] +
        Math.floor(pieceInBattle.spell_amp * 0.4),
      type: "Magical",
    });
  }

  // deal 50+15%AP magical dmg to enemies in 3x3 area around the target
  const affectedPiece = await db.battle_entity
    .find({
      selector: {
        x: { $gte: x - 1, $lte: x + 1 },
        y: { $gte: y - 1, $lte: y + 1 },
        isHome: !pieceInBattle.isHome,
        dead: false,
      },
    })
    .exec();

  await Promise.all(
    affectedPiece.map(async (p) => {
      await globalThis.Simulator.eventSystem.emit("damage", {
        sourcePieceId: actionPieceId,
        targetPieceId: p.entity,
        value:
          ConstSecondaryDmg[pieceInBattle.level] +
          Math.floor(pieceInBattle.spell_amp * 0.15),
        type: "Magical",
      });
    })
  );
}

function getAffectedGround(x: number, y: number) {
  const centerGround: AffectedGround = {
    x: x,
    y: y,
    groundEffect: "inferno_center",
  };

  const middleGrounds: AffectedGround[] = [
    { x: x - 1, y },
    { x: x + 1, y },
    { x: x, y: y - 1 },
    { x: x, y: y + 1 },
  ]
    .filter((v) => {
      return v.x >= 0 && v.x <= 7 && v.y >= 0 && v.y <= 7;
    })
    .map((v) => {
      return { ...v, groundEffect: "inferno_middle" };
    });

  const borderGrounds: AffectedGround[] = [
    { x: x - 1, y: y - 1 },
    { x: x - 1, y: y + 1 },
    { x: x + 1, y: y - 1 },
    { x: x + 1, y: y - 1 },
  ]
    .filter((v) => {
      return v.x >= 0 && v.x <= 7 && v.y >= 0 && v.y <= 7;
    })
    .map((v) => {
      return { ...v, groundEffect: "inferno_border" };
    });

  const edgeGrounds: AffectedGround[] = [];

  for (let i of [-2, 2]) {
    edgeGrounds.push({ x: x + i, y: y - 1, groundEffect: "inferno_edge" });
    edgeGrounds.push({ x: x + i, y: y, groundEffect: "inferno_edge" });
    edgeGrounds.push({ x: x + i, y: y + 1, groundEffect: "inferno_edge" });
  }

  for (let i of [-2, 2]) {
    edgeGrounds.push({ x: x - 1, y: y + i, groundEffect: "inferno_edge" });
    edgeGrounds.push({ x: x, y: y + i, groundEffect: "inferno_edge" });
    edgeGrounds.push({ x: x + 1, y: y + i, groundEffect: "inferno_edge" });
  }

  edgeGrounds.filter((v) => {
    v.x >= 0 && v.x <= 7 && v.y >= 0, v.y <= 7;
  });

  return [centerGround, ...middleGrounds, ...borderGrounds, ...edgeGrounds];
}
