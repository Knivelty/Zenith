import {
  ExtractDocumentTypeFromTypedRxJsonSchema,
  RxCollection,
  RxJsonSchema,
  toTypedRxJsonSchema,
} from "rxdb";

export const CreatureSchemaJson = {
  title: "creature schema",
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    // id = creature_index_u16 bit add level_u8
    id: {
      type: "string",
      maxLength: 100,
    },
    health: {
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
  },
  required: ["id", "health", "attack", "armor", "range", "speed", "initiative"],
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
