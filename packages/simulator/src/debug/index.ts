import debug from "debug";
import { EffectNameType } from "../effect/interface";
import { SynergyName } from "../synergy";
import { EventNameType } from "../event/createEventSystem";

export const logSynergy = (synergyName: SynergyName) =>
  debug(`synergy:${synergyName}`);
export const logEffect = (effectName: EffectNameType) =>
  debug(`effect:${effectName}`);

export const logEvent = (eventName: EventNameType) =>
  debug(`event:${eventName}`);

export const logAttack = debug("attack");
export const logSpellAttack = debug("spellAttack");
export const logCast = debug("abilityCast");

export const logDebug = debug("debug");
