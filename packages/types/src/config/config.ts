import { z } from "zod";

const Config = <C extends z.ZodRecord<z.ZodString, z.ZodAny> = z.ZodRecord<z.ZodString, z.ZodAny>>(
  Config: C = z.record(z.string(), z.any()).optional() as unknown as C
) => Config;
type ConfigType<C extends z.ZodRecord<z.ZodString, z.ZodAny> = z.ZodRecord<z.ZodString, z.ZodAny>> = z.infer<ReturnType<typeof Config<C>>>;

export { Config, type ConfigType };
