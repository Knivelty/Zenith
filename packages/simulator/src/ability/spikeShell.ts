import { addEffectToPiece } from "../effect/utils";
import { asyncMap } from "../utils/asyncHelper";
import { getBattlePiece } from "../utils/dbHelper";
import { AbilityFunction } from "./interface";

let base_attack = 80;

export const spikeShell: AbilityFunction = async ({ actionPieceId }) => {
  const piece = await getBattlePiece(actionPieceId);

  await addEffectToPiece({
    pieceId: actionPieceId,
    effectName: "Taunt",
    stack: 1,
    duration: 1,
  });

  base_attack += Math.floor(40 + 0.3 * piece.armor + 0.01 * piece.maxHealth);
};

export const spikeShellPassive = async () => {
  const tarrasquePieces = await globalThis.Simulator.db.battle_entity
    .find({
      selector: {
        creature_idx: 3006,
      },
    })
    .exec();

  await asyncMap(tarrasquePieces, async (p) => {
    globalThis.Simulator.eventSystem.on(
      "afterPieceAttack",
      async ({ pieceId, targetPieceId }) => {
        if (targetPieceId === p.entity) {
          await globalThis.Simulator.eventSystem.emit("damage", {
            pieceId: targetPieceId,
            targetPieceId: pieceId,
            type: "Magical",
            value: base_attack,
          });

          await globalThis.Simulator.db.battle_entity
            .findOne({ selector: { entity: targetPieceId } })
            .update({
              $inc: { mana: 10 },
            });
        }
      }
    );
  });
};
