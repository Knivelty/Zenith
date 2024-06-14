import { onDarknessActive, onDarknessDeActive } from "../effect/darkness";

export async function registerEffect() {
  const effectSystem = globalThis.Simulator.effectSystem;

  effectSystem.registerActive("Darkness", onDarknessActive);
  effectSystem.registerDeActive("Darkness", onDarknessDeActive);
}
