import {
  ExtractDocumentTypeFromTypedRxJsonSchema,
  RxCollection,
  RxJsonSchema,
  toTypedRxJsonSchema,
} from "rxdb";

export const BaseStateSchemaJson = {
  title: "entity base status",
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

const schemaTyped = toTypedRxJsonSchema(BaseStateSchemaJson);

// aggregate the document type from the schema
export type BaseStateType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

// create the typed RxJsonSchema from the literal typed object.
export const BaseStateSchema: RxJsonSchema<BaseStateType> = BaseStateSchemaJson;

export type BaseStateTypeCollection = RxCollection<BaseStateType>;
