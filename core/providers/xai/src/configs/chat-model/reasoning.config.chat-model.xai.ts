import { z } from "zod";

import {
  maxTokens,
  reasoningEffortAgentCount,
  reasoningEffortLowMediumHigh,
  reasoningEffortLowMediumHighXhigh,
  reasoningEffortNoneLowMediumHighXhigh,
  seed,
  temperature,
  toolChoice,
  topP,
} from "./common.config.chat-model.xai";

// logprobs / top_logprobs are omitted from every variant below: xAI documents them as unsupported
// (silently ignored) on grok-4.20 and newer.

const ChatModelReasoningConfigSchema = (maxOutputTokens: number) =>
  z.object({
    temperature: temperature.schema,
    maxTokens: maxTokens(maxOutputTokens).schema,
    topP: topP.schema,
    seed: seed.schema.transform((value) => (value === 0 ? undefined : value)),
    toolChoice: toolChoice.schema,
  });

const ChatModelReasoningConfigDef = (maxOutputTokens: number) =>
  ({
    temperature: temperature.def,
    maxTokens: maxTokens(maxOutputTokens).def,
    topP: topP.def,
    seed: seed.def,
    toolChoice: toolChoice.def,
  }) as const;

// grok-4.3's model page lists reasoning_effort as 'none' / 'low' / 'medium' / 'high' / 'xhigh'
// with a 'low' default ('none' disables reasoning).
// See https://docs.x.ai/developers/models/grok-4.3 (retrieved 2026-11-20)
const ChatModelReasoningEffortConfigSchema = (maxOutputTokens: number) =>
  ChatModelReasoningConfigSchema(maxOutputTokens).extend({
    reasoningEffort: reasoningEffortNoneLowMediumHighXhigh.schema,
  });

const ChatModelReasoningEffortConfigDef = (maxOutputTokens: number) =>
  ({
    ...ChatModelReasoningConfigDef(maxOutputTokens),
    reasoningEffort: reasoningEffortNoneLowMediumHighXhigh.def,
  }) as const;

// grok-4.5 exposes reasoning_effort as 'low' / 'medium' / 'high' (default 'high'); the control
// cannot be disabled, so this variant omits 'none'.
// See https://docs.x.ai/developers/model-capabilities/text/reasoning (retrieved 2026-07-29)
const ChatModelReasoningEffortLowMediumHighConfigSchema = (maxOutputTokens: number) =>
  ChatModelReasoningConfigSchema(maxOutputTokens).extend({
    reasoningEffort: reasoningEffortLowMediumHigh.schema,
  });

const ChatModelReasoningEffortLowMediumHighConfigDef = (maxOutputTokens: number) =>
  ({
    ...ChatModelReasoningConfigDef(maxOutputTokens),
    reasoningEffort: reasoningEffortLowMediumHigh.def,
  }) as const;

// grok-4.7 and grok-4.6 expose reasoning_effort as 'low' / 'medium' / 'high' / 'xhigh' (default
// 'high'); reasoning is always on, so this variant omits 'none'.
// See https://docs.x.ai/developers/model-capabilities/text/reasoning (retrieved 2026-11-20)
const ChatModelReasoningEffortLowMediumHighXhighConfigSchema = (maxOutputTokens: number) =>
  ChatModelReasoningConfigSchema(maxOutputTokens).extend({
    reasoningEffort: reasoningEffortLowMediumHighXhigh.schema,
  });

const ChatModelReasoningEffortLowMediumHighXhighConfigDef = (maxOutputTokens: number) =>
  ({
    ...ChatModelReasoningConfigDef(maxOutputTokens),
    reasoningEffort: reasoningEffortLowMediumHighXhigh.def,
  }) as const;

// grok-4.20-multi-agent-0309 exposes reasoning_effort as 'low' / 'medium' / 'high' / 'xhigh',
// where the value picks the agent count (4 or 16) instead of reasoning depth, and no default
// is documented.
// See https://docs.x.ai/developers/model-capabilities/text/multi-agent (retrieved 2026-07-29)
const ChatModelReasoningEffortAgentCountConfigSchema = (maxOutputTokens: number) =>
  ChatModelReasoningConfigSchema(maxOutputTokens).extend({
    reasoningEffort: reasoningEffortAgentCount.schema,
  });

const ChatModelReasoningEffortAgentCountConfigDef = (maxOutputTokens: number) =>
  ({
    ...ChatModelReasoningConfigDef(maxOutputTokens),
    reasoningEffort: reasoningEffortAgentCount.def,
  }) as const;

export {
  ChatModelReasoningConfigDef,
  ChatModelReasoningConfigSchema,
  ChatModelReasoningEffortAgentCountConfigDef,
  ChatModelReasoningEffortAgentCountConfigSchema,
  ChatModelReasoningEffortConfigDef,
  ChatModelReasoningEffortConfigSchema,
  ChatModelReasoningEffortLowMediumHighConfigDef,
  ChatModelReasoningEffortLowMediumHighConfigSchema,
  ChatModelReasoningEffortLowMediumHighXhighConfigDef,
  ChatModelReasoningEffortLowMediumHighXhighConfigSchema,
};
