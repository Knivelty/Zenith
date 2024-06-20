import { AbilityFunction, AbilityNameType } from "../ability";
import { barbariansRage } from "../ability/barbariansRage";
import { burningBurst } from "../ability/burningBurst";
import { logCast } from "../debug";

export function registerAbilities() {
  registerSingleAbility("burningBurst", burningBurst);
  registerSingleAbility("barbariansRage", barbariansRage);
}

function registerSingleAbility(
  name: AbilityNameType,
  handler: AbilityFunction
) {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.on("abilityCast", async ({ abilityName, data }) => {
    if (name === abilityName) {
      await handler(data);
      logCast(`piece ${data.actionPieceId} finish cast ${abilityName}`);
    }
  });
}
