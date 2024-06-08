import { RxDatabase } from "rxdb";
import { CreatureTypeCollection } from "./creature";
import { BattleEntityTypeCollection } from "./battle_entity";
import { InitEntityTypeCollection } from "./entity";

export type DBCollections = {
  creature: CreatureTypeCollection;
  battle_entity: BattleEntityTypeCollection;
  init_entity: InitEntityTypeCollection;
};

export type MyDatabase = RxDatabase<DBCollections>;
