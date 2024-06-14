import { DB } from "./createDB";
import { createEventSystem } from "./createEventSystem";
import { createEffectSystem } from "./effect/general";

declare global {
  namespace Simulator {
    var db: DB;
    var eventSystem: ReturnType<typeof createEventSystem>;
    var effectSystem: ReturnType<typeof createEffectSystem>;
  }
}

export {};
