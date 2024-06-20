import { AbilityFunction } from "./interface";

import { getEffectName } from "../effect/interface";
import { getBattlePiece } from "../utils/dbHelper";
import { addEffectToPiece, overrideEffectToPiece } from "../effect/utils";

const MaxHealthFactor: Record<number, number> = {
  1: 0.65,
  2: 0.75,
  3: 1.25,
};

const AtkFactor: Record<number, number> = {
  1: 1,
  2: 1.5,
  3: 3,
};

export const mountainCollapse: AbilityFunction = async ({ actionPieceId }) => {
  const pieceInBattle = await getBattlePiece(actionPieceId);

  const shieldAmount = Math.floor(
    MaxHealthFactor[pieceInBattle.level] * pieceInBattle.maxHealth +
      AtkFactor[pieceInBattle.level] * pieceInBattle.attack
  );

  // add shield effect
  await addEffectToPiece({
    pieceId: actionPieceId,
    effectName: "Shield",
    stack: shieldAmount,
    duration: 999,
  });

  // add shield revenge effect
  await overrideEffectToPiece({
    pieceId: actionPieceId,
    effectName: "ShieldRevenge",
    stack: 1,
    duration: 999,
  });
};
