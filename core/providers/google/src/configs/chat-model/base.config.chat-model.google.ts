import { z } from "zod";

import { maxTokens, safetySettings, stop, temperature, toolChoice, topP } from "./common.config.chat-model.google";

const ChatModelBaseConfigSchema = (
  maxTemperature: number,
  defaultTemperature: number,
  maxOutputTokens: number,
  maxSequences: number,
  defaultTopP: number
) =>
  z.object({
    temperature: temperature(maxTemperature, defaultTemperature).schema,
    maxTokens: maxTokens(maxOutputTokens).schema,
    stop: stop(maxSequences).schema,
    topP: topP(defaultTopP).schema,
    toolChoice: toolChoice.schema,
    safetySettings: safetySettings.schema,
  });

const ChatModelBaseConfigDef = (
  maxTemperature: number,
  defaultTemperature: number,
  maxOutputTokens: number,
  maxSequences: number,
  defaultTopP: number
) =>
  ({
    temperature: temperature(maxTemperature, defaultTemperature).def,
    maxTokens: maxTokens(maxOutputTokens).def,
    stop: stop(maxSequences).def,
    topP: topP(defaultTopP).def,
    toolChoice: toolChoice.def,
    safetySettings: safetySettings.def,
  }) as const;

export { ChatModelBaseConfigDef, ChatModelBaseConfigSchema };
