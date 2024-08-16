import { logEffect } from "../debug";
import { EffectHandler, EffectMap } from "./interface";

export const onEffectDarknessChange: EffectHandler<"Darkness"> = async ({
  preValue,
  value,
}) => {
  await onDarknessDeActive(preValue);
  await onDarknessActive(value);
};

async function onDarknessActive({ pieceId, stack }: EffectMap["Darkness"]) {
  const db = globalThis.Simulator.db;

  await db.piece_attack
    .findOne({ selector: { entity: pieceId } })
    .incrementalModify((doc) => {
      doc.times += stack * 0.05;
      return doc;
    });

  await db.piece_max_health
    .findOne({ selector: { entity: pieceId } })
    .incrementalModify((doc) => {
      doc.times += stack * 0.05;
      return doc;
    });

  logEffect("Darkness")(
    `active Darkness on piece ${pieceId} with stack ${stack}`
  );
}

async function onDarknessDeActive({ pieceId, stack }: EffectMap["Darkness"]) {
  const db = globalThis.Simulator.db;

  await db.piece_attack
    .findOne({ selector: { entity: pieceId } })
    .incrementalModify((doc) => {
      doc.times -= stack * 0.05;
      return doc;
    });

  await db.piece_max_health
    .findOne({ selector: { entity: pieceId } })
    .incrementalModify((doc) => {
      doc.times -= stack * 0.05;
      return doc;
    });

  logEffect("Darkness")(
    `deActive Darkness on piece ${pieceId} with stack ${stack}`
  );
}
