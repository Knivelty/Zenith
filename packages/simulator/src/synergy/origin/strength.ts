import { asyncMap } from "../../utils/asyncHelper";
import { getAllPieceWithOrigin, getValidTraitCount } from "../utils";

export const STRENGTH_NAME = "Strength";

export const STRENGTH_BONUS: Record<number, number> = {
  0: 0,
  1: 0,
  2: 0,
  3: 20,
  4: 20,
  5: 45,
  6: 45,
  7: 70,
  8: 70,
  9: 70,
};

export async function applyStrengthSynergy(isHome: boolean) {
  await addStrengthBonus(isHome);
}

export async function addStrengthBonus(isHome: boolean) {
  const db = globalThis.Simulator.db;

  const allStrengthPieces = await getAllPieceWithOrigin(isHome, STRENGTH_NAME);

  const validCount = getValidTraitCount(allStrengthPieces);

  const bonus = STRENGTH_BONUS[validCount] / 100;
  const extraBonus = validCount > 7 ? validCount * 0.05 : 0;

  const totalBonus = bonus + extraBonus;

  // add attack to bonus
  await asyncMap(allStrengthPieces, async (p) => {
    await db.piece_attack
      .find({
        selector: {
          id: p.id,
        },
      })
      .update({
        times: {
          $add: totalBonus,
        },
      });
  });
}
