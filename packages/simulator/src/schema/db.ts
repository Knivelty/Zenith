import { RxDatabase } from "rxdb";
import { CreatureTypeCollection } from "./creature";
import { BattleEntityTypeCollection } from "./battle_entity";
import { BaseStateTypeCollection } from "./base_state";

export type DBCollections = {
  creature: CreatureTypeCollection;
  battle_entity: BattleEntityTypeCollection;
  base_state: BaseStateTypeCollection;
};

export type MyDatabase = RxDatabase<DBCollections>;
