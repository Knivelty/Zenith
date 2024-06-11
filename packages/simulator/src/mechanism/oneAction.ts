import { DB } from "../createDB";
import { getBattlePiece, isBattleEnd } from "../utils/dbHelper";
import { getAimedPiece } from "./enemySearch";
import { findPath } from "./pathFind";
import { executeMove } from "./exexcuteMove";
import { tryAttack } from "./attack";
import { TurnLog } from "./roundBattle";

export async function battleForOnePieceOneTurn(
  db: DB,
  pieceId: string
): Promise<TurnLog | undefined> {
  const pieceBattle = await getBattlePiece(db, pieceId);

  // if this piece dead or battle end, skip
  if (pieceBattle.dead || (await isBattleEnd(db))) {
    return;
  }

  // get aimed piece
  const targetPieceId = await getAimedPiece(db, pieceId);

  if (!targetPieceId) {
    // no target piece means all enemy's piece are dead the same as battle end
    return;
  }

  const actPath = await findPath(db, pieceId, targetPieceId);

  await executeMove(db, pieceId, actPath);

  const attackedEntity = await tryAttack(db, pieceId, targetPieceId);

  return {
    // order increase one by one
    entity: pieceId,
    paths: actPath,
    attackPiece: attackedEntity,
  };
}
