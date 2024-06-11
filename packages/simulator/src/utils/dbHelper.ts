import { UNKNOWN_CREATURE_ERROR, UNKNOWN_PIECE_ERROR } from "./error";

export async function getPieceBaseState(id: string) {
  const db = globalThis.Simulator.db;

  const piece = await db.base_state.findOne().where("id").eq(id).exec();

  if (!piece) {
    throw UNKNOWN_PIECE_ERROR;
  }

  return piece;
}

export async function getBattlePiece(id: string) {
  const db = globalThis.Simulator.db;

  const piece = await db.battle_entity.findOne().where("id").eq(id).exec();

  if (!piece) {
    throw UNKNOWN_PIECE_ERROR;
  }

  return piece;
}

export async function getPieceCreature(id: string) {
  const db = globalThis.Simulator.db;

  const pieceProfile = await db.base_state.findOne().where("id").eq(id).exec();

  if (!pieceProfile) {
    throw UNKNOWN_PIECE_ERROR;
  }

  const pieceCreature = await db.creature
    .findOne()
    .where("id")
    .eq(pieceProfile.creatureId)
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

export async function getEnemyUndeadPieceIds() {
  const db = globalThis.Simulator.db;

  const undeadPieceIds = await getAllUndeadPieceIds();

  const enemyUndeadPieceIds = await db.base_state
    .find()
    .where("isEnemy")
    .eq(true)
    .where("id")
    .in(undeadPieceIds)
    .exec();

  return enemyUndeadPieceIds;
}

export async function getAlliedUndeadPieceIds() {
  const db = globalThis.Simulator.db;

  const undeadPieceIds = await getAllUndeadPieceIds();

  const alliedUndeadPieceIds = await db.base_state
    .find()
    .where("isEnemy")
    .eq(false)
    .where("id")
    .in(undeadPieceIds)
    .exec();

  return alliedUndeadPieceIds;
}

export async function getBattleResult() {
  const enemyUndeadPieceIds = await getEnemyUndeadPieceIds();
  const alliedUndeadPieceIds = await getAlliedUndeadPieceIds();

  const end =
    enemyUndeadPieceIds.length === 0 || alliedUndeadPieceIds.length === 0;

  let win: boolean | undefined = undefined;
  let healthDecrease: number | undefined = undefined;
  if (end) {
    win = alliedUndeadPieceIds.length ? true : false;
    healthDecrease = enemyUndeadPieceIds.length;
  }

  return { end, win, healthDecrease };
}

export async function isBattleEnd() {
  const db = globalThis.Simulator.db;

  const enemyUndeadPieceIds = await getEnemyUndeadPieceIds();

  const alliedPieceIds = await getAlliedUndeadPieceIds();

  const end = enemyUndeadPieceIds.length === 0 || alliedPieceIds.length === 0;

  return end;
}

export async function movePiece(pieceId: string, toX: number, toY: number) {
  const db = globalThis.Simulator.db;

  await db.battle_entity
    .findOne()
    .where("id")
    .eq(pieceId)
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
    .findOne()
    .where("id")
    .eq(pieceId)
    .update({ $inc: { health: -healthDiff } });

  // if health lower than zero, set to dead
  if ((await getBattlePiece(pieceId)).health <= 0) {
    await db.battle_entity
      .findOne()
      .where("id")
      .eq(pieceId)
      .update({ $set: { health: { eq: 0 }, dead: true } });
  }
}

export async function getAlliedPiece() {
  const db = globalThis.Simulator.db;

  return await db.base_state.find({ selector: { isEnemy: false } }).exec();
}

export async function getEnemyPiece() {
  const db = globalThis.Simulator.db;

  return await db.base_state.find({ selector: { isEnemy: true } }).exec();
}
