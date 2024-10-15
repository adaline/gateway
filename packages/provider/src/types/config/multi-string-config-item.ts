import { z } from "zod";

const MultiStringConfigItemTypeLiteral = "multi-string" as const;

const MultiStringConfigItemDef = z.object({
  type: z.literal(MultiStringConfigItemTypeLiteral),
  param: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1).max(500),
  max: z.number().int().positive(),
});
type MultiStringConfigItemType = z.infer<typeof MultiStringConfigItemDef>;

const MultiStringConfigItemSchema = (max: number) => z.array(z.string()).max(max).default([]).optional();
type MultiStringConfigItemSchemaType = z.infer<ReturnType<typeof MultiStringConfigItemSchema>>;

const MultiStringConfigItem = (data: Omit<MultiStringConfigItemType, "type">) => {
  return {
    def: MultiStringConfigItemDef.parse({
      type: MultiStringConfigItemTypeLiteral,
      ...data,
    }),
    schema: MultiStringConfigItemSchema(data.max),
  };
};

export {
  MultiStringConfigItem,
  MultiStringConfigItemDef,
  MultiStringConfigItemSchema,
  MultiStringConfigItemTypeLiteral,
  type MultiStringConfigItemSchemaType,
  type MultiStringConfigItemType,
};
