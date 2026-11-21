import { ChatModelBaseConfigDef, ChatModelBaseConfigSchema } from "./base.config.chat-model.groq";
import { reasoningEffortLowMediumHigh, reasoningEffortNoneLowMediumHigh } from "./common.config.chat-model.groq";

// gpt-oss-20b / gpt-oss-120b / gpt-oss-safeguard-20b: base params plus reasoning_effort
// 'low' / 'medium' / 'high', with no documented default.
// See https://console.groq.com/docs/reasoning (retrieved 2026-11-20)
const ChatModelReasoningEffortLowMediumHighConfigDef = (maxOutputTokens: number) =>
  ({
    ...ChatModelBaseConfigDef(maxOutputTokens),
    reasoningEffort: reasoningEffortLowMediumHigh.def,
  }) as const;

const ChatModelReasoningEffortLowMediumHighConfigSchema = (maxOutputTokens: number) =>
  ChatModelBaseConfigSchema(maxOutputTokens).extend({
    reasoningEffort: reasoningEffortLowMediumHigh.schema,
  });

// qwen3.8-27b: base params plus reasoning_effort 'none' / 'low' / 'medium' / 'high', with no
// documented default. Groq's extra 'default' value is intentionally not exposed.
// See https://console.groq.com/docs/model/qwen/qwen3.8-27b (retrieved 2026-11-20)
const ChatModelReasoningEffortNoneLowMediumHighConfigDef = (maxOutputTokens: number) =>
  ({
    ...ChatModelBaseConfigDef(maxOutputTokens),
    reasoningEffort: reasoningEffortNoneLowMediumHigh.def,
  }) as const;

const ChatModelReasoningEffortNoneLowMediumHighConfigSchema = (maxOutputTokens: number) =>
  ChatModelBaseConfigSchema(maxOutputTokens).extend({
    reasoningEffort: reasoningEffortNoneLowMediumHigh.schema,
  });

export {
  ChatModelReasoningEffortLowMediumHighConfigDef,
  ChatModelReasoningEffortLowMediumHighConfigSchema,
  ChatModelReasoningEffortNoneLowMediumHighConfigDef,
  ChatModelReasoningEffortNoneLowMediumHighConfigSchema,
};
