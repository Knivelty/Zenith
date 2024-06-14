import { logSynergy } from "../../debug";
import { asyncMap } from "../../utils/asyncHelper";
import { getAllPieceWithOrigin } from "../utils";

export const ORIGIN_LIGHT_NAME = "LIGHT";

export const LIGHT_INITIATIVE_BONUS: Record<number, number> = {
  0: 0,
  1: 0,
  2: 10,
  3: 10,
  4: 20,
  5: 20,
  6: 30,
  7: 30,
  8: 30,
  9: 30,
};

export const LIGHT_MAX_MANA_DECREASE: Record<number, number> = {
  0: 0,
  1: 0,
  2: 10,
  3: 10,
  4: 20,
  5: 20,
  6: 30,
  7: 30,
  8: 30,
  9: 30,
};

export const LIGHT_RANGE_BONUS: Record<number, number> = {
  0: 0,
  1: 0,
  2: 0,
  3: 0,
  4: 1,
  5: 1,
  6: 2,
  7: 2,
  8: 2,
  9: 2,
};

export async function applyLightSynergy(isHome: boolean) {
  await addLightInitiativeBonus(isHome);
  await addLightMaxManaBenefit(isHome);
  await addLightRangeBonus(isHome);
}

export async function addLightInitiativeBonus(isHome: boolean) {
  const db = globalThis.Simulator.db;

  const allPieces = await getAllPieceWithOrigin(isHome, ORIGIN_LIGHT_NAME);

  const bonus = LIGHT_INITIATIVE_BONUS[allPieces.length];

  // add initiative to bonus
  await asyncMap(allPieces, async (p) => {
    await db.battle_entity
      .find({
        selector: {
          id: p.id,
        },
      })
      .update({ $inc: { initiative: bonus } });
    logSynergy(ORIGIN_LIGHT_NAME)(`add ${bonus} initiative to piece ${p.id}`);
  });
}

export async function addLightRangeBonus(isHome: boolean) {
  const db = globalThis.Simulator.db;

  const allPieces = await getAllPieceWithOrigin(isHome, ORIGIN_LIGHT_NAME);

  const bonus = LIGHT_RANGE_BONUS[allPieces.length];

  // add range to bonus
  await asyncMap(allPieces, async (p) => {
    await db.battle_entity
      .find({
        selector: {
          id: p.id,
        },
      })
      .update({
        $inc: {
          range: bonus,
        },
      });
    logSynergy(ORIGIN_LIGHT_NAME)(`add ${bonus} range to piece ${p.id}`);
  });
}

export async function addLightMaxManaBenefit(isHome: boolean) {
  const db = globalThis.Simulator.db;

  const allPieces = await getAllPieceWithOrigin(isHome, ORIGIN_LIGHT_NAME);
  const decrease = LIGHT_MAX_MANA_DECREASE[allPieces.length];

  // add range to bonus
  await asyncMap(allPieces, async (p) => {
    await db.battle_entity
      .find({
        selector: {
          id: p.id,
        },
      })
      .update({
        $inc: {
          maxMana: -decrease,
        },
      });
    logSynergy(ORIGIN_LIGHT_NAME)(
      `decrease ${decrease} max mana for piece ${p.id}`
    );
  });
}
