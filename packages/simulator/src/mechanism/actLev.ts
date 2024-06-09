import { DB } from "../createDB";
import { asyncMap } from "../utils/asyncHelper";
import {
  getAllUndeadPieceIds,
  getPieceBaseState,
  getPieceCreature,
} from "../utils/dbHelper";

export async function getAllUndeadPieceIdsByInitiative(db: DB) {
  const piecesIds = await getAllUndeadPieceIds(db);

  const pieceIdsWithInitiative = await asyncMap(piecesIds, async (id) => {
    const pieceProfile = await getPieceBaseState(db, id);
    const pieceCreature = await getPieceCreature(db, pieceProfile?.id);
    return { ...pieceCreature, id: id };
  });

  pieceIdsWithInitiative.sort((a, b) => a?.initiative - b?.initiative);

  return pieceIdsWithInitiative.map((p) => p.id);
}
