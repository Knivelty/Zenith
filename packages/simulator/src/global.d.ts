import { createAbilitySystem } from "./ability/createAbilitySystem";
import { DB } from "./createDB";
import { createEventSystem } from "./event/createEventSystem";

declare global {
  namespace Simulator {
    var db: DB;
    var eventSystem: ReturnType<typeof createEventSystem>;
    var handlerMap: Map<string, (data: any) => Promise<void>>;
  }
}

export {};
