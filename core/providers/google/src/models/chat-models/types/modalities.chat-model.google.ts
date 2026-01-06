import { z } from "zod";

import { ChatModelSchemaType } from "@adaline/provider";
import { ErrorModalityLiteral, ImageModalityLiteral, PdfModalityLiteral, ReasoningModalityLiteral, SearchResultModalityLiteral, TextModalityLiteral, ToolCallModalityLiteral, ToolResponseModalityLiteral } from "@adaline/types";

const GoogleChatModelModalities: ChatModelSchemaType["modalities"] = [
  TextModalityLiteral,
  ImageModalityLiteral,
  PdfModalityLiteral,
  ToolCallModalityLiteral,
  ToolResponseModalityLiteral,
  ReasoningModalityLiteral,
  SearchResultModalityLiteral,
  ErrorModalityLiteral,
];

const GoogleChatModelModalitiesEnum = z.enum([
  TextModalityLiteral,
  ImageModalityLiteral,
  PdfModalityLiteral,
  ToolCallModalityLiteral,
  ToolResponseModalityLiteral,
  ReasoningModalityLiteral,
  SearchResultModalityLiteral,
  ErrorModalityLiteral,
]);

const GoogleChatModelTextModalities: ChatModelSchemaType["modalities"] = [TextModalityLiteral];

const GoogleChatModelTextModalitiesEnum = z.enum([TextModalityLiteral]);

const GoogleChatModelTextVisionModalities: ChatModelSchemaType["modalities"] = [TextModalityLiteral, ImageModalityLiteral];

const GoogleChatModelTextVisionModalitiesEnum = z.enum([TextModalityLiteral, ImageModalityLiteral]);

const GoogleChatModelTextToolModalities: ChatModelSchemaType["modalities"] = [
  TextModalityLiteral,
  ToolCallModalityLiteral,
  ToolResponseModalityLiteral,
];

const GoogleChatModelTextToolModalitiesEnum = z.enum([TextModalityLiteral, ToolCallModalityLiteral, ToolResponseModalityLiteral]);

export {
  GoogleChatModelModalitiesEnum,
  GoogleChatModelModalities,
  GoogleChatModelTextModalitiesEnum,
  GoogleChatModelTextModalities,
  GoogleChatModelTextToolModalitiesEnum,
  GoogleChatModelTextToolModalities,
  GoogleChatModelTextVisionModalitiesEnum,
  GoogleChatModelTextVisionModalities,
};
