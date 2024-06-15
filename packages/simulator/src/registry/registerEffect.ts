import { EffectHandler, EffectNameType } from "../effect";
import { onBurnActive, onBurnDeActive } from "../effect/burn";
import { onDarknessActive, onDarknessDeActive } from "../effect/darkness";

export function registerEffect() {
  registerActive("Darkness", onDarknessActive);
  registerDeActive("Darkness", onDarknessDeActive);

  registerActive("Burn", onBurnActive);
  registerDeActive("Burn", onBurnDeActive);
}

export function registerActive(name: EffectNameType, handler: EffectHandler) {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.on("effectActive", async ({ effectName, data }) => {
    if (effectName === name) {
      await handler(data);
    }
  });
}

export function registerDeActive(name: EffectNameType, handler: EffectHandler) {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.on("effectDeActive", async ({ effectName, data }) => {
    if (effectName === name) {
      await handler(data);
    }
  });
}
