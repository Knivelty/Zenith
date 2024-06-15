import { AbilityFunction, AbilityNameType } from "../ability";
import { dragonExhale } from "../ability/dragonExhale";

export function registerAbilities() {
  registerSingleAbility("dragonExhale", dragonExhale);
}

function registerSingleAbility(
  name: AbilityNameType,
  handler: AbilityFunction
) {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.on("abilityCast", async ({ abilityName, data }) => {
    if (name === abilityName) {
      await handler(data);
    }
  });
}
