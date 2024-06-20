import { AbilityFunction } from "./interface";
import { addEffectToPiece } from "../effect/utils";
import { asyncMap } from "../utils/asyncHelper";
import { getBattlePiece } from "../utils/dbHelper";

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
  const frontCol = battlePiece.x;
  const sideCols = [battlePiece.x].filter((x) => x >= 1 && x <= 8);

  const frontColAttack =
    COL_ATTACK[battlePiece.level] + 0.75 * battlePiece.attack;
  const frontColBurnStack = Math.floor(
    COL_BURN[battlePiece.level] + 0.2 * battlePiece.spell_amp
  );

  await makeColAttack({
    actionPieceId,
    damage: frontColAttack,
    col: frontCol,
    startRow: battlePiece.y,
    isHome: battlePiece.isHome,
  });

  await makeColBurn({
    stack: frontColBurnStack,
    col: frontCol,
    startRow: battlePiece.y,
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
        y: isHome ? { $gt: startRow } : { $lt: startRow },
        isHome: !isHome,
      },
    })
    .exec();

  await asyncMap(affectedPiece, async (p) => {
    await globalThis.Simulator.eventSystem.emit("damage", {
      pieceId: actionPieceId,
      targetPieceId: p.id,
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
        y: isHome ? { $gt: startRow } : { $lt: startRow },
        isHome: !isHome,
      },
    })
    .exec();

  await asyncMap(affectedPiece, async (p) => {
    await addEffectToPiece({
      pieceId: p.id,
      effectName: "Burn",
      stack,
      duration: 999,
    });
  });
}
