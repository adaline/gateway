import { z } from "zod";

const RangeConfigItemTypeLiteral = "range" as const;

const RangeConfigItemDef = z.object({
  type: z.literal(RangeConfigItemTypeLiteral),
  param: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1).max(500),
  min: z.number().int(),
  max: z.number().int(),
  step: z.number().positive(),
  default: z.number(),
});
type RangeConfigItemDefType = z.infer<typeof RangeConfigItemDef>;

const RangeConfigItemSchema = (min: number, max: number, step: number, defaultValue: number) =>
  z.number().min(min).max(max).step(step).default(defaultValue).optional();
type RangeConfigItemSchemaType = z.infer<ReturnType<typeof RangeConfigItemSchema>>;

const RangeConfigItem = (data: Omit<RangeConfigItemDefType, "type">) => {
  return {
    def: RangeConfigItemDef.parse({
      type: RangeConfigItemTypeLiteral,
      ...data,
    }),
    schema: RangeConfigItemSchema(data.min, data.max, data.step, data.default),
  };
};

export {
  RangeConfigItem,
  RangeConfigItemDef,
  RangeConfigItemSchema,
  RangeConfigItemTypeLiteral,
  type RangeConfigItemDefType,
  type RangeConfigItemSchemaType,
};
