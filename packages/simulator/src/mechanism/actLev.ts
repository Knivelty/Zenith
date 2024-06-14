export async function getAllUndeadPieceIdsByInitiative() {
  const db = globalThis.Simulator.db;

  const pieces = await db.battle_entity
    .find({
      selector: { dead: false },
      sort: [{ initiative: "desc" }],
    })
    .exec();

  return pieces.map((p) => {
    return p.id;
  });
}
