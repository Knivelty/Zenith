import { asyncMap } from "../utils/asyncHelper";
import { getAllPieceWithOrder, getValidTraitCount } from "./utils";

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

async function addSpPowerBonus(isHome: boolean) {
  const db = globalThis.Simulator.db;

  const allMagicalPieces = await getAllPieceWithOrder(
    isHome,
    ORDER_MAGICAL_NAME
  );
  const validCount = getValidTraitCount(allMagicalPieces);

  const allPieces = await db.battle_entity
    .find({ selector: { isHome } })
    .exec();

  const magicalSpBonus = SP_POWER_BONUS_FOR_MAGICAL[validCount];
  const allSpPowerBonus = SP_POWER_BONUS_FOR_ALL[validCount];

  // add sp power bonus to all magical piece
  await asyncMap(allMagicalPieces, async (p) => {
    await db.piece_spell_amp
      .findOne({ selector: { entity: p.entity } })
      .incrementalModify((doc) => {
        doc.addition += magicalSpBonus;
        return doc;
      });
  });

  // add sp power bonus to all piece
  await asyncMap(allPieces, async (p) => {
    await db.piece_spell_amp
      .findOne({ selector: { entity: p.entity } })
      .incrementalModify((doc) => {
        doc.addition += allSpPowerBonus;
        return doc;
      });
  });
}

async function addSpPowerOnCast(isHome: boolean) {
  const allMagicalPieces = await getAllPieceWithOrder(
    isHome,
    ORDER_MAGICAL_NAME
  );
  const allMagicalPieceIds = allMagicalPieces.map((x) => x.entity);
  const validCount = getValidTraitCount(allMagicalPieces);

  if (validCount < 9) {
    return;
  }

  globalThis.Simulator.eventSystem.on(
    "afterAbilityCast",
    async ({ data: { actionPieceId } }) => {
      if (allMagicalPieceIds.includes(actionPieceId)) {
        await globalThis.Simulator.db.piece_spell_amp
          .findOne({ selector: { entity: actionPieceId } })
          .incrementalModify((doc) => {
            doc.addition += 20;
            return doc;
          });
      }
    }
  );
}
