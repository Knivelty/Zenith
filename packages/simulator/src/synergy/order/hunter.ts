import { logSynergy } from "../../debug";
import { asyncMap } from "../../utils/asyncHelper";
import {
  getAllPieceWithOrder,
  getAllPieceWithOrigin,
  getValidTraitCount,
} from "../utils";

//note: wip

export const ORDER_HUNTER_NAME = "HUNTER";

export const INITIATIVE_BONUS: Record<number, number> = {
  0: 0,
  1: 10,
  2: 10,
  3: 10,
  4: 10,
  5: 10,
  6: 20,
  7: 20,
  8: 20,
  9: 40,
};

export const RANGE_BONUS: Record<number, number> = {
  0: 0,
  1: 1,
  2: 1,
  3: 1,
  4: 1,
  5: 1,
  6: 1,
  7: 1,
  8: 1,
  9: 2,
};

export async function applyHunterSynergy(isHome: boolean) {
  await addInitiativeBonus(isHome);
  await addRangeBonus(isHome);
}

export async function addInitiativeBonus(isHome: boolean) {
  const db = globalThis.Simulator.db;

  const allHunterPieces = await getAllPieceWithOrder(isHome, ORDER_HUNTER_NAME);

  const validCount = getValidTraitCount(allHunterPieces);

  const initiativeBonus = INITIATIVE_BONUS[validCount];

  // add initiative bonus to all hunter piece
  await asyncMap(allHunterPieces, async (p) => {
    await db.battle_entity.findOne({ selector: { id: p.id } }).update({
      $inc: {
        initiative: initiativeBonus,
      },
    });
    logSynergy("HUNTER")(`add ${initiativeBonus} initiative to piece ${p.id}`);
  });
}

export async function addRangeBonus(isHome: boolean) {
  const db = globalThis.Simulator.db;

  const allHunterPieces = await getAllPieceWithOrder(isHome, ORDER_HUNTER_NAME);

  const validCount = getValidTraitCount(allHunterPieces);

  const rangeBonus = RANGE_BONUS[validCount];

  // add initiative bonus to all hunter piece
  await asyncMap(allHunterPieces, async (p) => {
    await db.battle_entity.findOne({ selector: { id: p.id } }).update({
      $inc: {
        range: rangeBonus,
      },
    });
    logSynergy("HUNTER")(`add ${rangeBonus} range to piece ${p.id}`);
  });
}
