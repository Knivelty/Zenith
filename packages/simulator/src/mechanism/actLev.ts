export async function getAllUndeadPiecesByInitiative() {
  const db = globalThis.Simulator.db;

  const pieces = await db.battle_entity
    .find({
      selector: { dead: false },
      sort: [{ initiative: "desc" }],
    })
    .exec();

  return pieces;
}
