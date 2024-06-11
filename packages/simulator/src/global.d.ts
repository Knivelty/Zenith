import { DB } from "./createDB";
import { createEventSystem } from "./createEventSystem";

declare global {
  namespace Simulator {
    var db: DB;
    var eventSystem: ReturnType<typeof createEventSystem>;
  }
}

export {};
