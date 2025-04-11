import { z } from "zod";

import { ChatModelSchemaType } from "@adaline/provider";
import {
  ImageModalityLiteral,
  ReasoningModalityLiteral,
  TextModalityLiteral,
  ToolCallModalityLiteral,
  ToolResponseModalityLiteral,
} from "@adaline/types";

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

const AnthropicThinkingChatModelModalities: ChatModelSchemaType["modalities"] = [
  TextModalityLiteral,
  ImageModalityLiteral,
  ToolCallModalityLiteral,
  ToolResponseModalityLiteral,
  ReasoningModalityLiteral,
];

const AnthropicThinkingChatModelModalitiesEnum = z.enum([
  TextModalityLiteral,
  ImageModalityLiteral,
  ToolCallModalityLiteral,
  ToolResponseModalityLiteral,
  ReasoningModalityLiteral,
]);

export {
  AnthropicChatModelModalities,
  AnthropicChatModelModalitiesEnum,
  AnthropicThinkingChatModelModalities,
  AnthropicThinkingChatModelModalitiesEnum,
};
