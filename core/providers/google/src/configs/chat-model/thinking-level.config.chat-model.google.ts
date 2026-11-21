import { z } from "zod";

import {
  googleSearchTool,
  GoogleThinkingLevelType,
  maxTokens,
  reasoningEnabled,
  safetySettings,
  stop,
  thinkingLevel,
  toolChoice,
} from "./common.config.chat-model.google";
import { responseFormat, responseSchema } from "./response-schema.config.chat-model.google";

/*
 * Config for Gemini 3.6+ models (gemini-3.5-flash-lite, gemini-3.6-flash, gemini-3.8-flash, Gemini 4 family):
 * - No temperature / topP / topK: deprecated on Gemini 3.6+ ("silently ignored"; "future generations return 400").
 * - No thinkingBudget: thinking is controlled by `thinking_level` only (Gemini 4 on Vertex returns HTTP 400 for
 *   thinking_budget and MINIMAL).
 * - Per-model thinking-level choices and UI default.
 * Removed keys are stripped (never sent), matching how other providers handle parameters a model does not accept.
 */
const ChatModelThinkingLevelConfigSchema = (
  maxOutputTokens: number,
  maxSequences: number,
  levels: readonly GoogleThinkingLevelType[],
  defaultLevel: GoogleThinkingLevelType
) =>
  z.object({
    maxTokens: maxTokens(maxOutputTokens).schema,
    stop: stop(maxSequences).schema,
    toolChoice: toolChoice.schema,
    safetySettings: safetySettings.schema,
    googleSearchTool: googleSearchTool.schema,
    responseFormat: responseFormat.schema,
    responseSchema: responseSchema.schema,
    reasoningEnabled: reasoningEnabled.schema,
    reasoningEffort: thinkingLevel(levels, defaultLevel).schema,
  });

const ChatModelThinkingLevelConfigDef = (
  maxOutputTokens: number,
  maxSequences: number,
  levels: readonly GoogleThinkingLevelType[],
  defaultLevel: GoogleThinkingLevelType
) =>
  ({
    maxTokens: maxTokens(maxOutputTokens).def,
    stop: stop(maxSequences).def,
    toolChoice: toolChoice.def,
    safetySettings: safetySettings.def,
    googleSearchTool: googleSearchTool.def,
    responseFormat: responseFormat.def,
    responseSchema: responseSchema.def,
    reasoningEnabled: reasoningEnabled.def,
    reasoningEffort: thinkingLevel(levels, defaultLevel).def,
  }) as const;

export { ChatModelThinkingLevelConfigDef, ChatModelThinkingLevelConfigSchema };
