import { EffectHandler, EffectNameType } from "../effect";
import { onEffectBurnChange } from "../effect/burn";
import { onEffectDarknessChange } from "../effect/darkness";

export function registerEffect() {
  registerOnEffectChange<"Darkness">("Darkness", onEffectDarknessChange);
  registerOnEffectChange<"Burn">("Burn", onEffectBurnChange);
}

export function registerOnEffectChange<T extends EffectNameType>(
  name: EffectNameType,
  handler: EffectHandler<T>
) {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.on("effectChange", async ({ effectName, preValue, value }) => {
    if (effectName === name) {
      await handler({ preValue, value });
    }
  });
}
