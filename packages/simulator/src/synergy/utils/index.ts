export async function getAllPieceWithOrigin(isHome: boolean, origin: string) {
  const db = globalThis.Simulator.db;
  return await db.battle_entity
    .find({
      selector: {
        isHome: isHome,
        origins: {
          $elemMatch: {
            $eq: origin,
          },
        },
      },
    })
    .exec();
}

export async function getAllPieceWithOrder(isHome: boolean, order: string) {
  const db = globalThis.Simulator.db;
  return await db.battle_entity
    .find({
      selector: {
        isHome: isHome,
        order: {
          $eq: order,
        },
      },
    })
    .exec();
}
