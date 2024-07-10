import { addEffectToPiece } from "../effect/utils";
import { asyncMap } from "../utils/asyncHelper";
import { getBattlePiece } from "../utils/dbHelper";
import { getAllPieceWithOrigin, getValidTraitCount } from "./utils";

export const ORIGIN_DARK_NAME = "DARK";

export async function applyDarkSynergy(isHome: boolean) {
  const eventSystem = globalThis.Simulator.eventSystem;

  const allDarkPiece = await getAllPieceWithOrigin(isHome, ORIGIN_DARK_NAME);
  const validCount = getValidTraitCount(allDarkPiece);

  // buff duration
  const duration = validCount >= 2 ? 999 : 3;
  const alliedPieceTriggerTwice = validCount >= 4 ? true : false;
  const includeEnemyDeath = validCount >= 6 ? true : false;

  eventSystem.on(
    "pieceDeath",
    async ({ pieceId, killerPieceId, dmgSource }) => {
      const piece = await getBattlePiece(pieceId);

      if (piece.isHome === isHome) {
        await addDarknessToAllDarkPiece(allDarkPiece, duration);
        if (alliedPieceTriggerTwice) {
          await addDarknessToAllDarkPiece(allDarkPiece, duration);
        }
      }

      if (piece.isHome !== isHome && includeEnemyDeath) {
        await addDarknessToAllDarkPiece(allDarkPiece, duration);
      }
    }
  );
}

async function addDarknessToAllDarkPiece(
  allDarkPiece: Awaited<ReturnType<typeof getAllPieceWithOrigin>>,
  duration: number
) {
  await asyncMap(allDarkPiece, async (piece) => {
    // ignore death
    if (piece.dead) return;
    await addEffectToPiece({
      pieceId: piece.id,
      effectName: "Darkness",
      stack: 1,
      duration: duration,
    });
  });
}
