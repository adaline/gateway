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

// Specs reference: https://console.groq.com/docs/model/qwen/qwen3.6-27b, https://console.groq.com/docs/models (retrieved 2026-07-10)
// Note: Qwen3.6 27B accepts text + image input (up to 3 images) upstream, but Groq has no existing
// vision/image-modality precedent in this provider's chat models, so this model is registered with the
// same text+tool modalities as its sibling models rather than introducing new modality plumbing.
const Qwen3_6_27bLiteral = "qwen/qwen3.6-27b" as const;
const Qwen3_6_27bDescription =
  "Qwen3.6 27B is a 27B-parameter model from the Qwen series with flagship-level agentic coding and reasoning. \
  It supports dual-mode thinking (switchable thinking / non-thinking) and is strong at agentic coding, math \
  reasoning, and multimodal visual understanding.";

const Qwen3_6_27bSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: Qwen3_6_27bLiteral,
  description: Qwen3_6_27bDescription,
  maxInputTokens: 131072,
  maxOutputTokens: 32768,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: GroqChatModelConfigs.base(32768).def,
    schema: GroqChatModelConfigs.base(32768).schema,
  },
  price: pricingData[Qwen3_6_27bLiteral],
});

const Qwen3_6_27b_Options = BaseChatModelOptions;
type Qwen3_6_27b_OptionsType = z.infer<typeof Qwen3_6_27b_Options>;

class Qwen3_6_27b extends BaseChatModelGroq {
  constructor(options: Qwen3_6_27b_OptionsType) {
    super(Qwen3_6_27bSchema, options);
  }
}

export { Qwen3_6_27b, Qwen3_6_27b_Options, Qwen3_6_27bLiteral, Qwen3_6_27bSchema, type Qwen3_6_27b_OptionsType };
