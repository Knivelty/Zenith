import { AbilityName } from "../ability/createAbilitySystem";
import { getBattlePiece } from "../utils/dbHelper";

export async function tryCast(
  actionPieceId: string,
  targetPieceId: string
): Promise<boolean> {
  const actionPiece = await getBattlePiece(actionPieceId);
  const targetPiece = await getBattlePiece(targetPieceId);

  const abilitySystem = globalThis.Simulator.abilitySystem;
  const { func, requiredMana } = abilitySystem.getAbility(
    actionPiece.ability as AbilityName
  );

  if (func && actionPiece.mana > requiredMana) {
    // decrease mana
    await decreaseMana(actionPieceId, requiredMana);

    await func({
      actionPieceId,
      targetPieceId,
      data: undefined,
      level: actionPiece.level,
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
