import debug from "debug";
import { EffectNameType } from "../effect/interface";
import { SynergyName } from "../synergy";
import { EventNameType } from "../event/createEventSystem";

export const logSynergy = (synergyName: SynergyName) =>
  debug(`simulator:synergy:${synergyName}`);
export const logEffect = (effectName: EffectNameType) =>
  debug(`simulator:effect:${effectName}`);

export const logEvent = (eventName: EventNameType) =>
  debug(`simulator:event:${eventName}`);

export const logAttack = debug("simulator:attack");
export const logSpellAttack = debug("simulator:spellAttack");
export const logCast = debug("simulator:abilityCast");

export const logDebug = debug("simulator:debug");
export const logJps = debug("simulator:jps");
