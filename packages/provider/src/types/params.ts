import { z } from "zod";

const Params = z.record(
  z.union([
    z.boolean(),
    z.string(),
    z.number(),
    z.object({}),
    z.array(z.any()),
    z.null(),
    z.undefined(),
  ])
);
type ParamsType = z.infer<typeof Params>;

export { Params, type ParamsType };
