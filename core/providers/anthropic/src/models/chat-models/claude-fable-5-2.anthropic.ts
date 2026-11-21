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
// Requires 30-day data retention; not available under zero data retention.
const ClaudeFable5_2Literal = "claude-fable-5-2";
const ClaudeFable5_2Description =
  "For demanding reasoning and long-horizon agentic work, with always-on adaptive thinking. Features a 1M token context window and 128K max output tokens. Training cutoff: June 2026.";

const ClaudeFable5_2Config = AnthropicChatModelConfigs.adaptiveThinking({
  maxOutputTokens: 128000,
  maxSequences: 4,
  thinkingModes: ["adaptive"],
  defaultThinkingMode: "adaptive",
  effortLevels: ["low", "medium", "high", "xhigh", "max"],
  defaultEffort: "high",
  samplingParams: false,
  forcedToolUse: false,
});

const ClaudeFable5_2Schema = ChatModelSchema(AnthropicChatModelRoles, AnthropicThinkingChatModelModalitiesEnum).parse({
  name: ClaudeFable5_2Literal,
  description: ClaudeFable5_2Description,
  maxInputTokens: 1000000,
  maxOutputTokens: 128000,
  maxReasoningTokens: 128000,
  roles: AnthropicChatModelRolesMap,
  modalities: AnthropicThinkingChatModelModalities,
  config: {
    def: ClaudeFable5_2Config.def,
    schema: ClaudeFable5_2Config.schema,
  },
  price: pricingData[ClaudeFable5_2Literal],
});

const ClaudeFable5_2Options = BaseChatModelOptions;
type ClaudeFable5_2OptionsType = z.infer<typeof ClaudeFable5_2Options>;

class ClaudeFable5_2 extends BaseChatModel {
  constructor(options: ClaudeFable5_2OptionsType) {
    super(ClaudeFable5_2Schema, options);
  }
}

export { ClaudeFable5_2, ClaudeFable5_2Literal, ClaudeFable5_2Options, ClaudeFable5_2Schema, type ClaudeFable5_2OptionsType };
