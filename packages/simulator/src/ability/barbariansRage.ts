import { AbilityFunction } from ".";

import { getEffectName } from "../effect";
import { getBattlePiece } from "../utils/dbHelper";

export const barbariansRage: AbilityFunction = async ({ actionPieceId }) => {
  const db = globalThis.Simulator.db;

  const pieceInBattle = await getBattlePiece(actionPieceId);

  // decrease current 25% HP
  await globalThis.Simulator.eventSystem.emit("damage", {
    pieceId: actionPieceId,
    targetPieceId: actionPieceId,
    value: Math.floor(pieceInBattle.health * 0.25),
    type: "Life Drain",
  });

  const existEffect = await db.effect
    .findOne({
      selector: {
        id: actionPieceId,
        name: getEffectName("Rage"),
      },
    })
    .exec();

  if (existEffect) {
    await existEffect.incrementalModify((doc) => {
      doc.stack += 1;
      return doc;
    });
  } else {
    await db.effect.insert({
      id: actionPieceId,
      name: getEffectName("Rage"),
      stack: 1,
      duration: 999,
    });
  }
};
