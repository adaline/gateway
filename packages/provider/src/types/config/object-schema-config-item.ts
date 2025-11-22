import { z } from "zod";

const ObjectSchemaConfigItemTypeLiteral = "object-schema" as const;

const ObjectSchemaConfigItemDef = z.object({
  type: z.literal(ObjectSchemaConfigItemTypeLiteral),
  param: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1).max(500),
  objectSchema: z.any(),
});
type ObjectSchemaConfigItemType = z.infer<typeof ObjectSchemaConfigItemDef>;

const ObjectSchemaConfigItemSchema = <S extends z.ZodRawShape>(schema: z.ZodObject<S>) => schema.optional();
type ObjectSchemaConfigItemSchemaType<S extends z.ZodRawShape = z.ZodRawShape> = z.infer<
  ReturnType<typeof ObjectSchemaConfigItemSchema<S>>
>;

const ObjectSchemaConfigItem = (data: Omit<ObjectSchemaConfigItemType, "type">) => {
  return {
    def: ObjectSchemaConfigItemDef.parse({
      type: ObjectSchemaConfigItemTypeLiteral,
      ...data,
    }),
    schema: ObjectSchemaConfigItemSchema(data.objectSchema),
  };
};

export {
  ObjectSchemaConfigItem,
  ObjectSchemaConfigItemDef,
  ObjectSchemaConfigItemSchema,
  ObjectSchemaConfigItemTypeLiteral,
  type ObjectSchemaConfigItemType,
  type ObjectSchemaConfigItemSchemaType,
};
