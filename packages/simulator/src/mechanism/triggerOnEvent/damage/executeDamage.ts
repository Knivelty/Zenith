import { overrideEffectToPiece } from "../../../effect/utils";
import {
  decreaseHealth,
  getBattlePiece,
  getPieceEffectProfile,
} from "../../../utils/dbHelper";

export function executeDamageOnEvent() {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.on(
    "damage",
    async ({ sourcePieceId, targetPieceId, type, value }) => {
      // const db = globalThis.Simulator.db;

      // calculate armor
      if (type === "Physical") {
        const targetPiece = await getBattlePiece(targetPieceId);
        value = value * (1 - targetPiece.armor / (100 + targetPiece.armor));
      }

      // calculate spell amp
      if (type === "Magical") {
        const piece = await getBattlePiece(sourcePieceId);
        value = value * (1 + piece.spell_amp / 100);
      }

      // decrease by shield
      const shield = await getPieceEffectProfile(targetPieceId, "Shield");

      if (shield?.stack) {
        if (type != "Life Drain" && type != "Pure") {
          // update shield
          await overrideEffectToPiece({
            pieceId: targetPieceId,
            effectName: "Shield",
            stack: Math.floor(Math.max(shield.stack - value, 0)),
            duration: 999,
          });

          value -= shield?.stack ?? 0;
        }
      }

      value = normalizeDamage(value);

      decreaseHealth(sourcePieceId, targetPieceId, type, value);
    },
  );
}

function normalizeDamage(value: number) {
  if (value < 0) {
    value = 0;
  }

  value = Math.floor(value);

  return value;
}
