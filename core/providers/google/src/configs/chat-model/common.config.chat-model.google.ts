import { z } from "zod";

import { CHAT_CONFIG, MultiStringConfigItem, ObjectSchemaConfigItem, RangeConfigItem, SelectStringConfigItem } from "@adaline/provider";

const temperature = (max: number, _default: number) =>
  RangeConfigItem({
    param: "temperature",
    title: CHAT_CONFIG.TEMPERATURE.title,
    description: CHAT_CONFIG.TEMPERATURE.description,
    min: 0.0,
    max: max,
    step: 0.01,
    default: _default,
  });

const maxTokens = (maxOutputTokens: number) =>
  RangeConfigItem({
    param: "maxOutputTokens",
    title: CHAT_CONFIG.MAX_TOKENS.title,
    description: CHAT_CONFIG.MAX_TOKENS.description,
    min: 0,
    max: maxOutputTokens,
    step: 1,
    default: 0,
  });

const stop = (maxSequences: number) =>
  MultiStringConfigItem({
    param: "stopSequences",
    title: CHAT_CONFIG.STOP(maxSequences).title,
    description: CHAT_CONFIG.STOP(maxSequences).description,
    max: maxSequences,
  });

const topP = (_default: number) =>
  RangeConfigItem({
    param: "topP",
    title: CHAT_CONFIG.TOP_P.title,
    description: CHAT_CONFIG.TOP_P.description,
    min: 0,
    max: 1,
    step: 0.01,
    default: _default,
  });

const topK = (_default: number) =>
  RangeConfigItem({
    param: "topK",
    title: CHAT_CONFIG.TOP_K.title,
    description: CHAT_CONFIG.TOP_K.description,
    min: 1,
    max: 40,
    step: 1,
    default: _default,
  });

const frequencyPenalty = RangeConfigItem({
  param: "frequencyPenalty",
  title: CHAT_CONFIG.FREQUENCY_PENALTY.title,
  description: CHAT_CONFIG.FREQUENCY_PENALTY.description,
  min: -2,
  max: 2,
  step: 0.01,
  default: 0,
});

const presencePenalty = RangeConfigItem({
  param: "presencePenalty",
  title: CHAT_CONFIG.PRESENCE_PENALTY.title,
  description: CHAT_CONFIG.PRESENCE_PENALTY.description,
  min: -2,
  max: 2,
  step: 0.01,
  default: 0,
});

const seed = RangeConfigItem({
  param: "seed",
  title: CHAT_CONFIG.SEED.title,
  description: CHAT_CONFIG.SEED.description,
  min: 0,
  max: 1000000,
  step: 1,
  default: 0,
});

const toolChoice = SelectStringConfigItem({
  param: "toolChoice",
  title: "Tool choice",
  description:
    "Controls which (if any) tool is called by the model. 'none' means the model will not call a function. 'auto' means the model can pick between generating a message or calling a tool.",
  default: "auto",
  choices: ["auto", "any", "none"],
});

const safetySettings = ObjectSchemaConfigItem({
  param: "safetySettings",
  title: "Safety settings",
  description: "The safety rating contains the category of harm and the harm probability level in that category for a piece of content.",
  objectSchema: z.array(
    z.object({
      threshold: z.enum([
        "HARM_BLOCK_THRESHOLD_UNSPECIFIED",
        "BLOCK_LOW_AND_ABOVE",
        "BLOCK_MEDIUM_AND_ABOVE",
        "BLOCK_ONLY_HIGH",
        "BLOCK_NONE",
        "OFF",
      ]),
      category: z.enum([
        "HARM_CATEGORY_UNSPECIFIED",
        "HARM_CATEGORY_HARASSMENT",
        "HARM_CATEGORY_HATE_SPEECH",
        "HARM_CATEGORY_SEXUALLY_EXPLICIT",
        "HARM_CATEGORY_DANGEROUS_CONTENT",
        "HARM_CATEGORY_CIVIC_INTEGRITY",
      ]),
    })
  ),
});

export { maxTokens, stop, temperature, toolChoice, topK, topP, seed, frequencyPenalty, presencePenalty, safetySettings };
