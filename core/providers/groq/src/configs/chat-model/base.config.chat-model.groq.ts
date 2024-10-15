import { z } from "zod";

import {
  frequencyPenalty,
  maxTokens,
  presencePenalty,
  responseFormat,
  seed,
  stop,
  temperature,
  toolChoice,
  topP,
} from "./common.config.chat-model.groq";

const ChatModelBaseConfigSchema = (maxOutputTokens: number) =>
  z.object({
    temperature: temperature.schema,
    maxTokens: maxTokens(maxOutputTokens).schema,
    stop: stop.schema,
    topP: topP.schema,
    frequencyPenalty: frequencyPenalty.schema,
    presencePenalty: presencePenalty.schema,
    seed: seed.schema.transform((value) => (value === 0 ? undefined : value)),
    responseFormat: responseFormat.schema,
    toolChoice: toolChoice.schema,
  });

const ChatModelBaseConfigDef = (maxOutputTokens: number) =>
  ({
    temperature: temperature.def,
    maxTokens: maxTokens(maxOutputTokens).def,
    stop: stop.def,
    topP: topP.def,
    frequencyPenalty: frequencyPenalty.def,
    presencePenalty: presencePenalty.def,
    seed: seed.def,
    responseFormat: responseFormat.def,
    toolChoice: toolChoice.def,
  }) as const;

export { ChatModelBaseConfigDef, ChatModelBaseConfigSchema };
