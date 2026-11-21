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
// Adaptive thinking is always on. Rejects forced tool use (tool_choice 'any' or a named tool) with a 400 error.
const ClaudeFable5_1Literal = "claude-fable-5-1";
const ClaudeFable5_1Description =
  "Previous-generation Fable model for long-horizon agentic and coding work, with always-on adaptive thinking. Features a 1M token context window and 128K max output tokens. Training cutoff: June 2026.";

const ClaudeFable5_1Config = AnthropicChatModelConfigs.adaptiveThinking({
  maxOutputTokens: 128000,
  maxSequences: 4,
  thinkingModes: ["adaptive"],
  defaultThinkingMode: "adaptive",
  effortLevels: ["low", "medium", "high", "xhigh", "max"],
  defaultEffort: "high",
  samplingParams: false,
  forcedToolUse: false,
});

const ClaudeFable5_1Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: ClaudeFable5_1Literal,
  description: ClaudeFable5_1Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: ClaudeFable5_1Config.def,
    schema: ClaudeFable5_1Config.schema,
  },
  price: pricingData[ClaudeFable5_1Literal],
});

const ClaudeFable5_1Options = BaseChatModelOptions;
type ClaudeFable5_1OptionsType = z.infer<typeof ClaudeFable5_1Options>;

class ClaudeFable5_1 extends BaseChatModel {
  constructor(options: ClaudeFable5_1OptionsType) {
    super(ClaudeFable5_1Schema, options);
  }
}

export { ClaudeFable5_1, ClaudeFable5_1Literal, ClaudeFable5_1Options, ClaudeFable5_1Schema, type ClaudeFable5_1OptionsType };
