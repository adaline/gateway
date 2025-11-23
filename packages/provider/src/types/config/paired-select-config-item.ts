import { z } from "zod";

const PairedSelectConfigItemTypeLiteral = "paired-select" as const;

const PairedSelectChoice = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});
type PairedSelectChoiceType = z.infer<typeof PairedSelectChoice>;

const PairedSelectFieldDef = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1).max(500).optional(),
  choices: z.array(PairedSelectChoice).min(1),
});
type PairedSelectFieldDefType = z.infer<typeof PairedSelectFieldDef>;

const PairedSelectConfigItemDef = z.object({
  type: z.literal(PairedSelectConfigItemTypeLiteral),
  param: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1).max(500),
  fields: z.tuple([PairedSelectFieldDef, PairedSelectFieldDef]),
  uniqueByField: z.string().min(1).optional(),
});
type PairedSelectConfigItemType = z.infer<typeof PairedSelectConfigItemDef>;

const createFieldEnum = (choices: PairedSelectChoiceType[]) => {
  const values = choices.map((choice) => choice.value);
  if (values.length === 0) {
    throw new Error("PairedSelectConfigItem fields must define at least one choice");
  }
  const [first, ...rest] = values as [string, ...string[]];
  return z.enum([first, ...rest]);
};

const PairedSelectConfigItemSchema = (fields: readonly [PairedSelectFieldDefType, PairedSelectFieldDefType]) => {
  const shape = fields.reduce<z.ZodRawShape>((acc, field) => {
    acc[field.key] = createFieldEnum(field.choices);
    return acc;
  }, {});
  return z.array(z.object(shape)).optional();
};
type PairedSelectConfigItemSchemaType = z.infer<ReturnType<typeof PairedSelectConfigItemSchema>>;

const PairedSelectConfigItem = (data: Omit<PairedSelectConfigItemType, "type">) => {
  const parsed = PairedSelectConfigItemDef.parse({
    type: PairedSelectConfigItemTypeLiteral,
    ...data,
  });

  const fieldKeys = new Set(parsed.fields.map((field) => field.key));
  if (fieldKeys.size !== parsed.fields.length) {
    throw new Error("PairedSelectConfigItem fields must have unique keys");
  }

  if (parsed.uniqueByField && !fieldKeys.has(parsed.uniqueByField)) {
    throw new Error("uniqueByField must reference one of the defined field keys");
  }

  return {
    def: parsed,
    schema: PairedSelectConfigItemSchema(parsed.fields),
  };
};

export {
  PairedSelectChoice,
  PairedSelectConfigItem,
  PairedSelectConfigItemDef,
  PairedSelectConfigItemSchema,
  PairedSelectConfigItemTypeLiteral,
  PairedSelectFieldDef,
  type PairedSelectChoiceType,
  type PairedSelectConfigItemSchemaType,
  type PairedSelectConfigItemType,
  type PairedSelectFieldDefType,
};
