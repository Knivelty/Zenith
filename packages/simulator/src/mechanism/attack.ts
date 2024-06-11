import { DB } from "../createDB";
import { decreaseHealth, getBattlePiece, getPieceCreature } from "../utils/dbHelper";
import { logJps } from "../utils/logger";
import { manhattanDistance } from "./distance";

export async function tryAttack(
  db: DB,
  actionPieceId: string,
  targetPieceId: string
): Promise<string | undefined> {
  const actionPiece = await getBattlePiece(db, actionPieceId);
  const actionPieceCreature = await getPieceCreature(db, actionPieceId);
  const targetPiece = await getBattlePiece(db, targetPieceId);
  const targetPieceCreature = await getPieceCreature(db, targetPieceId);

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

    await decreaseHealth(db, targetPieceId, damage);

    console.log(
      `piece ${actionPieceId} attack ${targetPieceId} with damage ${damage}`
    );

    return targetPieceId;
  } else {
    logJps("cannot attack due to range");
  }
}
