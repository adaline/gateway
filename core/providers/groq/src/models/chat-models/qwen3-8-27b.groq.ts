import { z } from "zod";

import {
  OpenAIChatModelRoles,
  OpenAIChatModelRolesMap,
  OpenAIChatModelTextToolModalities,
  OpenAIChatModelTextToolModalitiesEnum,
} from "@adaline/openai";
import { ChatModelSchema } from "@adaline/provider";

import { GroqChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModelGroq, BaseChatModelOptions } from "./base-chat-model.groq";

// Specs reference: https://console.groq.com/docs/model/qwen/qwen3.8-27b, https://console.groq.com/docs/models (retrieved 2026-11-20)
// Preview: listed in Groq's Preview Models table, not production.
// Note: Qwen3.8 27B accepts text + image input upstream, but Groq has no existing
// vision/image-modality precedent in this provider's chat models, so this model is registered with the
// same text+tool modalities as its sibling models rather than introducing new modality plumbing.
// reasoning_effort: 'none' / 'low' / 'medium' / 'high' with no documented default; Groq's extra
// 'default' value is not exposed. See https://console.groq.com/docs/reasoning (retrieved 2026-11-20)
const Qwen3_8_27bLiteral = "qwen/qwen3.8-27b" as const;
const Qwen3_8_27bDescription =
  "Qwen3.8 27B is a 27B-parameter dense multimodal model from the Qwen series with agentic coding, reasoning, and long-horizon task capabilities. \
  It supports both thinking and instruct (non-thinking) modes within one model, with strong multilingual support. Direct successor to Qwen3.6 27B.";

const Qwen3_8_27bSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: Qwen3_8_27bLiteral,
  description: Qwen3_8_27bDescription,
  maxInputTokens: 131072,
  maxOutputTokens: 16384,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: GroqChatModelConfigs.reasoningEffortNoneLowMediumHigh(16384).def,
    schema: GroqChatModelConfigs.reasoningEffortNoneLowMediumHigh(16384).schema,
  },
  price: pricingData[Qwen3_8_27bLiteral],
});

const Qwen3_8_27b_Options = BaseChatModelOptions;
type Qwen3_8_27b_OptionsType = z.infer<typeof Qwen3_8_27b_Options>;

class Qwen3_8_27b extends BaseChatModelGroq {
  constructor(options: Qwen3_8_27b_OptionsType) {
    super(Qwen3_8_27bSchema, options);
  }
}

export { Qwen3_8_27b, Qwen3_8_27b_Options, Qwen3_8_27bLiteral, Qwen3_8_27bSchema, type Qwen3_8_27b_OptionsType };
