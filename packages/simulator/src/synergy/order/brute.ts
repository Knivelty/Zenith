import { logSynergy } from "../../debug";
import { asyncMap } from "../../utils/asyncHelper";
import { getAllPieceWithOrder } from "../utils";

//note: wip
export const ORDER_BRUTE_NAME = "BRUTE";

export const ARMOR_BONUS = 20;

export async function applyBruteSynergy(isHome: boolean) {
  await addArmorBonus(isHome);
}

export async function addArmorBonus(isHome: boolean) {
  const db = globalThis.Simulator.db;

  const allBrutePieces = await getAllPieceWithOrder(isHome, ORDER_BRUTE_NAME);

  const armerBonus = ARMOR_BONUS;

  // add initiative bonus to all hunter piece
  await asyncMap(allBrutePieces, async (p) => {
    await db.battle_entity.findOne({ selector: { id: p.id } }).update({
      $inc: {
        armor: armerBonus,
      },
    });
    logSynergy("BRUTE")(`add ${armerBonus} armor to piece ${p.id}`);
  });
}
