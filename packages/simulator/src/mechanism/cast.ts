import { UNKNOWN_ABILITY } from "../utils";
import { getBattlePiece } from "../utils/dbHelper";

export async function tryCast(
  actionPieceId: string,
  targetPieceId: string
): Promise<boolean> {
  const actionPiece = await getBattlePiece(actionPieceId);
  const targetPiece = await getBattlePiece(targetPieceId);

  const abilityProfile = await getPieceAbilityProfile(actionPieceId);

  if (actionPiece.mana > abilityProfile.requiredMana) {
    // decrease mana
    await decreaseMana(actionPieceId, abilityProfile.requiredMana);

    // emit event to trigger cast
    await globalThis.Simulator.eventSystem.emit("abilityCast", {
      abilityName: "dragonExhale",
      data: { actionPieceId: actionPieceId },
    });

    return true;
  }
  return false;
}

export async function decreaseMana(pieceId: string, manaDecrease: number) {
  const db = globalThis.Simulator.db;
  await db.battle_entity
    .findOne({ selector: { id: pieceId } })
    .update({ $inc: { mana: -manaDecrease } });
}

export async function getPieceAbilityProfile(pieceId: string) {
  const db = globalThis.Simulator.db;
  const piece = await db.battle_entity
    .findOne({ selector: { id: pieceId } })
    .exec();

  const abilityProfile = await db.ability_profile
    .findOne({
      selector: { ability_name: piece?.ability },
    })
    .exec();

  if (!abilityProfile) {
    throw UNKNOWN_ABILITY;
  }

  return abilityProfile;
}
