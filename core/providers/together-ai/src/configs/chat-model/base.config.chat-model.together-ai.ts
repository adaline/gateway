import { z } from "zod";

import {
  frequencyPenalty,
  logProbs,
  maxTokens,
  minP,
  presencePenalty,
  repetitionPenalty,
  responseFormat,
  responseSchema,
  seed,
  stop,
  temperature,
  toolChoice,
  topK,
  topP,
} from "./common.config.chat-model.together-ai";

const ChatModelBaseConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  z.object({
    temperature: temperature.schema,
    maxTokens: maxTokens(maxOutputTokens).schema,
    stop: stop(maxSequences).schema,
    topP: topP.schema,
    topK: topK.schema,
    minP: minP.schema,
    frequencyPenalty: frequencyPenalty.schema,
    presencePenalty: presencePenalty.schema,
    repetitionPenalty: repetitionPenalty.schema,
    seed: seed.schema.transform((value) => (value === 0 ? undefined : value)),
    logProbs: logProbs.schema,
    toolChoice: toolChoice.schema,
    responseSchema: responseSchema.schema,
    responseFormat: responseFormat.schema,
  });

const ChatModelBaseConfigDef = (maxOutputTokens: number, maxSequences: number) =>
  ({
    temperature: temperature.def,
    maxTokens: maxTokens(maxOutputTokens).def,
    stop: stop(maxSequences).def,
    topP: topP.def,
    topK: topK.def,
    minP: minP.def,
    frequencyPenalty: frequencyPenalty.def,
    presencePenalty: presencePenalty.def,
    repetitionPenalty: repetitionPenalty.def,
    seed: seed.def,
    logProbs: logProbs.def,
    toolChoice: toolChoice.def,
    responseSchema: responseSchema.def,
    responseFormat: responseFormat.def,
  }) as const;

export { ChatModelBaseConfigDef, ChatModelBaseConfigSchema };
