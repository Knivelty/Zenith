import { AbilityFunction, AbilityNameType } from "../ability/interface";
import { barbariansRage } from "../ability/barbariansRage";
import { burningBurst } from "../ability/burningBurst";
import { logCast } from "../debug";
import { mountainCollapse } from "../ability/mountainCollapse";

export function registerAbilities() {
  registerSingleAbility("burningBurst", burningBurst);
  registerSingleAbility("barbariansRage", barbariansRage);
  registerSingleAbility("mountainCollapse", mountainCollapse);
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
