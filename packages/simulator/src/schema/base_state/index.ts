import {
  ExtractDocumentTypeFromTypedRxJsonSchema,
  RxCollection,
  RxJsonSchema,
  toTypedRxJsonSchema,
} from "rxdb";

export const BaseStateSchemaJson = {
  title: "entity base status",
  version: 0,
  primaryKey: "entity",
  type: "object",
  properties: {
    // id = piece gid
    entity: {
      type: "string",
      maxLength: 100,
    },
    creature_idx: {
      type: "number",
    },
    initX: { type: "number" },
    initY: {
      type: "number",
    },
    isHome: {
      type: "boolean",
    },
    level: {
      type: "number",
    },
  },
  required: ["entity", "initX", "initY", "isHome", "creature_idx", "level"],
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
