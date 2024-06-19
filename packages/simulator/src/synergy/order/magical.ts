import { asyncMap } from "../../utils/asyncHelper";
import { getAllPieceWithOrder, getValidTraitCount } from "../utils";

//note: wip

export const ORDER_MAGICAL_NAME = "MAGICAL";

export const SP_POWER_BONUS_FOR_MAGICAL: Record<number, number> = {
  0: 0,
  1: 20,
  2: 20,
  3: 40,
  4: 40,
  5: 40,
  6: 70,
  7: 70,
  8: 70,
  9: 70,
};

export const SP_POWER_BONUS_FOR_ALL: Record<number, number> = {
  0: 0,
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
  7: 0,
  8: 0,
  9: 30,
};

export async function applyMagicalSynergy(isHome: boolean) {
  await addSpPowerBonus(isHome);
}

export async function addSpPowerBonus(isHome: boolean) {
  const db = globalThis.Simulator.db;

  const allMagicalPieces = await getAllPieceWithOrder(
    isHome,
    ORDER_MAGICAL_NAME
  );

  const validCount = getValidTraitCount(allMagicalPieces);

  const magicalSpBonus = SP_POWER_BONUS_FOR_MAGICAL[validCount];
  const allSpPowerBonus = SP_POWER_BONUS_FOR_ALL[validCount];

  // add sp power bonus to all magical piece
  await asyncMap(allMagicalPieces, async (p) => {});
}
