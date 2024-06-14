import { dragonExhale } from "../ability/dragonExhale";

export function registerAbility() {
  const abilitySystem = globalThis.Simulator.abilitySystem;

  abilitySystem.registerAbility("dragonExhale", dragonExhale, 100);
}
