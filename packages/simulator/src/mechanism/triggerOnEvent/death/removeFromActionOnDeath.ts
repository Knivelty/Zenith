export function removeFromActionStackOnDeath() {
  globalThis.Simulator.eventSystem.on("pieceDeath", async ({ pieceId }) => {
    await globalThis.Simulator.db.action_order_stack
      .find({ selector: { piece_id: pieceId } })
      .remove();
  });
}
