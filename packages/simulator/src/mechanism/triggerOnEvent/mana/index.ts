import { decreaseMana } from "../../../utils/dbHelper";

export function increaseManaOnEvent() {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.on("afterPieceAttack", async ({ pieceId }) => {
    const db = globalThis.Simulator.db;

    await db.battle_entity
      .findOne({ selector: { entity: pieceId } })
      .incrementalModify((doc) => {
        doc.mana += 20;
        return doc;
      });

    await globalThis.Simulator.eventSystem.emit("pieceGainMana", {
      pieceId,
      manaAmount: 20,
    });
  });
}

export function decreaseManaOnEvent() {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.on("pieceUseMana", async ({ pieceId, manaAmount }) => {
    await decreaseMana(pieceId, manaAmount);
  });
}
