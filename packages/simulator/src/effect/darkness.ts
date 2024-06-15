import { logEffect } from "../debug";
import { EffectMap } from ".";

export async function onDarknessActive({
  pieceId,
  stack,
}: EffectMap["Darkness"]) {
  const db = globalThis.Simulator.db;

  await db.piece_attack.findOne({ selector: { id: pieceId } }).update({
    $inc: {
      times: stack * 0.05,
    },
  });

  await db.piece_max_health.findOne({ selector: { id: pieceId } }).update({
    $inc: {
      times: stack * 0.05,
    },
  });

  logEffect("Darkness")(
    `active Darkness on piece ${pieceId} with stack ${stack}`
  );
}

export async function onDarknessDeActive({
  pieceId,
  stack,
}: EffectMap["Darkness"]) {
  const db = globalThis.Simulator.db;

  await db.piece_attack.findOne({ selector: { id: pieceId } }).update({
    $inc: {
      times: -stack * 0.05,
    },
  });

  await db.piece_max_health.findOne({ selector: { id: pieceId } }).update({
    $inc: {
      times: -stack * 0.05,
    },
  });

  logEffect("Darkness")(
    `deActive Darkness on piece ${pieceId} with stack ${stack}`
  );
}
