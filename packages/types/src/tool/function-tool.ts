import { z } from "zod";

const FunctionToolLiteral = "function" as const;

const FunctionParameterTypes = ["object", "array", "number", "string", "boolean", "null"];
const FunctionParameterTypesLiteral = z.enum(["object", "array", "number", "string", "boolean", "null"]);
type FunctionParameterTypesType = z.infer<typeof FunctionParameterTypesLiteral>;

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

const ApiRetrySettings = z.object({
  maxAttempts: z.number().int().positive(),
  initialDelay: z.number().int().positive(),
  exponentialFactor: z.number().int().positive(),
});

const HttpRequestSettings = z.object({
  type: z.literal("http"),
  method: z.enum(["get", "post"]),
  url: z.string().url(),
  headers: z.record(z.string()).optional(),
  query: z.record(z.string()).optional(),
  body: z.record(z.any()).optional(),
  proxyUrl: z.string().url().optional(),
  proxyHeaders: z.record(z.string()).optional(),
  retry: ApiRetrySettings.optional(),
});

const ApiSettings = z.discriminatedUnion("type", [HttpRequestSettings]);

const FunctionTool = z.object({
  type: ToolTypesLiteral,
  definition: z.object({
    schema: Function,
  }),
  apiSettings: ApiSettings.optional(),
});
type FunctionToolType = z.infer<typeof FunctionTool>;

export {
  Function,
  FunctionParameter,
  FunctionParameters,
  FunctionParameterTypes,
  FunctionParameterTypesLiteral,
  HttpRequestSettings,
  ApiSettings,
  ApiRetrySettings,
  ToolTypes,
  ToolTypesLiteral,
  type FunctionParametersType,
  type FunctionParameterType,
  type FunctionParameterTypesType,
  type FunctionType,
  type ToolTypesType,
};

export { FunctionTool, FunctionToolLiteral, type FunctionToolType };
