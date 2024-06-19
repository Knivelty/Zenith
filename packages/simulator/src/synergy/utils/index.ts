import * as R from "ramda";

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

export function getValidTraitCount(
  pieces: Awaited<
    ReturnType<typeof getAllPieceWithOrigin | typeof getAllPieceWithOrder>
  >
) {
  return R.uniqBy(R.prop("creature_idx"), pieces).length;
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
