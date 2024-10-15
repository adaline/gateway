import { z } from "zod";

import { ModalityEnum, RoleEnum } from "@adaline/types";

import { ConfigItemDef } from "../../types/config";

const ChatModelSchema = <
  R extends z.ZodEnum<[string, ...string[]]> = typeof RoleEnum,
  M extends z.ZodEnum<[string, ...string[]]> = typeof ModalityEnum,
>(
  Roles: R = RoleEnum as unknown as R,
  Modalities: M = ModalityEnum as unknown as M
) =>
  z.object({
    name: z.string().min(1),
    description: z.string().min(1),
    roles: z.record(Roles, z.string().min(1).optional()),
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
type ChatModelSchemaType<
  R extends z.ZodEnum<[string, ...string[]]> = typeof RoleEnum,
  M extends z.ZodEnum<[string, ...string[]]> = typeof ModalityEnum,
> = z.infer<ReturnType<typeof ChatModelSchema<R, M>>>;

export { ChatModelSchema, type ChatModelSchemaType };
