import { EffectHandler } from "./interface";
import { getBattlePiece } from "../utils/dbHelper";

const ATTACK_BONUS_PER_STACK: Record<number, number> = {
  1: 180,
  2: 320,
  3: 600,
};

export const onEffectRageChange: EffectHandler<"Rage"> = async ({
  preValue,
  value,
}) => {
  const stackDiff = value.stack - preValue.stack;

  if (stackDiff === 0) {
    return;
  }

  const piece = await getBattlePiece(value.pieceId);
  const db = globalThis.Simulator.db;

  const atkPerStack = ATTACK_BONUS_PER_STACK[piece.level];

  await db.piece_attack
    .findOne({ selector: { id: piece.id } })
    .incrementalModify((doc) => {
      doc.addition += stackDiff * atkPerStack;
      return doc;
    });
};
