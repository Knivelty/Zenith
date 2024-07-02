import {
  getHomeUndeadPieceIds,
  getBattlePiece,
  getAwayUndeadPieceIds,
} from "../utils/dbHelper";
import { manhattanDistance } from "./distance";

export async function getAimedPiece(
  actionPieceId: string
): Promise<string | undefined> {
  const actionPieceBattle = await getBattlePiece(actionPieceId);

  if (!actionPieceBattle) {
    throw Error("unknown piece gid");
  }

  // tgtSet = target set
  let tgtSet: Awaited<ReturnType<typeof getHomeUndeadPieceIds>>;

  if (actionPieceBattle.isHome) {
    tgtSet = await getAwayUndeadPieceIds();
  } else {
    tgtSet = await getHomeUndeadPieceIds();
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
