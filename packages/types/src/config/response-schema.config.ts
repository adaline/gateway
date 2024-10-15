import { z } from "zod";

// TODO: move to json schema 7 type and validator when implemented for tool types
const ResponseSchemaTypes = ["object", "array", "number", "string", "boolean", "enum"] as const;
const ResponseSchemaTypesLiteral = z.enum(ResponseSchemaTypes);
type ResponseSchemaTypesType = z.infer<typeof ResponseSchemaTypesLiteral>;

const ResponseSchemaProperty = z.object({
  anyOf: z.array(z.any()).optional(),
  type: z.union([ResponseSchemaTypesLiteral, z.array(z.union([ResponseSchemaTypesLiteral, z.literal("null")]))]).optional(),
  default: z.any().optional(),
  title: z.string().optional(),
  description: z.string().max(4096).optional(),
  properties: z.record(z.any()).optional(),
  required: z.array(z.string()).optional(),
  minItems: z.number().int().min(0).optional(),
  maxItems: z.number().int().optional(),
  items: z.record(z.any()).optional(), // Recursive structure to handle nested arrays and objects
  enum: z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])).optional(), // Enum for allowed values
  minimum: z.number().optional(), // Minimum value for number
  maximum: z.number().optional(), // Maximum value for number
  minLength: z.number().int().min(0).optional(), // Minimum length for string
  maxLength: z.number().int().optional(), // Maximum length for string
  $ref: z.string().optional(), // Reference to another schema
});
type ResponseSchemaPropertyType = z.infer<typeof ResponseSchemaProperty>;

const ResponseSchemaStructure = z.object({
  type: z.enum(["object"]),
  required: z.array(z.string()),
  $defs: z.record(z.any()).optional(),
  properties: z.record(ResponseSchemaProperty),
  additionalProperties: z.literal(false),
});
type ResponseSchemaStructureType = z.infer<typeof ResponseSchemaStructure>;

const ResponseSchema = z
  .object({
    name: z
      .string()
      .regex(/^[a-zA-Z0-9_]{1,64}$/)
      .max(64),
    description: z.string().max(4096),
    strict: z.boolean().optional(),
    schema: ResponseSchemaStructure,
  })
  .optional();
type ResponseSchemaType = z.infer<typeof ResponseSchema>;

export {
  ResponseSchema,
  ResponseSchemaProperty,
  ResponseSchemaStructure,
  ResponseSchemaTypes,
  ResponseSchemaTypesLiteral,
  type ResponseSchemaTypesType,
  type ResponseSchemaType,
  type ResponseSchemaPropertyType,
  type ResponseSchemaStructureType,
};
