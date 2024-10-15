// import { JSONSchema7 } from "json-schema";
// import { Validator } from "jsonschema";
import { z } from "zod";

const FunctionToolLiteral = "function" as const;

// TODO: fix 'name' property not allowed in JSONSchema7
// const FunctionTool = z.object({
//   type: z.literal(FunctionToolLiteral),
//   definition: z.object({
//     schema: z.object({}).refine((schema) => {
//       const validator = new Validator();
//       return validator.validate(schema, { type: "object" }).valid;
//     }),
//   }),
//   callback: z.function().args(z.string().min(0)).returns(z.promise(z.any())).optional(),
// });

// const FunctionTool = z.object({
//   type: z.literal(FunctionToolLiteral),
//   definition: z.object({
//     schema: z.object({}),
//   }),
//   callback: z.function().args(z.string().min(0)).returns(z.promise(z.any())).optional(),
// });
// type FunctionToolType = z.infer<typeof FunctionTool>;

const FunctionParameterTypes = ["object", "array", "number", "string", "boolean", "null"];
const FunctionParameterTypesLiteral = z.enum(["object", "array", "number", "string", "boolean", "null"]);
type FunctionParameterTypesType = z.infer<typeof FunctionParameterTypesLiteral>;

// TODO: make a proper fix here
const FunctionParameter = z.object({
  anyOf: z.array(z.any()).optional(),
  type: FunctionParameterTypesLiteral.optional(),
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
});
type FunctionParameterType = z.infer<typeof FunctionParameter>;

const FunctionParameters = z.object({
  type: z.enum(["object"]),
  title: z.string().optional(),
  $defs: z.record(z.any()).optional(),
  properties: z.record(FunctionParameter).optional(),
  required: z.array(z.string()).optional(),
});
type FunctionParametersType = z.infer<typeof FunctionParameters>;

const Function = z.object({
  name: z
    .string()
    .regex(/^[a-zA-Z0-9_]{1,64}$/)
    .max(64),
  description: z.string().max(4096),
  parameters: z.any(),
  strict: z.boolean().optional(),
});
type FunctionType = z.infer<typeof Function>;

const ToolTypes = ["function"];
const ToolTypesLiteral = z.enum(["function"]);
type ToolTypesType = z.infer<typeof ToolTypesLiteral>;

const FunctionTool = z.object({
  type: ToolTypesLiteral,
  definition: z.object({
    schema: Function, // TODO: convert to union with more tool types
  }),
});
type FunctionToolType = z.infer<typeof FunctionTool>;

// const Tools = z.array(Tool).nonempty().optional();
// type ToolsType = z.infer<typeof Tools>;

export {
  Function,
  FunctionParameter,
  FunctionParameters,
  FunctionParameterTypes,
  FunctionParameterTypesLiteral,
  ToolTypes,
  ToolTypesLiteral,
  type FunctionParametersType,
  type FunctionParameterType,
  type FunctionParameterTypesType,
  type FunctionType,
  type ToolTypesType,
};

export { FunctionTool, FunctionToolLiteral, type FunctionToolType };
