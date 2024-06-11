import { DB } from "../createDB";
import {
  getAlliedUndeadPieceIds,
  getBattlePiece,
  getEnemyUndeadPieceIds,
  getPieceBaseState,
  getPieceCreature,
} from "../utils/dbHelper";
import { manhattanDistance } from "./distance";

export async function getAimedPiece(
  actionPieceId: string
): Promise<string | undefined> {
  const actionPieceBase = await getPieceBaseState(actionPieceId);
  const actionPieceBattle = await getBattlePiece(actionPieceId);

  if (!actionPieceBattle || !actionPieceBase) {
    throw Error("unknown piece gid");
  }

  // tgtSet = target set
  let tgtSet: Awaited<ReturnType<typeof getAlliedUndeadPieceIds>>;

  if (actionPieceBase?.isEnemy) {
    tgtSet = await getAlliedUndeadPieceIds();
  } else {
    tgtSet = await getEnemyUndeadPieceIds();
  }

  // get nearest piece
  const pieceWithDistance = await Promise.all(
    tgtSet.map(async (opp) => {
      const p = await getBattlePiece(opp.id);

      return {
        id: opp.id,
        distance: manhattanDistance(
          actionPieceBattle?.x,
          actionPieceBattle?.y,
          p.x,
          p.y
        ),
      };
    })
  );

  return pieceWithDistance?.length ? pieceWithDistance[0].id : undefined;
}
