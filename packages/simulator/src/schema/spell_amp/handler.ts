import { RxChangeEvent } from "rxdb";
import { PieceSpellAmpType } from ".";

export async function calculatePieceSpellAmp({
  documentData,
}: RxChangeEvent<PieceSpellAmpType>) {
  const db = globalThis.Simulator.db;

  let spell_amp: number;

  if (documentData.isFixed) {
    spell_amp = documentData.fixedValue;
  } else {
    spell_amp =
      (documentData.base + documentData.addition) * documentData.times;
  }

  spell_amp = Math.floor(spell_amp);

  await db.battle_entity
    .findOne({
      selector: { entity: documentData.entity },
    })
    .incrementalPatch({ spell_amp: spell_amp });
}
