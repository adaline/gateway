import { z } from "zod";

import {
  frequencyPenalty,
  maxTokens,
  presencePenalty,
  reasoningEffort5_6,
  reasoningEffortLowToMax,
  reasoningMode,
  seed,
  stop,
  toolChoice,
  verbosity,
  webSearchAllowedDomains,
  webSearchExternalAccessDefaultOff,
  webSearchTool,
} from "./common.config.chat-model.openai";
import {
  ChatModelGPT5_6WithWebSearchConfigDef,
  ChatModelGPT5_6WithWebSearchConfigSchema,
} from "./gpt5-6-with-web-search.config.chat-model.openai";
import { ChatModelResponseSchemaConfigDef, ChatModelResponseSchemaConfigSchema } from "./response-schema.config.chat-model.openai";

// Configs for the GPT-6 family (gpt-6, gpt-6.1, gpt-6.2). Like GPT-5.6, GPT-6 supports the
// independent reasoning mode (standard/pro) on the Responses API and is default-deny on live
// web access. See https://developers.openai.com/api/docs/guides/reasoning (retrieved 2026-11-20)

// GPT-6 models whose effort enum starts at 'none' (gpt-6-sol, gpt-6-luna, gpt-6.1-terra):
// none/low/medium/high/xhigh/max, default 'medium' — the same enum as GPT-5.6.
const ChatModelGPT6WithWebSearchConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelGPT5_6WithWebSearchConfigDef(maxOutputTokens, maxSequences),
  reasoningEffort: reasoningEffort5_6.def,
});

const ChatModelGPT6WithWebSearchConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelGPT5_6WithWebSearchConfigSchema(maxOutputTokens, maxSequences).extend({
    reasoningEffort: reasoningEffort5_6.schema,
  });

// GPT-6 models that always reason (gpt-6.1-sol, gpt-6.2-astra, gpt-6.2-sol):
// low/medium/high/xhigh/max, default 'medium'.
const ChatModelGPT6LowToMaxWithWebSearchConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  ...ChatModelGPT5_6WithWebSearchConfigDef(maxOutputTokens, maxSequences),
  reasoningEffort: reasoningEffortLowToMax.def,
});

const ChatModelGPT6LowToMaxWithWebSearchConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  ChatModelGPT5_6WithWebSearchConfigSchema(maxOutputTokens, maxSequences).extend({
    reasoningEffort: reasoningEffortLowToMax.schema,
  });

// gpt-6-astra: low..max effort, and per OpenAI's changelog it does NOT accept custom
// temperature, top_p or logprobs — so temperature, topP, logProbs and topLogProbs are omitted.
const ChatModelGPT6AstraWithWebSearchConfigDef = (maxOutputTokens: number, maxSequences: number) => ({
  maxTokens: maxTokens(maxOutputTokens).def,
  stop: stop(maxSequences).def,
  frequencyPenalty: frequencyPenalty.def,
  presencePenalty: presencePenalty.def,
  seed: seed.def,
  toolChoice: toolChoice.def,
  reasoningEffort: reasoningEffortLowToMax.def,
  reasoningMode: reasoningMode.def,
  verbosity: verbosity.def,
  responseFormat: ChatModelResponseSchemaConfigDef(maxOutputTokens, maxSequences).responseFormat,
  responseSchema: ChatModelResponseSchemaConfigDef(maxOutputTokens, maxSequences).responseSchema,
  webSearchTool: webSearchTool.def,
  webSearchAllowedDomains: webSearchAllowedDomains.def,
  webSearchExternalAccess: webSearchExternalAccessDefaultOff.def,
});

const ChatModelGPT6AstraWithWebSearchConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  z.object({
    maxTokens: maxTokens(maxOutputTokens).schema,
    stop: stop(maxSequences).schema,
    frequencyPenalty: frequencyPenalty.schema,
    presencePenalty: presencePenalty.schema,
    seed: seed.schema.transform((value) => (value === 0 ? undefined : value)),
    toolChoice: toolChoice.schema,
    reasoningEffort: reasoningEffortLowToMax.schema,
    reasoningMode: reasoningMode.schema,
    verbosity: verbosity.schema,
    responseFormat: ChatModelResponseSchemaConfigSchema(maxOutputTokens, maxSequences).shape.responseFormat,
    responseSchema: ChatModelResponseSchemaConfigSchema(maxOutputTokens, maxSequences).shape.responseSchema,
    webSearchTool: webSearchTool.schema,
    webSearchAllowedDomains: webSearchAllowedDomains.schema,
    webSearchExternalAccess: webSearchExternalAccessDefaultOff.schema,
  });

export {
  ChatModelGPT6AstraWithWebSearchConfigDef,
  ChatModelGPT6AstraWithWebSearchConfigSchema,
  ChatModelGPT6LowToMaxWithWebSearchConfigDef,
  ChatModelGPT6LowToMaxWithWebSearchConfigSchema,
  ChatModelGPT6WithWebSearchConfigDef,
  ChatModelGPT6WithWebSearchConfigSchema,
};
