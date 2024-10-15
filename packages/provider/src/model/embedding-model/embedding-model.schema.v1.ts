import { z } from "zod";

import { EmbeddingModalityEnum } from "@adaline/types";

import { ConfigItemDef } from "../../types/config";

// TODO: add embedding model properties (dimensions, etc)
const EmbeddingModelSchema = <M extends z.ZodEnum<[string, ...string[]]> = typeof EmbeddingModalityEnum>(
  Modalities: M = EmbeddingModalityEnum as unknown as M
) =>
  z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    modalities: z.array(Modalities).nonempty(),
    maxInputTokens: z.number().int().positive().min(1),
    maxOutputTokens: z.number().int().positive().min(1),
    config: z
      .object({
        def: z.record(z.string().min(1), ConfigItemDef),
        schema: z.instanceof(z.ZodObject),
      })
      .refine(
        (config) => {
          const defKeys = Object.keys(config.def);
          const schemaKeys = Object.keys(config.schema?.shape ?? {});
          return defKeys.every((key) => schemaKeys.includes(key)) && schemaKeys.every((key) => defKeys.includes(key));
        },
        {
          message: "Keys in 'config.def' must exactly match keys in 'config.schema'",
        }
      ),
  });
type EmbeddingModelSchemaType<M extends z.ZodEnum<[string, ...string[]]> = typeof EmbeddingModalityEnum> = z.infer<
  ReturnType<typeof EmbeddingModelSchema<M>>
>;

export { EmbeddingModelSchema, type EmbeddingModelSchemaType };
