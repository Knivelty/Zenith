import { decreaseEffectDurationOnTurnEnd } from "../mechanism/triggerOnEvent/effect/decreaseEffectDurationOnTurnEnd";
import {
  decreaseManaOnEvent,
  increaseManaOnEvent,
} from "../mechanism/triggerOnEvent/mana";
import { executeDamageOnEvent } from "../mechanism/triggerOnEvent/damage/executeDamage";
import { executeHealOnEvent } from "../mechanism/triggerOnEvent/heal/executeHeal";
import { registerTryCast } from "../mechanism/cast";
import {
  registerPieceMove,
  registerPieceStartAction,
} from "../mechanism/pieceAction";
import {
  registerPieceSearchAttackTarget,
  registerPieceSearchMoveTarget,
} from "../mechanism/enemySearch";
import { registerTryAttack, registerExecuteAttack } from "../mechanism/attack";
import { removeFromActionStackOnDeath } from "../mechanism/triggerOnEvent/death/removeFromActionOnDeath";

export function registerEventHandler() {
  registerPieceStartAction();

  registerPieceSearchMoveTarget();

  registerPieceMove();

  registerPieceSearchAttackTarget();

  registerTryCast();

  registerTryAttack();

  registerExecuteAttack();

  removeFromActionStackOnDeath();

  increaseManaOnEvent();
  executeDamageOnEvent();
  executeHealOnEvent();
  decreaseEffectDurationOnTurnEnd();
  decreaseManaOnEvent();
}
