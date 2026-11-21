import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { AnthropicChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.anthropic";
import {
  AnthropicChatModelRoles,
  AnthropicChatModelRolesMap,
  AnthropicThinkingChatModelModalities,
  AnthropicThinkingChatModelModalitiesEnum,
} from "./types";

// Specs reference: https://platform.claude.com/docs/en/about-claude/models/overview and https://platform.claude.com/docs/en/build-with-claude/thinking (retrieved 2026-11-20)
// Rejects 'disabled'; 'between_tools' turns off up-front thinking at 'high' effort or below. Rejects forced tool use with a 400 error.
const ClaudeSonnet5_5Literal = "claude-sonnet-5-5";
const ClaudeSonnet5_5Description =
  "The best combination of speed and intelligence, with adaptive thinking. Features a 1M token context window and 128K max output tokens. Training cutoff: June 2026.";

const ClaudeSonnet5_5Config = AnthropicChatModelConfigs.adaptiveThinking({
  maxOutputTokens: 128000,
  maxSequences: 4,
  thinkingModes: ["adaptive", "between_tools"],
  defaultThinkingMode: "adaptive",
  effortLevels: ["low", "medium", "high", "xhigh", "max"],
  defaultEffort: "high",
  samplingParams: false,
  forcedToolUse: false,
});

const ClaudeSonnet5_5Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: ClaudeSonnet5_5Literal,
  description: ClaudeSonnet5_5Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: ClaudeSonnet5_5Config.def,
    schema: ClaudeSonnet5_5Config.schema,
  },
  price: pricingData[ClaudeSonnet5_5Literal],
});

const ClaudeSonnet5_5Options = BaseChatModelOptions;
type ClaudeSonnet5_5OptionsType = z.infer<typeof ClaudeSonnet5_5Options>;

class ClaudeSonnet5_5 extends BaseChatModel {
  constructor(options: ClaudeSonnet5_5OptionsType) {
    super(ClaudeSonnet5_5Schema, options);
  }
}

export { ClaudeSonnet5_5, ClaudeSonnet5_5Literal, ClaudeSonnet5_5Options, ClaudeSonnet5_5Schema, type ClaudeSonnet5_5OptionsType };
