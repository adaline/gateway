import { z } from "zod";

import {
  frequencyPenalty,
  maxTokens,
  presencePenalty,
  reasoningEnabled,
  safetySettings,
  seed,
  stop,
  temperature,
  toolChoice,
  topK,
  topP,
} from "./common.config.chat-model.google";

const ChatModelReasoningConfigSchema = (
  maxTemperature: number,
  defaultTemperature: number,
  maxOutputTokens: number,
  maxSequences: number,
  defaultTopP: number,
  defaultTopK: number
) =>
  z.object({
    temperature: temperature(maxTemperature, defaultTemperature).schema,
    maxTokens: maxTokens(maxOutputTokens).schema,
    stop: stop(maxSequences).schema,
    topP: topP(defaultTopP).schema,
    topK: topK(defaultTopK).schema,
    frequencyPenalty: frequencyPenalty.schema,
    presencePenalty: presencePenalty.schema,
    seed: seed.schema.transform((value) => (value === 0 ? undefined : value)),
    toolChoice: toolChoice.schema,
    safetySettings: safetySettings.schema,
    reasoningEnabled: reasoningEnabled.schema,
  });

const ChatModelReasoningConfigDef = (
  maxTemperature: number,
  defaultTemperature: number,
  maxOutputTokens: number,
  maxSequences: number,
  defaultTopP: number,
  defaultTopK: number
) =>
  ({
    temperature: temperature(maxTemperature, defaultTemperature).def,
    maxTokens: maxTokens(maxOutputTokens).def,
    stop: stop(maxSequences).def,
    topP: topP(defaultTopP).def,
    topK: topK(defaultTopK).def,
    frequencyPenalty: frequencyPenalty.def,
    presencePenalty: presencePenalty.def,
    seed: seed.def,
    toolChoice: toolChoice.def,
    safetySettings: safetySettings.def,
    reasoningEnabled: reasoningEnabled.def,
  }) as const;

export { ChatModelReasoningConfigDef, ChatModelReasoningConfigSchema };
