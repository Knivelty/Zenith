import debug from "debug";
import { EffectNameType } from "../effect/general";
import { SynergyName } from "../synergy";

export const logSynergy = (synergyName: SynergyName) =>
  debug(`synergy:${synergyName}`);
export const logEffect = (effectName: EffectNameType) =>
  debug(`effect:${effectName}`);

export const logEvent = debug("event");

export const logAttack = debug("attack");
