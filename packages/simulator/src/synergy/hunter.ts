import { logSynergy } from "../debug";
import { asyncMap } from "../utils/asyncHelper";
import { getBattlePiece } from "../utils/dbHelper";
import { getAllPieceWithOrder, getValidTraitCount } from "./utils";

export const ORDER_HUNTER_NAME = "Hunter";

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

export const PURE_ATTACK_DIVISOR: Record<number, number> = {
  0: 0,
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 3,
  7: 3,
  8: 3,
  9: 1,
};

export async function applyHunterSynergy(isHome: boolean) {
  await addInitiativeBonus(isHome);
  await addRangeBonus(isHome);
  await addExtraDamage(isHome);
  await addExtraAttackAction(isHome);
}

export async function addInitiativeBonus(isHome: boolean) {
  const db = globalThis.Simulator.db;

  const allHunterPieces = await getAllPieceWithOrder(isHome, ORDER_HUNTER_NAME);

  const validCount = getValidTraitCount(allHunterPieces);

  const initiativeBonus = INITIATIVE_BONUS[validCount];

  // add initiative bonus to all hunter piece
  await asyncMap(allHunterPieces, async (p) => {
    await db.battle_entity.findOne({ selector: { entity: p.entity } }).update({
      $inc: {
        initiative: initiativeBonus,
      },
    });
    logSynergy("Hunter")(
      `add ${initiativeBonus} initiative to piece ${p.entity}`
    );
  });
}

export async function addRangeBonus(isHome: boolean) {
  const db = globalThis.Simulator.db;

  const allHunterPieces = await getAllPieceWithOrder(isHome, ORDER_HUNTER_NAME);
  const validCount = getValidTraitCount(allHunterPieces);
  const rangeBonus = RANGE_BONUS[validCount];

  // add initiative bonus to all hunter piece
  await asyncMap(allHunterPieces, async (p) => {
    await db.battle_entity.findOne({ selector: { entity: p.entity } }).update({
      $inc: {
        range: rangeBonus,
      },
    });
    logSynergy("Hunter")(`add ${rangeBonus} range to piece ${p.entity}`);
  });
}

async function addExtraDamage(isHome: boolean) {
  const allHunterPieces = await getAllPieceWithOrder(isHome, ORDER_HUNTER_NAME);
  const allHunterPieceIds = allHunterPieces.map((x) => x.entity);
  const validCount = getValidTraitCount(allHunterPieces);

  const pureAttackDivisor = PURE_ATTACK_DIVISOR[validCount];

  if (validCount < 6) {
    return;
  }

  globalThis.Simulator.eventSystem.on(
    "afterPieceAttack",
    async ({ pieceId, targetPieceId }) => {
      if (allHunterPieceIds.includes(pieceId)) {
        const piece = await getBattlePiece(pieceId);
        await globalThis.Simulator.eventSystem.emit("damage", {
          pieceId: piece.entity,
          targetPieceId: targetPieceId,
          type: "Pure",
          value: piece.initiative / pureAttackDivisor,
        });
      }
    }
  );
}

async function addExtraAttackAction(isHome: boolean) {
  const allHunterPieces = await getAllPieceWithOrder(isHome, ORDER_HUNTER_NAME);
  const allHunterPieceIds = allHunterPieces.map((x) => x.entity);
  const validCount = getValidTraitCount(allHunterPieces);

  if (validCount < 9) {
    return;
  }

  // attack again after the basic attack
  globalThis.Simulator.eventSystem.on(
    "afterPieceBasicAttack",
    async ({ actionPieceId }) => {
      if (allHunterPieceIds.includes(actionPieceId)) {
        await globalThis.Simulator.eventSystem.emit("beforePieceAttack", {
          actionPieceId,
        });
      }
    }
  );
}
