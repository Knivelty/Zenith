import {
  ExtractDocumentTypeFromTypedRxJsonSchema,
  RxCollection,
  RxJsonSchema,
  toTypedRxJsonSchema,
} from "rxdb";

export const EffectSchemaJson = {
  title: "battle piece effect schema",
  version: 0,
  primaryKey: {
    // where should the composed string be stored
    key: "idx",
    // fields that will be used to create the composed key
    fields: ["id", "name"],
    // separator which is used to concat the fields values.
    separator: "|",
  },
  type: "object",
  properties: {
    idx: {
      type: "string",
      maxLength: 100, // <- the primary key must have set maxLength
    },
    id: {
      type: "string",
    },
    name: {
      type: "string",
    },
    stack: {
      type: "number",
    },
    duration: {
      type: "number",
    },
  },
  required: ["id", "name", "stack", "duration"],
  indexes: [],
} as const;

const schemaTyped = toTypedRxJsonSchema(EffectSchemaJson);

// aggregate the document type from the schema
export type EffectType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

// create the typed RxJsonSchema from the literal typed object.
export const EffectSchema: RxJsonSchema<EffectType> = EffectSchemaJson;

export type EffectTypeCollection = RxCollection<EffectType>;
