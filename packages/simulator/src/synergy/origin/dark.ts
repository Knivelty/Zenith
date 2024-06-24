import { addEffectToPiece } from "../../effect/utils";
import { asyncMap } from "../../utils/asyncHelper";
import { getBattlePiece } from "../../utils/dbHelper";
import { getAllPieceWithOrigin } from "../utils";

export const ORIGIN_DARK_NAME = "DARK";

//note: wip

export async function applyDarkSynergy(isHome: boolean) {
  const eventSystem = globalThis.Simulator.eventSystem;
  eventSystem.on("pieceDeath", async ({ pieceId, killerPieceId, dmgSource}) => {
    const piece = await getBattlePiece(pieceId);
    // filter enemy's piece death
    if (piece.isHome !== isHome) {
      return;
    }
    const allDarkPiece = await getAllPieceWithOrigin(isHome, ORIGIN_DARK_NAME);
    await asyncMap(allDarkPiece, async (piece) => {
      // ignore death
      if (piece.dead) return;
      await addEffectToPiece({
        pieceId: piece.id,
        effectName: "Darkness",
        stack: 1,
        duration: 3,
      });
    });
  });
}
