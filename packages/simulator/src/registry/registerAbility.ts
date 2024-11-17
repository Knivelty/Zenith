import { AbilityFunction, AbilityNameType } from "../ability/interface";
import { barbariansRage } from "../ability/barbariansRage";
import { burningBurst } from "../ability/burningBurst";
import { logCast } from "../debug";
import { mountainCollapse } from "../ability/mountainCollapse";
import { warlock_interlockedInferno } from "../ability/warlock";
import {
  jiangshi_penetrationInfection,
  jiangshi_penetrationInfection_passive,
} from "../ability/jiangshi";
import { spikeShell, spikeShellPassive } from "../ability/spikeShell";
import { spellStealPassive } from "../ability/spellSteal";

export function registerAbilities() {
  registerSingleAbility("burningBurst", burningBurst);
  registerSingleAbility("barbariansRage", barbariansRage);
  registerSingleAbility("mountainCollapse", mountainCollapse);
  registerSingleAbility("interlockedInferno", warlock_interlockedInferno);
  registerSingleAbility("penetrationInfection", jiangshi_penetrationInfection);
  registerSingleAbility("spikeShell", spikeShell);
  // passive ability
  jiangshi_penetrationInfection_passive();

  spikeShellPassive();
  spellStealPassive();
}

function registerSingleAbility(
  name: AbilityNameType,
  handler: AbilityFunction,
) {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.on("beforeAbilityCast", async ({ abilityName, data }) => {
    if (name === abilityName) {
      await handler(data);
      logCast(`piece ${data.actionPieceId} finish cast ${abilityName}`);
    }
  });
}
