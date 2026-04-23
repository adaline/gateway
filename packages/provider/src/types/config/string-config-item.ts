import { z } from "zod";

const StringConfigItemTypeLiteral = "string" as const;

const StringConfigItemDef = z.object({
  type: z.literal(StringConfigItemTypeLiteral),
  param: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1).max(500),
  default: z.string().optional(),
  minLength: z.number().int().nonnegative().optional(),
  maxLength: z.number().int().positive().optional(),
});
type StringConfigItemDefType = z.infer<typeof StringConfigItemDef>;

const StringConfigItemSchema = (defaultValue?: string, minLength?: number, maxLength?: number) => {
  let schema: z.ZodString = z.string();
  if (typeof minLength === "number") schema = schema.min(minLength);
  if (typeof maxLength === "number") schema = schema.max(maxLength);
  if (defaultValue !== undefined) {
    return schema.default(defaultValue).optional();
  }
  return schema.optional();
};
type StringConfigItemSchemaType = z.infer<ReturnType<typeof StringConfigItemSchema>>;

const StringConfigItem = (data: Omit<StringConfigItemDefType, "type">) => {
  return {
    def: StringConfigItemDef.parse({
      type: StringConfigItemTypeLiteral,
      ...data,
    }),
    schema: StringConfigItemSchema(data.default, data.minLength, data.maxLength),
  };
};

export {
  StringConfigItem,
  StringConfigItemDef,
  StringConfigItemSchema,
  StringConfigItemTypeLiteral,
  type StringConfigItemDefType,
  type StringConfigItemSchemaType,
};
