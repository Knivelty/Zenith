import { RxChangeEvent } from "rxdb";
import { PieceAttackType } from ".";

export async function calculatePieceAttack({
  documentData,
}: RxChangeEvent<PieceAttackType>) {
  const db = globalThis.Simulator.db;

  let attack: number;

  if (documentData.isFixed) {
    attack = documentData.fixedValue;
  } else {
    attack = (documentData.base + documentData.addition) * documentData.times;
  }

  attack = Math.floor(attack);

  await db.battle_entity
    .findOne({
      selector: { id: documentData.id },
    })
    .incrementalPatch({ attack: attack });
}
