import { logJps } from "../debug";
import { getBattlePiece, movePiece } from "../utils/dbHelper";
import { findPath } from "./pathFind";

export async function executeMove(
  pieceId: string,
  actPath: Awaited<ReturnType<typeof findPath>>
) {
  const pieceInBattle = await getBattlePiece(pieceId);
  if (!actPath?.length) {
    logJps(
      `piece ${pieceId} cannot move and stay at ${pieceInBattle.x},${pieceInBattle.y}`
    );
  } else {
    const toX = actPath[actPath.length - 1].x;
    const toY = actPath[actPath.length - 1].y;

    await movePiece(pieceId, toX, toY);

    logJps(
      `piece ${pieceId} move from ${actPath[0].x},${actPath[0].y} to ${toX},${toY}`
    );
  }
  await globalThis.Simulator.eventSystem.emit("pieceMove", {
    pieceId: pieceId,
    paths: actPath,
  });
}
