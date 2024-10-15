import { z } from "zod";

const Url = z.string().url();
type UrlType = z.infer<typeof Url>;

export { Url, type UrlType };
