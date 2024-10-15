import { z } from "zod";

import { ChatModelSchemaType } from "@adaline/provider";
import { ImageModalityLiteral, TextModalityLiteral, ToolCallModalityLiteral, ToolResponseModalityLiteral } from "@adaline/types";

const OpenRouterChatModelModalities: ChatModelSchemaType["modalities"] = [
  TextModalityLiteral,
  ImageModalityLiteral,
  ToolCallModalityLiteral,
  ToolResponseModalityLiteral,
];

const OpenRouterChatModelModalitiesEnum = z.enum([
  TextModalityLiteral,
  ImageModalityLiteral,
  ToolCallModalityLiteral,
  ToolResponseModalityLiteral,
]);

export { OpenRouterChatModelModalitiesEnum, OpenRouterChatModelModalities };
