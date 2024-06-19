import { UNKNOWN_CREATURE_ERROR, UNKNOWN_PIECE_ERROR } from "./error";

export async function getPieceBaseState(id: string) {
  const db = globalThis.Simulator.db;

  const piece = await db.base_state
    .findOne({
      selector: { id: id },
    })
    .exec();

  if (!piece) {
    throw UNKNOWN_PIECE_ERROR;
  }

  return piece;
}

export async function getBattlePiece(id: string) {
  const db = globalThis.Simulator.db;

  const piece = await db.battle_entity
    .findOne({
      selector: { id: id },
    })
    .exec();

  if (!piece) {
    throw UNKNOWN_PIECE_ERROR;
  }

  return piece;
}

export async function getPieceCreature(id: string) {
  const db = globalThis.Simulator.db;

  const pieceProfile = await db.base_state
    .findOne({
      selector: { id: id },
    })
    .exec();

  if (!pieceProfile) {
    throw UNKNOWN_PIECE_ERROR;
  }

  const pieceCreature = await db.creature
    .findOne({
      selector: {
        creature_idx: pieceProfile.creature_idx,
        level: pieceProfile.level,
      },
    })
    .exec();

  if (!pieceCreature) {
    throw UNKNOWN_CREATURE_ERROR;
  }

  return pieceCreature;
}

export async function getAllUndeadPieceIds() {
  const db = globalThis.Simulator.db;

  const pieces = await db.battle_entity
    .find({
      selector: { dead: false },
    })
    .exec();
  const ids = pieces.map((p) => p.id);
  return ids;
}

export async function getAwayUndeadPieceIds() {
  const db = globalThis.Simulator.db;

  const undeadPieceIds = await getAllUndeadPieceIds();

  const awayUndeadPieceIds = await db.base_state
    .find({
      selector: {
        isHome: false,
        id: {
          $in: undeadPieceIds,
        },
      },
    })

    .exec();

  return awayUndeadPieceIds;
}

export async function getHomeUndeadPieceIds() {
  const db = globalThis.Simulator.db;

  const undeadPieceIds = await getAllUndeadPieceIds();

  const alliedUndeadPieceIds = await db.base_state
    .find({
      selector: {
        isHome: true,
        id: {
          $in: undeadPieceIds,
        },
      },
    })

    .exec();

  return alliedUndeadPieceIds;
}

export async function getBattleResult() {
  const awayUndeadPieceIds = await getAwayUndeadPieceIds();
  const homeUndeadPieceIds = await getHomeUndeadPieceIds();

  const end =
    homeUndeadPieceIds.length === 0 || awayUndeadPieceIds.length === 0;

  let win: boolean | undefined = undefined;
  let healthDecrease: number | undefined = undefined;
  if (end) {
    win = homeUndeadPieceIds.length ? true : false;
    healthDecrease = awayUndeadPieceIds.length;
  }

  return { end, win, healthDecrease };
}

export async function isBattleEnd() {
  const awayUndeadPieceIds = await getAwayUndeadPieceIds();
  const homePieceIds = await getHomeUndeadPieceIds();

  const end = awayUndeadPieceIds.length === 0 || homePieceIds.length === 0;

  return end;
}

export async function movePiece(pieceId: string, toX: number, toY: number) {
  const db = globalThis.Simulator.db;

  await db.battle_entity
    .findOne({
      selector: {
        id: pieceId,
      },
    })
    .update({
      $set: {
        x: toX,
        y: toY,
      },
    });
}

export async function decreaseHealth(pieceId: string, healthDiff: number) {
  const db = globalThis.Simulator.db;

  await db.battle_entity
    .findOne({ selector: { id: pieceId } })
    .update({ $inc: { health: -healthDiff } });

  // if health lower than zero, set to dead
  if ((await getBattlePiece(pieceId)).health <= 0) {
    await db.battle_entity
      .findOne({ selector: { id: pieceId } })
      .update({ $set: { health: { eq: 0 }, dead: true } });

    // emit death event
    await globalThis.Simulator.eventSystem.emit("pieceDeath", {
      pieceId: pieceId,
    });
  }
}

export async function getHomePiece() {
  const db = globalThis.Simulator.db;

  return await db.base_state.find({ selector: { isHome: true } }).exec();
}

export async function getAwayPiece() {
  const db = globalThis.Simulator.db;

  return await db.base_state.find({ selector: { isHome: false } }).exec();
}
