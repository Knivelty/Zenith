import { AbilityFunction } from ".";
import { UNKNOWN_ABILITY } from "../utils";

export interface AbilityMap {
  dragonExhale: {};
}

export type AbilityName = keyof AbilityMap;

export interface AbilityDetail {
  func: AbilityFunction;
  requiredMana: number;
}

interface AbilitySystem<T extends AbilityMap> {
  registerAbility<K extends keyof T>(
    name: K,
    func: AbilityFunction,
    mana: number
  ): void;
  getAbility<K extends keyof T>(name: K): AbilityDetail;
}

export const createAbilitySystem = <
  T extends AbilityMap,
>(): AbilitySystem<T> => {
  const abilityRegistry: {
    [K in keyof T]?: AbilityDetail;
  } = {};

  const registerAbility = <K extends keyof T>(
    name: K,
    func: AbilityFunction,
    requiredMana: number
  ) => {
    abilityRegistry[name] = { func, requiredMana };
  };

  const getAbility = <K extends keyof T>(name: K) => {
    if (!abilityRegistry[name]) {
      throw UNKNOWN_ABILITY;
    }
    return abilityRegistry[name] as AbilityDetail;
  };

  return { registerAbility, getAbility };
};
