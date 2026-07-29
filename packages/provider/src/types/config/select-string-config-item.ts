import { z } from "zod";

const SelectStringConfigItemTypeLiteral = "select-string" as const;

const SelectStringConfigItemDef = z.object({
  type: z.literal(SelectStringConfigItemTypeLiteral),
  param: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1).max(500),
  // null means the upstream provider documents no default for the param, matching
  // SelectBooleanConfigItem and the string | null already accepted by the schema builder below.
  default: z.string().nullable(),
  choices: z.array(z.string()),
});
type SelectStringConfigItemDefType = z.infer<typeof SelectStringConfigItemDef>;

const SelectStringConfigItemSchema = (defaultValue: string | null, choices: string[]) =>
  z
    .enum(choices as [string, ...string[]])
    .nullable()
    .default(defaultValue)
    .optional();
type SelectStringConfigItemSchemaType = z.infer<ReturnType<typeof SelectStringConfigItemSchema>>;

const SelectStringConfigItem = (data: Omit<SelectStringConfigItemDefType, "type">) => {
  return {
    def: SelectStringConfigItemDef.parse({
      type: SelectStringConfigItemTypeLiteral,
      ...data,
    }),
    schema: SelectStringConfigItemSchema(data.default, data.choices),
  };
};

export {
  SelectStringConfigItem,
  SelectStringConfigItemDef,
  SelectStringConfigItemSchema,
  SelectStringConfigItemTypeLiteral,
  type SelectStringConfigItemDefType,
  type SelectStringConfigItemSchemaType,
};
