export function increaseManaAfterAttack() {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.on("afterPieceAttack", async ({ pieceId }) => {
    const db = globalThis.Simulator.db;

    await db.battle_entity.findOne({ selector: { id: pieceId } }).update({
      $inc: { mana: 20 },
    });
  });
}
