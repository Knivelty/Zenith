import { property } from "lodash";
import {
  ExtractDocumentTypeFromTypedRxJsonSchema,
  RxCollection,
  RxJsonSchema,
  toTypedRxJsonSchema,
} from "rxdb";

export const BattleEntitySchemaJson = {
  title: "battle entity schema",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    // id = piece gid
    id: {
      type: "string",
      maxLength: 100,
    },
    isHome: {
      type: "boolean",
    },
    health: {
      type: "number",
    },
    maxHealth: {
      type: "number",
    },
    mana: {
      type: "number",
    },
    maxMana: {
      type: "number",
    },
    attack: {
      type: "number",
    },
    armor: {
      type: "number",
    },
    range: {
      type: "number",
    },
    speed: {
      type: "number",
    },
    initiative: {
      type: "number",
    },
    x: { type: "number" },
    y: {
      type: "number",
    },
    dead: { type: "boolean" },
    order: {
      type: "string",
    },
    origins: {
      type: "array",
      items: {
        type: "string",
      },
    },
  },
  required: [
    "id",
    "isHome",
    "health",
    "maxHealth",
    "mana",
    "maxMana",
    "x",
    "y",
    "dead",
    "attack",
    "armor",
    "range",
    "speed",
    "initiative",
    "order",
    "origins",
  ],
  indexes: [],
} as const;

const schemaTyped = toTypedRxJsonSchema(BattleEntitySchemaJson);

// aggregate the document type from the schema
export type BattleEntityType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

// create the typed RxJsonSchema from the literal typed object.
export const BattleEntitySchema: RxJsonSchema<BattleEntityType> =
  BattleEntitySchemaJson;

export type BattleEntityTypeCollection = RxCollection<BattleEntityType>;
