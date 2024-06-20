import { decreaseEffectDurationOnTurnEnd } from "../mechanism/triggerOnEvent/effect/decreaseEffectDurationOnTurnEnd";
import { increaseManaOnEvent } from "../mechanism/triggerOnEvent/mana";
import { executeDamageOnEvent } from "../mechanism/triggerOnEvent/damage/executeDamage";

export function registerEventHandler() {
  increaseManaOnEvent();
  executeDamageOnEvent();
  decreaseEffectDurationOnTurnEnd();
}
