import { z } from "zod";

const SelectBooleanConfigItemTypeLiteral = "select-boolean" as const;

const SelectBooleanConfigItemDef = z.object({
  type: z.literal(SelectBooleanConfigItemTypeLiteral),
  param: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1).max(500),
  default: z.boolean().nullable(),
});
type SelectBooleanConfigItemDefType = z.infer<typeof SelectBooleanConfigItemDef>;

const SelectBooleanConfigItemSchema = (defaultValue: boolean | null) => z.boolean().nullable().default(defaultValue).optional();
type SelectBooleanConfigItemSchemaType = z.infer<ReturnType<typeof SelectBooleanConfigItemSchema>>;

const SelectBooleanConfigItem = (data: Omit<SelectBooleanConfigItemDefType, "type">) => {
  return {
    def: SelectBooleanConfigItemDef.parse({
      type: SelectBooleanConfigItemTypeLiteral,
      ...data,
    }),
    schema: SelectBooleanConfigItemSchema(data.default),
  };
};

export {
  SelectBooleanConfigItem,
  SelectBooleanConfigItemDef,
  SelectBooleanConfigItemSchema,
  SelectBooleanConfigItemTypeLiteral,
  type SelectBooleanConfigItemDefType,
  type SelectBooleanConfigItemSchemaType,
};
