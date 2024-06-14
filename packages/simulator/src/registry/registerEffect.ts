import { onBurnActive, onBurnDeActive } from "../effect/burn";
import { onDarknessActive, onDarknessDeActive } from "../effect/darkness";

export function registerEffect() {
  const effectSystem = globalThis.Simulator.effectSystem;

  effectSystem.registerActive("Darkness", onDarknessActive);
  effectSystem.registerDeActive("Darkness", onDarknessDeActive);

  effectSystem.registerActive("Burn", onBurnActive);
  effectSystem.registerDeActive("Burn", onBurnDeActive);
}
