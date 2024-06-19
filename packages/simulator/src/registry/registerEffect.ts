import { EffectHandler, EffectNameType } from "../effect";
import { onEffectDarknessChange } from "../effect/darkness";

export function registerEffect() {
  registerOnEffectChange("Darkness", onEffectDarknessChange);
  registerOnEffectChange("Burn", onEffectDarknessChange);
}

export function registerOnEffectChange(
  name: EffectNameType,
  handler: EffectHandler
) {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.on("effectChange", async ({ effectName, preValue, value }) => {
    if (effectName === name) {
      await handler({ preValue, value });
    }
  });
}
