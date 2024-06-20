import { logEffect } from "../debug";
import { EffectNameType } from ".";

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

    logEffect(effectName)(
      `add ${effectName} to ${pieceId} with stack ${stack}, duration ${duration}`
    );
  } else {
    // update duration
    await db.effect
      .find({
        selector: {
          id: pieceId,
          name: effectName,
        },
      })
      .incrementalPatch({
        duration: duration,
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

    logEffect(effectName)(
      `update ${effectName} to ${pieceId} with stack ${stack}, duration ${duration}`
    );
  }
}

/**
 * @note stack override, duration override
 */
export async function overrideEffectToPiece(
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

    logEffect(effectName)(
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
      .incrementalPatch({ duration: duration });

    // set stack
    await db.effect
      .findOne({
        selector: {
          id: pieceId,
          name: effectName,
        },
      })
      .incrementalPatch({
        stack: stack,
      });

    logEffect(effectName)(
      `update ${effectName} to ${pieceId} with stack ${stack}, duration ${duration}`
    );
  }
}
