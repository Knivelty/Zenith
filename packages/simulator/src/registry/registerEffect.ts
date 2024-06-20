import { EffectHandler, EffectNameType } from "../effect/interface";
import { onEffectBurnChange } from "../effect/burn";
import { onEffectDarknessChange } from "../effect/darkness";
import { onEffectShieldChange } from "../effect/shield";
import { onEffectShieldRevengeChange } from "../effect/shieldRevenge";

export function registerEffect() {
  registerOnEffectChange<"Darkness">("Darkness", onEffectDarknessChange);
  registerOnEffectChange<"Burn">("Burn", onEffectBurnChange);
  registerOnEffectChange<"Shield">("Shield", onEffectShieldChange);
  registerOnEffectChange<"ShieldRevenge">(
    "ShieldRevenge",
    onEffectShieldRevengeChange
  );
}

export function registerOnEffectChange<T extends EffectNameType>(
  name: T,
  handler: EffectHandler<T>
) {
  const eventSystem = globalThis.Simulator.eventSystem;

  eventSystem.on("effectChange", async ({ effectName, preValue, value }) => {
    if (effectName === name) {
      await handler({ preValue, value });
    }
  });
}
