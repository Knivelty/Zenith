import { DB } from "../createDB";
import { manhattanDistance } from "../mechanism";
import { UNKNOWN_CREATURE_ERROR, UNKNOWN_PIECE_ERROR } from "./error";
import { isDefined } from "./type";

export async function getPieceBaseState(db: DB, id: string) {
  const piece = await db.base_state.findOne().where("id").eq(id).exec();

  if (!piece) {
    throw UNKNOWN_PIECE_ERROR;
  }

  return piece;
}

export async function getBattlePiece(db: DB, id: string) {
  const piece = await db.battle_entity.findOne().where("id").eq(id).exec();

  if (!piece) {
    throw UNKNOWN_PIECE_ERROR;
  }

  return piece;
}

export async function getPieceCreature(db: DB, id: string) {
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

export async function getAllUndeadPieceIds(db: DB) {
  const pieces = await db.battle_entity
    .find({
      selector: { dead: false },
    })
    .exec();
  const ids = pieces.map((p) => p.id);
  return ids;
}

export async function getEnemyUndeadPieceIds(db: DB) {
  const undeadPieceIds = await getAllUndeadPieceIds(db);

  const enemyUndeadPieceIds = await db.base_state
    .find()
    .where("isEnemy")
    .eq(true)
    .where("id")
    .in(undeadPieceIds)
    .exec();

  return enemyUndeadPieceIds;
}

export async function getAlliedUndeadPieceIds(db: DB) {
  const undeadPieceIds = await getAllUndeadPieceIds(db);

  const alliedUndeadPieceIds = await db.base_state
    .find()
    .where("isEnemy")
    .eq(false)
    .where("id")
    .in(undeadPieceIds)
    .exec();

  return alliedUndeadPieceIds;
}

export async function getBattleResult(db: DB) {
  const enemyUndeadPieceIds = await getEnemyUndeadPieceIds(db);
  const alliedUndeadPieceIds = await getAlliedUndeadPieceIds(db);

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

export async function isBattleEnd(db: DB) {
  const enemyUndeadPieceIds = await getEnemyUndeadPieceIds(db);

  const alliedPieceIds = await getAlliedUndeadPieceIds(db);

  const end = enemyUndeadPieceIds.length === 0 || alliedPieceIds.length === 0;

  return end;
}

export async function movePiece(
  db: DB,
  pieceId: string,
  toX: number,
  toY: number
) {
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

export async function decreaseHealth(
  db: DB,
  pieceId: string,
  healthDiff: number
) {
  await db.battle_entity
    .findOne()
    .where("id")
    .eq(pieceId)
    .update({ $inc: { health: -healthDiff } });

  // if health lower than zero, set to dead
  if ((await getBattlePiece(db, pieceId)).health <= 0) {
    await db.battle_entity
      .findOne()
      .where("id")
      .eq(pieceId)
      .update({ $set: { health: { eq: 0 }, dead: true } });
  }
}

export async function getAlliedPiece(db: DB) {
  return await db.base_state.find({ selector: { isEnemy: false } }).exec();
}

export async function getEnemyPiece(db: DB) {
  return await db.base_state.find({ selector: { isEnemy: true } }).exec();
}
