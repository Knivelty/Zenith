import {
  ExtractDocumentTypeFromTypedRxJsonSchema,
  RxCollection,
  RxJsonSchema,
  toTypedRxJsonSchema,
} from "rxdb";

export const CreatureSchemaJson = {
  title: "creature schema",
  version: 0,
  primaryKey: {
    // where should the composed string be stored
    key: "placeholder",
    // fields that will be used to create the composed key
    fields: ["creature_idx", "level"],
    // separator which is used to concat the fields values.
    separator: "|",
  },
  type: "object",
  properties: {
    placeholder: {
      type: "string",
      maxLength: 100,
    },
    creature_idx: {
      type: "number",
    },
    level: {
      type: "number",
    },
    rarity: {
      type: "number",
    },
    health: {
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
    order: {
      type: "string",
    },
    origins: {
      type: "array",
      items: {
        type: "string",
      },
    },
    ability: {
      type: "string",
    },
  },
  required: [
    "creature_idx",
    "level",
    "rarity",
    "health",
    "maxMana",
    "attack",
    "armor",
    "range",
    "speed",
    "initiative",
    "order",
    "origins",
    "ability",
  ],
  indexes: [],
} as const;

const schemaTyped = toTypedRxJsonSchema(CreatureSchemaJson);

// aggregate the document type from the schema
export type CreatureType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

// create the typed RxJsonSchema from the literal typed object.
export const CreatureSchema: RxJsonSchema<CreatureType> = CreatureSchemaJson;

export type CreatureTypeCollection = RxCollection<CreatureType>;
