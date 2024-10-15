import { z } from "zod";

const Headers = z.record(z.string());
type HeadersType = z.infer<typeof Headers>;

export { Headers, type HeadersType };
