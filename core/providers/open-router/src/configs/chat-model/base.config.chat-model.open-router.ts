import { z } from "zod";

import {
  frequencyPenalty,
  logProbs,
  maxTokens,
  presencePenalty,
  seed,
  stop,
  temperature,
  toolChoice,
  topLogProbs,
  topP,
} from "./common.config.chat-model.open-router";

const ChatModelBaseConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  z.object({
    temperature: temperature.schema,
    maxTokens: maxTokens(maxOutputTokens).schema,
    stop: stop(maxSequences).schema,
    topP: topP.schema,
    frequencyPenalty: frequencyPenalty.schema,
    presencePenalty: presencePenalty.schema,
    seed: seed.schema.transform((value) => (value === 0 ? undefined : value)),
    logProbs: logProbs.schema,
    topLogProbs: topLogProbs.schema,
    toolChoice: toolChoice.schema,
  });

const ChatModelBaseConfigDef = (maxOutputTokens: number, maxSequences: number) =>
  ({
    temperature: temperature.def,
    maxTokens: maxTokens(maxOutputTokens).def,
    stop: stop(maxSequences).def,
    topP: topP.def,
    frequencyPenalty: frequencyPenalty.def,
    presencePenalty: presencePenalty.def,
    seed: seed.def,
    logProbs: logProbs.def,
    topLogProbs: topLogProbs.def,
    toolChoice: toolChoice.def,
  }) as const;

export { ChatModelBaseConfigDef, ChatModelBaseConfigSchema };
