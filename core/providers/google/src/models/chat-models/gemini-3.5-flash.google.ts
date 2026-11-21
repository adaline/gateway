import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

// Specs reference: https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash (retrieved 2026-06-09)
// Specs reference: https://aistudio.google.com/docs/changelog (retrieved 2026-11-20)
// Kept (not removed) because @adaline/vertex imports this schema; Vertex still serves gemini-3.5-flash.
// pricing.json retains the last published rate ($1.50/$9.00) since the model is no longer on the pricing page.
const Gemini3_5FlashLiteral = "gemini-3.5-flash";
const Gemini3_5FlashDescription =
  "Google's Gemini 3.5 Flash model for sustained frontier performance on agentic and coding tasks at high speed. \
  A thinking model with enhanced multimodal understanding, reasoning, and advanced coding capabilities. \
  Supports Text, Image, Video, Audio, and PDF inputs. Knowledge cutoff: January 2025. \
  Deprecated; API requests auto-route to gemini-3.6-flash since 2026-10-08; no longer on the pricing page.";

const Gemini3_5FlashSchema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini3_5FlashLiteral,
  description: Gemini3_5FlashDescription,
  maxInputTokens: 1048576,
  maxOutputTokens: 65536,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.reasoning(2.0, 1.0, 65536, 4, 0.95, 1, 65536).def,
    schema: GoogleChatModelConfigs.reasoning(2.0, 1.0, 65536, 4, 0.95, 1, 65536).schema,
  },
  price: pricingData[Gemini3_5FlashLiteral],
});

const Gemini3_5FlashOptions = BaseChatModelOptions;
type Gemini3_5FlashOptionsType = z.infer<typeof Gemini3_5FlashOptions>;

class Gemini3_5Flash extends BaseChatModel {
  constructor(options: Gemini3_5FlashOptionsType) {
    super(Gemini3_5FlashSchema, options);
  }
}

export { Gemini3_5Flash, Gemini3_5FlashLiteral, Gemini3_5FlashOptions, Gemini3_5FlashSchema, type Gemini3_5FlashOptionsType };
