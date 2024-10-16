import { logEffect } from "../debug";
import { EventMap } from "../event/createEventSystem";
import { UNKNOWN_ERROR } from "../utils";
import { EffectHandler } from "./interface";

const ManaIncreased: Record<number, number> = {
  1: 100,
  2: 80,
  3: 50,
};

/**
 * @note use a global map to confirm to get the same handler
 */
function getHandler(actionPieceId: string) {
  const handlerMap = globalThis.Simulator.handlerMap;
  // TODO: perf key design
  const key = `revive-${actionPieceId}`;
  if (!handlerMap.has(key)) {
    const handler = async ({
      pieceId,
      killerPieceId,
      dmgSource,
    }: EventMap["pieceDeath"]) => {
      const db = globalThis.Simulator.db;

      // delete the following code after damage source is implemented
      if (killerPieceId === "0") {
        return;
      }

      const killerPiece = await db.battle_entity
        .findOne({
          selector: {
            entity: killerPieceId,
          },
        })
        .exec();

      if (!killerPiece) {
        console.trace(UNKNOWN_ERROR);
        throw UNKNOWN_ERROR;
      }

      const effect = await db.effect
        .findOne({ selector: { id: pieceId, name: "Revive" } })
        .exec();

      if (
        killerPiece.ability === "penetrationInfection" &&
        effect &&
        effect?.duration > 0 &&
        effect?.stack > 0
      ) {
        logEffect("Revive")(`piece ${pieceId} revive`);

        await db.battle_entity
          .findOne({
            selector: {
              entity: pieceId,
            },
          })
          .incrementalModify((doc) => {
            doc.health = doc.maxHealth;
            doc.dead = false;
            doc.isHome = !doc.isHome;
            doc.mana = 0;
            doc.maxMana = doc.maxMana + ManaIncreased[killerPiece.level];
            return doc;
          });

        const newPiece = await db.battle_entity
          .findOne({ selector: { entity: pieceId } })
          .exec();

        await globalThis.Simulator.eventSystem.emit(
          "pieceSpawn",
          newPiece!._data
        );
      }
    };
    handlerMap.set(key, handler);
  }

  return handlerMap.get(key)!;
}

export const onEffectReviveChange: EffectHandler<"Revive"> = async ({
  preValue,
  value,
}) => {
  // nothing happen on shield change

  if (preValue.stack === value.stack) {
    return;
  }

  if (value.stack !== 0 && preValue.stack === 0) {
    globalThis.Simulator.eventSystem.on(
      "pieceDeath",
      getHandler(value.pieceId)
    );
  }

  if (value.stack === 0 && preValue.stack !== 0) {
    globalThis.Simulator.eventSystem.off(
      "pieceDeath",
      getHandler(value.pieceId)
    );
  }
};
