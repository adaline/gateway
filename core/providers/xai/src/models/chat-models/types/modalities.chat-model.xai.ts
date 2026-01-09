import { z } from "zod";

import { ChatModelSchemaType } from "@adaline/provider";
import { ImageModalityLiteral, TextModalityLiteral, ToolCallModalityLiteral, ToolResponseModalityLiteral } from "@adaline/types";

const XAIChatModelModalities: ChatModelSchemaType["modalities"] = [
  TextModalityLiteral,
  ImageModalityLiteral,
  ToolCallModalityLiteral,
  ToolResponseModalityLiteral,
];

const XAIChatModelModalitiesEnum = z.enum([
  TextModalityLiteral,
  ImageModalityLiteral,
  ToolCallModalityLiteral,
  ToolResponseModalityLiteral,
]);

const XAIChatModelTextModalities: ChatModelSchemaType["modalities"] = [TextModalityLiteral];

const XAIChatModelTextModalitiesEnum = z.enum([TextModalityLiteral]);

const XAIChatModelTextToolModalities: ChatModelSchemaType["modalities"] = [
  TextModalityLiteral,
  ToolCallModalityLiteral,
  ToolResponseModalityLiteral,
];

const XAIChatModelTextToolModalitiesEnum = z.enum([TextModalityLiteral, ToolCallModalityLiteral, ToolResponseModalityLiteral]);

export {
  XAIChatModelModalitiesEnum,
  XAIChatModelModalities,
  XAIChatModelTextModalitiesEnum,
  XAIChatModelTextModalities,
  XAIChatModelTextToolModalitiesEnum,
  XAIChatModelTextToolModalities,
};
