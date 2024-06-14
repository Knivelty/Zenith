import { logEffect } from "../debug";
import { EffectNameType } from "./general";

/**
 * @note stack overlay, duration overwrite
 */
export async function addEffectToPiece(
  pieceId: string,
  effectName: EffectNameType,
  stack: number,
  duration: number
) {
  const db = globalThis.Simulator.db;

  const existEffect = await db.effect
    .findOne({
      selector: {
        id: pieceId,
        name: effectName,
      },
    })
    .exec();

  if (!existEffect) {
    await db.effect.insert({
      id: pieceId,
      name: effectName,
      stack: stack,
      duration: duration,
    });

    logEffect("Darkness")(
      `add ${effectName} to ${pieceId} with stack ${stack}, duration ${duration}`
    );
  } else {
    // update duration
    await db.effect
      .findOne({
        selector: {
          id: pieceId,
          name: effectName,
        },
      })
      .update({
        $set: { duration: duration },
      });

    // update stack
    await db.effect
      .findOne({
        selector: {
          id: pieceId,
          name: effectName,
        },
      })
      .update({
        $inc: { stack: stack },
      });

    logEffect("Darkness")(
      `update ${effectName} to ${pieceId} with stack ${stack}, duration ${duration}`
    );
  }
}
