import {
  decreaseHealth,
  getBattlePiece,
  getPieceCreature,
} from "../utils/dbHelper";
import { logJps } from "../utils/logger";
import { manhattanDistance } from "./distance";

export async function tryAttack(
  actionPieceId: string,
  targetPieceId: string
): Promise<string | undefined> {
  const actionPiece = await getBattlePiece(actionPieceId);
  const actionPieceCreature = await getPieceCreature(actionPieceId);
  const targetPiece = await getBattlePiece(targetPieceId);
  const targetPieceCreature = await getPieceCreature(targetPieceId);

  // judge wether can attack
  if (
    manhattanDistance(
      actionPiece.x,
      actionPiece.y,
      targetPiece.x,
      targetPiece.y
    ) <= actionPieceCreature.range
  ) {
    const damage =
      actionPieceCreature.attack *
      (1 - targetPieceCreature.armor / (100 + targetPieceCreature.armor));

    await decreaseHealth(targetPieceId, damage);

    console.log(
      `piece ${actionPieceId} attack ${targetPieceId} with damage ${damage}`
    );

    return targetPieceId;
  } else {
    logJps("cannot attack due to range");
  }
}
