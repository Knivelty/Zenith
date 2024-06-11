import { DB } from "../createDB";
import { asyncMap } from "../utils/asyncHelper";
import {
  getAllUndeadPieceIds,
  getPieceBaseState,
  getPieceCreature,
} from "../utils/dbHelper";

export async function getAllUndeadPieceIdsByInitiative() {
  const db = globalThis.Simulator.db;

  const piecesIds = await getAllUndeadPieceIds();

  const pieceIdsWithInitiative = await asyncMap(piecesIds, async (id) => {
    const pieceProfile = await getPieceBaseState(id);
    const pieceCreature = await getPieceCreature(pieceProfile?.id);
    return { ...pieceCreature, id: id };
  });

  pieceIdsWithInitiative.sort((a, b) => a?.initiative - b?.initiative);

  return pieceIdsWithInitiative.map((p) => p.id);
}
