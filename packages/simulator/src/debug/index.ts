import debug from "debug";
import { EffectNameType } from "../effect";
import { SynergyName } from "../synergy";
import { EventName } from "../event/createEventSystem";

export const logSynergy = (synergyName: SynergyName) =>
  debug(`synergy:${synergyName}`);
export const logEffect = (effectName: EffectNameType) =>
  debug(`effect:${effectName}`);

export const logEvent = (eventName: EventName) => debug(`event:${eventName}`);

export const logAttack = debug("attack");
export const logSpellAttack = debug("spellAttack");
export const logCast = debug("cast");

export const logDebug = debug("debug");
