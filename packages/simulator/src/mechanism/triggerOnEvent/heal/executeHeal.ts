import { increaseHealth } from "../../../utils/dbHelper";

export function executeHealOnEvent() {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.on(
    "heal",
    async ({ sourcePieceId, targetPieceId, type, value }) => {
      await increaseHealth(sourcePieceId, targetPieceId, type, value);
    }
  );
}
