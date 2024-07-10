import {
  ExtractDocumentTypeFromTypedRxJsonSchema,
  RxCollection,
  RxJsonSchema,
  toTypedRxJsonSchema,
} from "rxdb";

export const AbilityProfileSchemaJson = {
  title: "ability schema",
  version: 0,
  primaryKey: "ability_name",
  type: "object",
  properties: {
    ability_name: {
      type: "string",
      maxLength: 100,
    },
    requiredMana: {
      type: "number",
    },
  },
  required: ["ability_name", "requiredMana"],
  indexes: [],
} as const;

const schemaTyped = toTypedRxJsonSchema(AbilityProfileSchemaJson);

// aggregate the document type from the schema
export type AbilityProfileType = ExtractDocumentTypeFromTypedRxJsonSchema<
  typeof schemaTyped
>;

// create the typed RxJsonSchema from the literal typed object.
export const AbilityProfileSchema: RxJsonSchema<AbilityProfileType> =
  AbilityProfileSchemaJson;

export type AbilityProfileTypeCollection = RxCollection<AbilityProfileType>;
