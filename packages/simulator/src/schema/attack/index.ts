import {
  ExtractDocumentTypeFromTypedRxJsonSchema,
  RxCollection,
  RxJsonSchema,
  toTypedRxJsonSchema,
} from "rxdb";

export const PieceAttackSchemaJson = {
  title: "piece attack",
  version: 0,
  primaryKey: "entity",
  type: "object",
  properties: {
    // id = piece entity
    entity: {
      type: "string",
      maxLength: 100,
    },
    base: {
      type: "number",
    },
    addition: {
      type: "number",
    },
    times: {
      type: "number",
    },
    isFixed: {
      type: "boolean",
    },
    fixedValue: {
      type: "number",
    },
  },
  required: ["entity", "base", "addition", "times", "isFixed", "fixedValue"],
  indexes: [],
} as const;

const schemaTyped = toTypedRxJsonSchema(PieceAttackSchemaJson);

// aggregate the document type from the schema
export type PieceAttackType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

// create the typed RxJsonSchema from the literal typed object.
export const PieceAttackSchema: RxJsonSchema<PieceAttackType> =
  PieceAttackSchemaJson;

export type PieceAttackTypeCollection = RxCollection<PieceAttackType>;
