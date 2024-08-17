import { AbilityFunction } from "./interface";
import { addEffectToPiece } from "../effect/utils";
import { asyncMap } from "../utils/asyncHelper";
import { getBattlePiece } from "../utils/dbHelper";
import { AffectedGround } from "../misc/groundEffect";
import { findTargetPiece } from "../mechanism/enemySearch";
import { logDebug } from "../debug";

const COL_ATTACK: Record<number, number> = {
  1: 160,
  2: 280,
  3: 500,
};

const COL_BURN: Record<number, number> = {
  1: 120,
  2: 180,
  3: 240,
};

const SIDE_COL_ATTACK: Record<number, number> = {
  1: 80,
  2: 160,
  3: 240,
};

const SIDE_COL_BURN: Record<number, number> = {
  1: 40,
  2: 60,
  3: 100,
};

export const burningBurst: AbilityFunction = async ({ actionPieceId }) => {
  const battlePiece = await getBattlePiece(actionPieceId);

  // find target piece
  const targetPieceId = await findTargetPiece(actionPieceId);

  if (!targetPieceId) {
    logDebug("burningBurst", "no target piece");
    return;
  }

  const targetPiece = await getBattlePiece(targetPieceId);

  const frontCol = targetPiece.x;
  const sideCols = [targetPiece.x - 1, targetPiece.x + 1].filter(
    (x) => x >= 0 && x <= 7
  );

  await globalThis.Simulator.eventSystem.emit("abilityCast", {
    abilityName: "burningBurst",
    data: { actionPieceId },
    affectedGrounds: getAffectedGrounds({
      isHome: battlePiece.isHome,
      y: targetPiece.y,
      sideCols,
      frontCol,
    }),
  });

  const frontColAttack =
    COL_ATTACK[battlePiece.level] + 0.75 * battlePiece.attack;
  const frontColBurnStack = Math.floor(
    COL_BURN[battlePiece.level] + 0.2 * battlePiece.spell_amp
  );

  await makeColAttack({
    actionPieceId,
    damage: frontColAttack,
    col: frontCol,
    startRow: targetPiece.y,
    isHome: battlePiece.isHome,
  });

  await makeColBurn({
    stack: frontColBurnStack,
    col: frontCol,
    startRow: targetPiece.y,
    isHome: battlePiece.isHome,
  });

  const sideColAttack =
    SIDE_COL_ATTACK[battlePiece.level] + 0.35 * battlePiece.attack;
  const sideColBurnStack = Math.floor(
    SIDE_COL_BURN[battlePiece.level] + 0.1 * battlePiece.spell_amp
  );

  await asyncMap(sideCols, async (col) => {
    await makeColAttack({
      actionPieceId,
      damage: sideColAttack,
      col: col,
      startRow: battlePiece.y,
      isHome: battlePiece.isHome,
    });

    await makeColBurn({
      stack: sideColBurnStack,
      col: col,
      startRow: battlePiece.y,
      isHome: battlePiece.isHome,
    });
  });
};

async function makeColAttack({
  actionPieceId,
  damage,
  col,
  startRow,
  isHome,
}: {
  actionPieceId: string;
  damage: number;
  col: number;
  startRow: number;
  isHome: boolean;
}) {
  const db = globalThis.Simulator.db;

  // find affected piece
  const affectedPiece = await db.battle_entity
    .find({
      selector: {
        x: col,
        y: isHome ? { $lte: startRow } : { $gte: startRow },
        isHome: !isHome,
        dead: false,
      },
    })
    .exec();

  await asyncMap(affectedPiece, async (p) => {
    await globalThis.Simulator.eventSystem.emit("damage", {
      sourcePieceId: actionPieceId,
      targetPieceId: p.entity,
      value: damage,
      type: "Magical",
    });
  });
}

async function makeColBurn({
  stack,
  col,
  startRow,
  isHome,
}: {
  stack: number;
  col: number;
  startRow: number;
  isHome: boolean;
}) {
  const db = globalThis.Simulator.db;

  // find affected piece
  const affectedPiece = await db.battle_entity
    .find({
      selector: {
        x: col,
        y: isHome ? { $lte: startRow } : { $gte: startRow },
        isHome: !isHome,
        dead: false,
      },
    })
    .exec();

  await asyncMap(affectedPiece, async (p) => {
    await addEffectToPiece({
      pieceId: p.entity,
      effectName: "Burn",
      stack,
      duration: 999,
    });
  });
}

function getAffectedGrounds({
  isHome,
  y,
  frontCol,
  sideCols,
}: {
  isHome: boolean;
  y: number;
  frontCol: number;
  sideCols: number[];
}) {
  let affectedGround: AffectedGround[] = [];
  if (isHome) {
    for (let i = 0; i <= y; i++) {
      affectedGround.push({ x: frontCol, y: i, groundEffect: "fire" });

      sideCols.map((col) => {
        affectedGround.push({ x: col, y: i, groundEffect: "slightFire" });
      });
    }
  } else {
    for (let i = 7; i >= y; i--) {
      affectedGround.push({ x: frontCol, y: i, groundEffect: "fire" });
      sideCols.map((col) => {
        affectedGround.push({ x: col, y: i, groundEffect: "slightFire" });
      });
    }
  }

  logDebug("burningBurst", "affectedGround", affectedGround);

  return affectedGround;
}
