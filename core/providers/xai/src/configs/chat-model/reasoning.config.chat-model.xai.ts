import { z } from "zod";

import {
  logProbs,
  maxTokens,
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

export {
  ChatModelReasoningConfigDef,
  ChatModelReasoningConfigSchema,
  ChatModelReasoningEffortConfigDef,
  ChatModelReasoningEffortConfigSchema,
};
