import { applyBruteSynergy } from "../synergy/brute";
import { applyHunterSynergy } from "../synergy/hunter";
import { applyMagicalSynergy } from "../synergy/magical";
import { applyDarkSynergy } from "../synergy/dark";
import { applyLightSynergy } from "../synergy/light";
import { applyStrengthSynergy } from "../synergy/strength";
import { applyCunningSynergy } from "../synergy/cunning";

export function registerSynergy() {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.on("beforeBattleStart", async ({ isHome }) => {
    await applyStrengthSynergy(isHome);
    await applyLightSynergy(isHome);
    await applyDarkSynergy(isHome);

    await applyMagicalSynergy(isHome);
    await applyHunterSynergy(isHome);
    await applyBruteSynergy(isHome);
    await applyCunningSynergy(isHome);
  });
}
