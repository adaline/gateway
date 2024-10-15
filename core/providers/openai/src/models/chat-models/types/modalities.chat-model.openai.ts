import { z } from "zod";

import { ChatModelSchemaType } from "@adaline/provider";
import { ImageModalityLiteral, TextModalityLiteral, ToolCallModalityLiteral, ToolResponseModalityLiteral } from "@adaline/types";

const OpenAIChatModelModalities: ChatModelSchemaType["modalities"] = [
  TextModalityLiteral,
  ImageModalityLiteral,
  ToolCallModalityLiteral,
  ToolResponseModalityLiteral,
];

const OpenAIChatModelModalitiesEnum = z.enum([
  TextModalityLiteral,
  ImageModalityLiteral,
  ToolCallModalityLiteral,
  ToolResponseModalityLiteral,
]);

const OpenAIChatModelTextModalities: ChatModelSchemaType["modalities"] = [TextModalityLiteral];

const OpenAIChatModelTextModalitiesEnum = z.enum([TextModalityLiteral]);

const OpenAIChatModelTextToolModalities: ChatModelSchemaType["modalities"] = [
  TextModalityLiteral,
  ToolCallModalityLiteral,
  ToolResponseModalityLiteral,
];

const OpenAIChatModelTextToolModalitiesEnum = z.enum([TextModalityLiteral, ToolCallModalityLiteral, ToolResponseModalityLiteral]);

export {
  OpenAIChatModelModalitiesEnum,
  OpenAIChatModelModalities,
  OpenAIChatModelTextModalitiesEnum,
  OpenAIChatModelTextModalities,
  OpenAIChatModelTextToolModalitiesEnum,
  OpenAIChatModelTextToolModalities,
};
