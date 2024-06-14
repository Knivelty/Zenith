import { applyBruteSynergy } from "../synergy/order/brute";
import { applyHunterSynergy } from "../synergy/order/hunter";
import { applyMagicalSynergy } from "../synergy/order/magical";
import { applyDarkSynergy } from "../synergy/origin/dark";
import { applyLightSynergy } from "../synergy/origin/light";
import { applyStrengthSynergy } from "../synergy/origin/strength";

export async function registerSynergy() {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.on("beforeBattleStart", async ({ isHome }) => {
    await applyStrengthSynergy(isHome);
    await applyLightSynergy(isHome);
    await applyDarkSynergy(isHome);

    await applyMagicalSynergy(isHome);
    await applyHunterSynergy(isHome);
    await applyBruteSynergy(isHome);
  });
}
