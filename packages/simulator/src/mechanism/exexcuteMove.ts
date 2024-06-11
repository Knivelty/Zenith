import { DB } from "../createDB";
import { getBattlePiece, movePiece } from "../utils/dbHelper";
import { logJps } from "../utils/logger";
import { findPath } from "./pathFind";

export async function executeMove(
  db: DB,
  pieceId: string,
  actPath: Awaited<ReturnType<typeof findPath>>
) {
  const pieceInBattle = await getBattlePiece(db, pieceId);
  if (!actPath) {
    logJps(
      `piece ${pieceId} cannot move and stay at ${pieceInBattle.x},${pieceInBattle.y}`
    );
  } else {
    const toX = actPath[actPath.length - 1].x;
    const toY = actPath[actPath.length - 1].y;

    await movePiece(db, pieceId, toX, toY);

    logJps(
      `piece ${pieceId} move from ${actPath[0].x},${actPath[0].y} to ${toX},${toY}`
    );
  }
}
