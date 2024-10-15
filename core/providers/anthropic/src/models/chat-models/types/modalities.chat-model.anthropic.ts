import { z } from "zod";

import { ChatModelSchemaType } from "@adaline/provider";
import { ImageModalityLiteral, TextModalityLiteral, ToolCallModalityLiteral, ToolResponseModalityLiteral } from "@adaline/types";

const AnthropicChatModelModalities: ChatModelSchemaType["modalities"] = [
  TextModalityLiteral,
  ImageModalityLiteral,
  ToolCallModalityLiteral,
  ToolResponseModalityLiteral,
];

const AnthropicChatModelModalitiesEnum = z.enum([
  TextModalityLiteral,
  ImageModalityLiteral,
  ToolCallModalityLiteral,
  ToolResponseModalityLiteral,
]);

export { AnthropicChatModelModalitiesEnum, AnthropicChatModelModalities };
