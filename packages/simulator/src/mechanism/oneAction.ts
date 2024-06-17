import { getBattlePiece, isBattleEnd } from "../utils/dbHelper";
import { getAimedPiece } from "./enemySearch";
import { findPath } from "./pathFind";
import { executeMove } from "./executeMove";
import { tryAttack } from "./attack";
import { tryCast } from "./cast";

export async function battleForOnePieceOneTurn(pieceId: string) {
  // emit battle start
  await globalThis.Simulator.eventSystem.emit("beforePieceAction", { pieceId });

  const pieceBattle = await getBattlePiece(pieceId);

  // if this piece dead or battle end, skip
  if (pieceBattle.dead || (await isBattleEnd())) {
    return;
  }

  // get aimed piece
  const targetPieceId = await getAimedPiece(pieceId);

  if (!targetPieceId) {
    // no target piece means all enemy's piece are dead the same as battle end
    return;
  }

  const actPath = await findPath(pieceId, targetPieceId);
  await executeMove(pieceId, actPath);

  const cast = await tryCast(pieceId, targetPieceId);

  let attackedEntity;
  if (!cast) {
    attackedEntity = await tryAttack(pieceId, targetPieceId);
  }
}
