import { decreaseHealth } from "../../../utils/dbHelper";

export function executeDamageOnEvent() {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.on("damage", async ({ pieceId, targetPieceId, type, value }) => {
    // const db = globalThis.Simulator.db;

    // TODO: deal with different attack type

    value = Math.floor(value);

    await eventSystem.emit("healthDecrease", {
      pieceId: targetPieceId,
      type,
      value,
    });

    decreaseHealth(targetPieceId, value);
  });
}
