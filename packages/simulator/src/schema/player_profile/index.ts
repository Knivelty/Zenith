import {
  ExtractDocumentTypeFromTypedRxJsonSchema,
  RxCollection,
  RxJsonSchema,
  toTypedRxJsonSchema,
} from "rxdb";

export const PlayerProfileSchemaJson = {
  title: "player profile schema",
  version: 0,
  primaryKey: "address",
  type: "object",
  properties: {
    address: {
      type: "string",
      maxLength: 100,
    },
    isHome: {
      type: "boolean",
    },
    coin: {
      type: "number",
    },
  },
  required: ["address", "coin", "isHome"],
  indexes: [],
} as const;

const schemaTyped = toTypedRxJsonSchema(PlayerProfileSchemaJson);

// aggregate the document type from the schema
export type PlayerProfileType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

// create the typed RxJsonSchema from the literal typed object.
export const PlayerProfileSchema: RxJsonSchema<PlayerProfileType> =
  PlayerProfileSchemaJson;

export type PlayerProfileCollection = RxCollection<PlayerProfileType>;
