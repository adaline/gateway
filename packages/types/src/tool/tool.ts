import { z } from "zod";

import { FunctionTool, FunctionToolLiteral } from "./function-tool";

const ToolLiterals = [FunctionToolLiteral] as const;
const ToolEnum = z.enum(ToolLiterals);
type ToolEnumType = z.infer<typeof ToolEnum>;

const Tool = <FTM extends z.ZodTypeAny>(FunctionToolMetadata: FTM = z.undefined() as FTM) =>
  z.discriminatedUnion("type", [FunctionTool.extend({ metadata: FunctionToolMetadata })]);
type ToolType<FTM extends z.ZodTypeAny = z.ZodUndefined> = z.infer<ReturnType<typeof Tool<FTM>>>;

export { Tool, ToolEnum, ToolLiterals, type ToolEnumType, type ToolType };
