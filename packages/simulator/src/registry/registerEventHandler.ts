import { executeDamageOnEvent } from "../mechanism/damage";
import { increaseManaOnEvent } from "../mechanism/mana";

export function registerEventHandler() {
  increaseManaOnEvent();
  executeDamageOnEvent();
}
