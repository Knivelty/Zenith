import { overrideEffectToPiece } from "../../../effect/utils";
import { decreaseHealth, getPieceEffectProfile } from "../../../utils/dbHelper";

export function executeDamageOnEvent() {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.on("damage", async ({ pieceId, targetPieceId, type, value }) => {
    // const db = globalThis.Simulator.db;

    // TODO: deal with different attack type

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

    await eventSystem.emit("healthDecrease", {
      pieceId: targetPieceId,
      type,
      value,
    });

    decreaseHealth(targetPieceId, value);
  });
}

function normalizeDamage(value: number) {
  if (value < 0) {
    value = 0;
  }

  value = Math.floor(value);

  return value;
}
