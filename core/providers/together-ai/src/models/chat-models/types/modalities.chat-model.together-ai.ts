import { z } from "zod";

import { ChatModelSchemaType } from "@adaline/provider";
import { TextModalityLiteral, ToolCallModalityLiteral, ToolResponseModalityLiteral } from "@adaline/types";

const TogetherAIChatModelModalities: ChatModelSchemaType["modalities"] = [
  TextModalityLiteral,
  ToolCallModalityLiteral,
  ToolResponseModalityLiteral,
];

const TogetherAIChatModelModalitiesEnum = z.enum([TextModalityLiteral, ToolCallModalityLiteral, ToolResponseModalityLiteral]);

export { TogetherAIChatModelModalitiesEnum, TogetherAIChatModelModalities };
