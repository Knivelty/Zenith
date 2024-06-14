import { logSpellAttack } from "../debug";
import { decreaseHealth } from "../utils/dbHelper";

export async function spellAttack(
  actionPieceId: string,
  targetPieceId: string,
  damage: number
): Promise<void> {
  await decreaseHealth(targetPieceId, damage);
  logSpellAttack(
    `piece ${actionPieceId} spell attack ${targetPieceId} with damage ${damage}`
  );
}
