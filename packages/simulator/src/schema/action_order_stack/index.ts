import {
  ExtractDocumentTypeFromTypedRxJsonSchema,
  RxCollection,
  RxJsonSchema,
  toTypedRxJsonSchema,
} from "rxdb";

export const ActionOrderStackSchemaJson = {
  title: "action order stack",
  version: 0,
  primaryKey: {
    // where should the composed string be stored
    key: "placeholder",
    // fields that will be used to create the composed key
    fields: ["piece_id", "initiative"],
    // separator which is used to concat the fields values.
    separator: "|",
  },
  type: "object",
  properties: {
    piece_id: {
      type: "string",
    },
    initiative: {
      type: "number",
    },
    placeholder: {
      type: "string",
      maxLength: 100,
    },
  },
  required: ["piece_id", "initiative"],
  indexes: [],
} as const;

const schemaTyped = toTypedRxJsonSchema(ActionOrderStackSchemaJson);

// aggregate the document type from the schema
export type ActionOrderStackType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

// create the typed RxJsonSchema from the literal typed object.
export const ActionOrderStackSchema: RxJsonSchema<ActionOrderStackType> =
  ActionOrderStackSchemaJson;

export type ActionOrderStackCollection = RxCollection<ActionOrderStackType>;
