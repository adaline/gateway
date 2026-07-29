import { z } from "zod";

import {
  logProbs,
  maxTokens,
  reasoningEffortAgentCount,
  reasoningEffortLowMediumHigh,
  reasoningEffortNoneLow,
  seed,
  temperature,
  toolChoice,
  topLogProbs,
  topP,
} from "./common.config.chat-model.xai";

const ChatModelReasoningConfigSchema = (maxOutputTokens: number) =>
  z.object({
    temperature: temperature.schema,
    maxTokens: maxTokens(maxOutputTokens).schema,
    topP: topP.schema,
    seed: seed.schema.transform((value) => (value === 0 ? undefined : value)),
    logProbs: logProbs.schema,
    topLogProbs: topLogProbs.schema,
    toolChoice: toolChoice.schema,
  });

const ChatModelReasoningConfigDef = (maxOutputTokens: number) =>
  ({
    temperature: temperature.def,
    maxTokens: maxTokens(maxOutputTokens).def,
    topP: topP.def,
    seed: seed.def,
    logProbs: logProbs.def,
    topLogProbs: topLogProbs.def,
    toolChoice: toolChoice.def,
  }) as const;

// grok-4.3 documents a reasoning_effort control confirmed for values 'none' and 'low' only
// (see spec-reference comment in grok-4.3.xai.ts); higher effort levels are unverified,
// so this variant reuses the 'reasoning_effort' wire param but scopes its choices accordingly.
const ChatModelReasoningEffortConfigSchema = (maxOutputTokens: number) =>
  z.object({
    temperature: temperature.schema,
    maxTokens: maxTokens(maxOutputTokens).schema,
    topP: topP.schema,
    seed: seed.schema.transform((value) => (value === 0 ? undefined : value)),
    logProbs: logProbs.schema,
    topLogProbs: topLogProbs.schema,
    toolChoice: toolChoice.schema,
    reasoningEffort: reasoningEffortNoneLow.schema,
  });

const ChatModelReasoningEffortConfigDef = (maxOutputTokens: number) =>
  ({
    temperature: temperature.def,
    maxTokens: maxTokens(maxOutputTokens).def,
    topP: topP.def,
    seed: seed.def,
    logProbs: logProbs.def,
    topLogProbs: topLogProbs.def,
    toolChoice: toolChoice.def,
    reasoningEffort: reasoningEffortNoneLow.def,
  }) as const;

// grok-4.5 exposes reasoning_effort as 'low' / 'medium' / 'high' (default 'high'); the control
// cannot be disabled, so this variant omits 'none'.
// See https://docs.x.ai/developers/model-capabilities/text/reasoning (retrieved 2026-07-29)
const ChatModelReasoningEffortLowMediumHighConfigSchema = (maxOutputTokens: number) =>
  z.object({
    temperature: temperature.schema,
    maxTokens: maxTokens(maxOutputTokens).schema,
    topP: topP.schema,
    seed: seed.schema.transform((value) => (value === 0 ? undefined : value)),
    logProbs: logProbs.schema,
    topLogProbs: topLogProbs.schema,
    toolChoice: toolChoice.schema,
    reasoningEffort: reasoningEffortLowMediumHigh.schema,
  });

const ChatModelReasoningEffortLowMediumHighConfigDef = (maxOutputTokens: number) =>
  ({
    temperature: temperature.def,
    maxTokens: maxTokens(maxOutputTokens).def,
    topP: topP.def,
    seed: seed.def,
    logProbs: logProbs.def,
    topLogProbs: topLogProbs.def,
    toolChoice: toolChoice.def,
    reasoningEffort: reasoningEffortLowMediumHigh.def,
  }) as const;

// grok-4.20-multi-agent-0309 exposes reasoning_effort as 'low' / 'medium' / 'high' / 'xhigh',
// where the value picks the agent count (4 or 16) instead of reasoning depth, and no default
// is documented.
// See https://docs.x.ai/developers/model-capabilities/text/multi-agent (retrieved 2026-07-29)
const ChatModelReasoningEffortAgentCountConfigSchema = (maxOutputTokens: number) =>
  z.object({
    temperature: temperature.schema,
    maxTokens: maxTokens(maxOutputTokens).schema,
    topP: topP.schema,
    seed: seed.schema.transform((value) => (value === 0 ? undefined : value)),
    logProbs: logProbs.schema,
    topLogProbs: topLogProbs.schema,
    toolChoice: toolChoice.schema,
    reasoningEffort: reasoningEffortAgentCount.schema,
  });

const ChatModelReasoningEffortAgentCountConfigDef = (maxOutputTokens: number) =>
  ({
    temperature: temperature.def,
    maxTokens: maxTokens(maxOutputTokens).def,
    topP: topP.def,
    seed: seed.def,
    logProbs: logProbs.def,
    topLogProbs: topLogProbs.def,
    toolChoice: toolChoice.def,
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
};
