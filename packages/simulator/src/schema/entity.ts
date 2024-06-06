import {
  ExtractDocumentTypeFromTypedRxJsonSchema,
  RxCollection,
  RxJsonSchema,
  toTypedRxJsonSchema,
} from "rxdb";

export const InitEntitySchemaJson = {
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
    creatureId: {
      type: "string",
    },
    initX: { type: "number" },
    initY: {
      type: "number",
    },
    isEnemy: {
      type: "boolean",
    },
  },
  required: ["id", "initX", "initY", "isEnemy", "creatureId"],
  indexes: [],
} as const;

const schemaTyped = toTypedRxJsonSchema(InitEntitySchemaJson);

// aggregate the document type from the schema
export type InitEntityType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

// create the typed RxJsonSchema from the literal typed object.
export const InitEntitySchema: RxJsonSchema<InitEntityType> =
  InitEntitySchemaJson;

export type InitEntityTypeCollection = RxCollection<InitEntityType>;
