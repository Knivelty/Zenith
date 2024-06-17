import { logAttack } from "../debug";
import { decreaseHealth, getBattlePiece } from "../utils/dbHelper";
import { logJps } from "../utils/logger";
import { manhattanDistance } from "./distance";

export async function tryAttack(
  actionPieceId: string,
  targetPieceId: string
): Promise<string | undefined> {
  const actionPiece = await getBattlePiece(actionPieceId);
  const targetPiece = await getBattlePiece(targetPieceId);

  // judge wether can attack
  if (
    manhattanDistance(
      actionPiece.x,
      actionPiece.y,
      targetPiece.x,
      targetPiece.y
    ) <= actionPiece.range
  ) {
    const damage =
      actionPiece.attack * (1 - targetPiece.armor / (100 + targetPiece.armor));

    logAttack(
      `piece ${actionPieceId} attack ${targetPieceId} with damage ${damage}`
    );

    await decreaseHealth(targetPieceId, damage);

    await emitAttack(actionPieceId, targetPieceId);

    return targetPieceId;
  } else {
    logJps("cannot attack due to range");
  }
}

export async function emitAttack(pieceId: string, targetPieceId: string) {
  const eventSystem = globalThis.Simulator.eventSystem;
  await eventSystem.emit("afterAttack", {
    pieceId: pieceId,
    targetPieceId: targetPieceId,
  });
}