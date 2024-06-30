import { EffectHandler, EffectNameType } from "../effect/interface";
import { onEffectBurnChange } from "../effect/burn";
import { onEffectDarknessChange } from "../effect/darkness";
import { onEffectShieldChange } from "../effect/shield";
import { onEffectShieldRevengeChange } from "../effect/shieldRevenge";
import { onEffectReviveChange } from "../effect/revive";
import { onEffectRageChange } from "../effect/rage";

export function registerEffect() {
  registerOnEffectChange<"Darkness">("Darkness", onEffectDarknessChange);
  registerOnEffectChange<"Burn">("Burn", onEffectBurnChange);
  registerOnEffectChange<"Shield">("Shield", onEffectShieldChange);
  registerOnEffectChange<"ShieldRevenge">(
    "ShieldRevenge",
    onEffectShieldRevengeChange
  );
  registerOnEffectChange<"Revive">("Revive", onEffectReviveChange);
  registerOnEffectChange<"Rage">("Rage", onEffectRageChange);
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
