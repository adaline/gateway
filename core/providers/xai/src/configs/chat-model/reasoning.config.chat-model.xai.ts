import { z } from "zod";

import { logProbs, maxTokens, reasoningEffort, seed, temperature, toolChoice, topLogProbs, topP } from "./common.config.chat-model.xai";

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

const ChatModelMiniReasoningConfigSchema = (maxOutputTokens: number, _maxSequences: number) =>
  z.object({
    temperature: temperature.schema,
    maxTokens: maxTokens(maxOutputTokens).schema,
    topP: topP.schema,
    seed: seed.schema.transform((value) => (value === 0 ? undefined : value)),
    logProbs: logProbs.schema,
    topLogProbs: topLogProbs.schema,
    toolChoice: toolChoice.schema,
    reasoningEffort: reasoningEffort.schema,
  });

const ChatModelMiniReasoningConfigDef = (maxOutputTokens: number) =>
  ({
    temperature: temperature.def,
    maxTokens: maxTokens(maxOutputTokens).def,
    topP: topP.def,
    seed: seed.def,
    logProbs: logProbs.def,
    topLogProbs: topLogProbs.def,
    toolChoice: toolChoice.def,
    reasoningEffort: reasoningEffort.def,
  }) as const;

export {
  ChatModelMiniReasoningConfigDef,
  ChatModelMiniReasoningConfigSchema,
  ChatModelReasoningConfigDef,
  ChatModelReasoningConfigSchema,
};
