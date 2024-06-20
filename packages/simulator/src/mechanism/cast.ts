import { AbilityNameType } from "../ability/interface";
import { logDebug } from "../debug";
import { getBattlePiece, getPieceAbilityProfile } from "../utils/dbHelper";

export async function tryCast(
  actionPieceId: string,
  targetPieceId: string
): Promise<boolean> {
  const actionPiece = await getBattlePiece(actionPieceId);
  const targetPiece = await getBattlePiece(targetPieceId);

  const abilityProfile = await getPieceAbilityProfile(actionPieceId);

  if (!abilityProfile) {
    logDebug(`piece ${actionPieceId} no ability`);
    return false;
  }

  if (actionPiece.mana >= actionPiece.maxMana) {
    // emit use mana event
    await globalThis.Simulator.eventSystem.emit("pieceUseMana", {
      pieceId: actionPieceId,
      manaAmount: actionPiece.mana,
    });

    // emit event to trigger cast
    await globalThis.Simulator.eventSystem.emit("abilityCast", {
      // warn: assert type here
      abilityName: actionPiece.ability as AbilityNameType,
      data: { actionPieceId: actionPieceId },
    });

    return true;
  }
  return false;
}
