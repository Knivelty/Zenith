import { createAbilitySystem } from "./ability/createAbilitySystem";
import { DB } from "./createDB";
import { createEffectSystem } from "./effect/createEffectSystem";
import { createEventSystem } from "./event/createEventSystem";

declare global {
  namespace Simulator {
    var db: DB;
    var eventSystem: ReturnType<typeof createEventSystem>;
    var effectSystem: ReturnType<typeof createEffectSystem>;
    var abilitySystem: ReturnType<typeof createAbilitySystem>;
    var handlerMap: Map<string, (data: any) => Promise<void>>;
  }
}

export {};
