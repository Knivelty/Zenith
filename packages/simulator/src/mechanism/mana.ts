import { decreaseMana } from "../utils/dbHelper";

export function increaseManaOnEvent() {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.on("afterPieceAttack", async ({ pieceId }) => {
    const db = globalThis.Simulator.db;

    await db.battle_entity.findOne({ selector: { id: pieceId } }).update({
      $inc: { mana: 20 },
    });
  });
}

export function decreaseManaOnEvent() {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.on("pieceUseMana", async ({ pieceId, manaAmount }) => {
    await decreaseMana(pieceId, manaAmount);
  });
}
