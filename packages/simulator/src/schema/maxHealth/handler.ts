import { RxChangeEvent } from "rxdb";
import { PieceMaxHealthType } from ".";
import { BattleEntityType } from "../battle_entity";

export async function calculateMaxHealth({
  documentData,
}: RxChangeEvent<PieceMaxHealthType>) {
  const db = globalThis.Simulator.db;

  let maxHealth: number;

  const entity = documentData.entity;

  if (documentData.isFixed) {
    maxHealth = documentData.fixedValue;
  } else {
    maxHealth =
      (documentData.base + documentData.addition) * documentData.times;
  }

  maxHealth = Math.floor(maxHealth);

  await db.battle_entity
    .find({
      selector: { entity: entity },
    })
    .incrementalPatch({
      maxHealth: maxHealth,
    });
}

export async function healthFollowMaxHealth({
  documentData,
  previousDocumentData,
}: RxChangeEvent<BattleEntityType>) {
  const db = globalThis.Simulator.db;

  // strict it only to max health change
  if (
    documentData.health !== previousDocumentData?.health ||
    documentData.maxHealth === previousDocumentData.maxHealth
  ) {
    return;
  }

  const ratio = previousDocumentData.health / previousDocumentData.maxHealth;

  const currentHealth = Math.floor(ratio * documentData.maxHealth);

  await db.battle_entity
    .findOne({
      selector: { entity: documentData.entity },
    })
    .update({
      $set: { health: currentHealth },
    });
}
