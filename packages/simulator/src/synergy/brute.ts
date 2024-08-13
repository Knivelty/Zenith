import { logSynergy } from "../debug";
import { addEffectToPiece } from "../effect/utils";
import { asyncMap } from "../utils/asyncHelper";
import { getBattlePiece, increaseArmor } from "../utils/dbHelper";
import { getAllPieceWithOrder, getValidTraitCount } from "./utils";

export const ORDER_BRUTE_NAME = "Brute";

export const BASE_ARMOR_BONUS = 20;
export const MIDDLE_ARMOR_BONUS = 40;
export const ULTRA_ARMOR_BONUS_PER_TURN = 10;

const SHIELD_PERCENTAGE: Record<number, number> = {
  0: 0,
  1: 0,
  2: 0,
  3: 0.3,
  4: 0.3,
  5: 0.3,
  6: 0.6,
  7: 0.6,
  8: 1,
  9: 1,
};

export async function applyBruteSynergy(isHome: boolean) {
  await addArmorBonus(isHome);
  await addShield(isHome);
  await addArmorOn4Round(isHome);
  await addArmorAndHealthOnTurnEnd(isHome);
}

export async function addArmorBonus(isHome: boolean) {
  const db = globalThis.Simulator.db;

  const allBrutePieces = await getAllPieceWithOrder(isHome, ORDER_BRUTE_NAME);

  const armerBonus = BASE_ARMOR_BONUS;

  // add initiative bonus to all hunter piece
  await asyncMap(allBrutePieces, async (p) => {
    await db.battle_entity.findOne({ selector: { entity: p.entity } }).update({
      $inc: {
        armor: armerBonus,
      },
    });
    logSynergy("Brute")(`add ${armerBonus} armor to piece ${p.entity}`);
  });
}

async function addShield(isHome: boolean) {
  const allBrutePieces = await getAllPieceWithOrder(isHome, ORDER_BRUTE_NAME);
  const validCount = getValidTraitCount(allBrutePieces);

  const shieldPercentage = SHIELD_PERCENTAGE[validCount];

  await asyncMap(allBrutePieces, async (p) => {
    const battle_entity = await getBattlePiece(p.entity);
    const shieldStack = shieldPercentage * battle_entity.health;

    await addEffectToPiece({
      pieceId: p.entity,
      effectName: "Shield",
      stack: shieldStack,
      duration: 999,
    });
    logSynergy("Brute")(`add ${shieldStack} shield to piece ${p.entity}`);
  });
}

async function addArmorOn4Round(isHome: boolean) {
  const allBrutePieces = await getAllPieceWithOrder(isHome, ORDER_BRUTE_NAME);
  const validCount = getValidTraitCount(allBrutePieces);

  if (validCount < 6) {
    return;
  }

  globalThis.Simulator.eventSystem.on("turnEnd", async ({ turn }) => {
    if (turn === 4) {
      await asyncMap(allBrutePieces, async (p) => {
        await increaseArmor(p.entity, MIDDLE_ARMOR_BONUS);
      });
    }
  });
}

async function addArmorAndHealthOnTurnEnd(isHome: boolean) {
  const allBrutePieces = await getAllPieceWithOrder(isHome, ORDER_BRUTE_NAME);
  const validCount = getValidTraitCount(allBrutePieces);

  if (validCount < 8) {
    return;
  }

  globalThis.Simulator.eventSystem.on("turnEnd", async ({}) => {
    await asyncMap(allBrutePieces, async (p) => {
      await increaseArmor(p.entity, ULTRA_ARMOR_BONUS_PER_TURN);

      // get increase piece
      const piece = await getBattlePiece(p.entity);

      await globalThis.Simulator.eventSystem.emit("heal", {
        sourcePieceId: p.entity,
        targetPieceId: p.entity,
        type: "Active Heal",
        value: piece.armor,
      });
    });
  });
}
