import { decreaseHealth } from "../utils/dbHelper";

export function executeDamageOnEvent() {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.on("damage", async ({ pieceId, targetPieceId, type, value }) => {
    // const db = globalThis.Simulator.db;

    // TODO: deal with different attack type

    decreaseHealth(targetPieceId, value);
  });
}
