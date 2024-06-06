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
    health: {
      type: "number",
    },
    x: { type: "number" },
    y: {
      type: "number",
    },
    dead: { type: "boolean" },
  },
  required: ["id", "health", "x", "y", "dead"],
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
