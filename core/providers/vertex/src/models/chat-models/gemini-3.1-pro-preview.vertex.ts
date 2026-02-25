import { z } from "zod";

import {
  GoogleChatModelConfigs,
  GoogleChatModelModalities,
  GoogleChatModelModalitiesEnum,
  GoogleChatModelRoles,
  GoogleChatModelRolesMap,
} from "@adaline/google";
import { ChatModelSchema } from "@adaline/provider";

import pricingData from "../pricing.json";
import { BaseChatModelOptions, BaseChatModelVertex } from "./base-chat-model.vertex";

// Specs reference: https://cloud.google.com/vertex-ai/generative-ai/docs/models/model-versions (retrieved 2026-02-25)
const Gemini3_1ProPreviewLiteral = "gemini-3.1-pro-preview" as const;
const Gemini3_1ProPreviewDescription =
  "Google's Gemini 3.1 Pro Preview model on Vertex AI with improved reasoning and multimodal performance for complex agentic tasks.";

const Gemini3_1ProPreviewSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini3_1ProPreviewLiteral,
  description: Gemini3_1ProPreviewDescription,
  maxInputTokens: 1048576,
  maxOutputTokens: 65536,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.reasoning(2.0, 1.0, 65536, 4, 0.95, 1, 65536).def,
    schema: GoogleChatModelConfigs.reasoning(2.0, 1.0, 65536, 4, 0.95, 1, 65536).schema,
  },
  price: pricingData[Gemini3_1ProPreviewLiteral],
});

const Gemini3_1ProPreviewOptions = BaseChatModelOptions;
type Gemini3_1ProPreviewOptionsType = z.infer<typeof Gemini3_1ProPreviewOptions>;

class Gemini3_1ProPreview extends BaseChatModelVertex {
  constructor(options: Gemini3_1ProPreviewOptionsType) {
    super(Gemini3_1ProPreviewSchema, options);
  }
}

export {
  Gemini3_1ProPreview,
  Gemini3_1ProPreviewLiteral,
  Gemini3_1ProPreviewOptions,
  Gemini3_1ProPreviewSchema,
  type Gemini3_1ProPreviewOptionsType,
};
