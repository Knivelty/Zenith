import { AbilityNameType } from "../ability/interface";
import { logSynergy } from "../debug";
import { getPieceTryCastHandler } from "../mechanism/cast";
import { asyncMap } from "../utils/asyncHelper";
import { getBattlePiece } from "../utils/dbHelper";
import { getAllPieceWithOrigin, getValidTraitCount } from "./utils";

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
  await castUseLessMana(isHome);
}

export async function addLightInitiativeBonus(isHome: boolean) {
  const db = globalThis.Simulator.db;

  const allLightPieces = await getAllPieceWithOrigin(isHome, ORIGIN_LIGHT_NAME);

  const validCount = getValidTraitCount(allLightPieces);

  const bonus = LIGHT_INITIATIVE_BONUS[validCount];

  // add initiative to bonus
  await asyncMap(allLightPieces, async (p) => {
    await db.battle_entity
      .find({
        selector: {
          entity: p.entity,
        },
      })
      .update({ $inc: { initiative: bonus } });
    logSynergy(ORIGIN_LIGHT_NAME)(`add ${bonus} initiative to piece ${p.entity}`);
  });
}

export async function addLightRangeBonus(isHome: boolean) {
  const db = globalThis.Simulator.db;

  const allLightPieces = await getAllPieceWithOrigin(isHome, ORIGIN_LIGHT_NAME);
  const validCount = getValidTraitCount(allLightPieces);

  const bonus = LIGHT_RANGE_BONUS[validCount];

  // add range to bonus
  await asyncMap(allLightPieces, async (p) => {
    await db.battle_entity
      .find({
        selector: {
          entity: p.entity,
        },
      })
      .update({
        $inc: {
          range: bonus,
        },
      });
    logSynergy(ORIGIN_LIGHT_NAME)(`add ${bonus} range to piece ${p.entity}`);
  });
}

export async function addLightMaxManaBenefit(isHome: boolean) {
  const db = globalThis.Simulator.db;

  const allLightPieces = await getAllPieceWithOrigin(isHome, ORIGIN_LIGHT_NAME);
  const validCount = getValidTraitCount(allLightPieces);

  const decrease = LIGHT_MAX_MANA_DECREASE[validCount];

  // add range to bonus
  await asyncMap(allLightPieces, async (p) => {
    await db.battle_entity
      .find({
        selector: {
          entity: p.entity,
        },
      })
      .update({
        $inc: {
          maxMana: -decrease,
        },
      });
    logSynergy(ORIGIN_LIGHT_NAME)(
      `decrease ${decrease} max mana for piece ${p.entity}`
    );
  });
}

export async function castUseLessMana(isHome: boolean) {
  const allLightPieces = await getAllPieceWithOrigin(isHome, ORIGIN_LIGHT_NAME);
  const allLightPiecesIds = allLightPieces.map((x) => x.entity);
  const validCount = getValidTraitCount(allLightPieces);

  if (validCount < 6) {
    return;
  }

  allLightPiecesIds.map((actionPieceId) => {
    // off origin handler and register new handler
    const originHandler = getPieceTryCastHandler(actionPieceId);

    globalThis.Simulator.eventSystem.off("tryCast", originHandler);

    globalThis.Simulator.eventSystem.on(
      "tryCast",
      async ({ actionPieceId }) => {
        const actionPiece = await getBattlePiece(actionPieceId);

        const requiredMana = Math.floor(actionPiece.maxMana * 0.3);

        if (actionPiece.mana >= requiredMana) {
          await globalThis.Simulator.eventSystem.emit("pieceUseMana", {
            pieceId: actionPieceId,
            manaAmount: requiredMana,
          });

          // emit event to trigger cast
          await globalThis.Simulator.eventSystem.emit("beforeAbilityCast", {
            // warn: assert type here
            abilityName: actionPiece.ability as AbilityNameType,
            data: { actionPieceId: actionPieceId },
          });
        } else {
          await globalThis.Simulator.eventSystem.emit("pieceNotCast", {
            actionPieceId,
          });
        }
      }
    );
  });
}
