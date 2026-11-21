import { z } from "zod";

import { SelectStringConfigItem } from "@adaline/provider";

import {
  maxTokens,
  mcp,
  mcpServers,
  stop,
  temperature,
  toolChoice,
  toolChoiceNoForcedTool,
  topK,
  topP,
} from "./common.config.chat-model.anthropic";

// Adaptive thinking (thinking: { type: "adaptive" }) with the effort parameter (output_config.effort).
// Reference: https://platform.claude.com/docs/en/build-with-claude/thinking and
// https://platform.claude.com/docs/en/build-with-claude/effort (retrieved 2026-11-20).
// These models reject thinking: { type: "enabled", budget_tokens } with a 400 error.

type AnthropicThinkingMode = "adaptive" | "disabled" | "between_tools";
type AnthropicEffortLevel = "low" | "medium" | "high" | "xhigh" | "max";

type AdaptiveThinkingConfigOptions = {
  maxOutputTokens: number;
  maxSequences: number;
  // thinking.type values the model accepts, per the per-model table in the thinking docs.
  thinkingModes: AnthropicThinkingMode[];
  defaultThinkingMode: AnthropicThinkingMode;
  effortLevels: AnthropicEffortLevel[];
  defaultEffort: AnthropicEffortLevel;
  // Claude Opus 4.7 and later reject non-default temperature / top_p / top_k with a 400 error.
  samplingParams: boolean;
  // Claude Opus 5.5, Sonnet 5.5, Fable 5.1 and Fable 5.2 reject forced tool use (tool_choice any / tool).
  forcedToolUse: boolean;
};

const thinkingMode = (choices: AnthropicThinkingMode[], defaultValue: AnthropicThinkingMode) =>
  SelectStringConfigItem({
    param: "thinking",
    title: "Thinking",
    description:
      "Controls whether the model thinks before responding. \
    'adaptive' lets the model decide when and how deeply to think, and returns summarized thinking. \
    'disabled' turns thinking off. 'between_tools' turns off up-front thinking but keeps progress updates between tool calls. \
    Some models reject 'disabled' or 'between_tools' at 'xhigh' or 'max' effort.",
    default: defaultValue,
    choices: choices,
  });

const effort = (choices: AnthropicEffortLevel[], defaultValue: AnthropicEffortLevel) =>
  SelectStringConfigItem({
    param: "effort",
    title: "Effort",
    description:
      "Controls how many tokens the model spends on the whole response, including thinking, text and tool calls. \
    Lower effort is faster and cheaper; higher effort is more thorough.",
    default: defaultValue,
    choices: choices,
  });

const ChatModelAdaptiveThinkingConfigDef = (options: AdaptiveThinkingConfigOptions) => {
  const toolChoiceItem = options.forcedToolUse ? toolChoice : toolChoiceNoForcedTool;
  return {
    maxTokens: maxTokens(options.maxOutputTokens).def,
    stop: stop(options.maxSequences).def,
    ...(options.samplingParams ? { temperature: temperature.def, topP: topP.def, topK: topK.def } : {}),
    toolChoice: toolChoiceItem.def,
    mcp: mcp.def,
    mcpServers: mcpServers.def,
    thinkingMode: thinkingMode(options.thinkingModes, options.defaultThinkingMode).def,
    reasoningEffort: effort(options.effortLevels, options.defaultEffort).def,
  };
};

const ChatModelAdaptiveThinkingConfigSchema = (options: AdaptiveThinkingConfigOptions) => {
  const toolChoiceItem = options.forcedToolUse ? toolChoice : toolChoiceNoForcedTool;
  return z.object({
    maxTokens: maxTokens(options.maxOutputTokens).schema,
    stop: stop(options.maxSequences).schema,
    ...(options.samplingParams ? { temperature: temperature.schema, topP: topP.schema, topK: topK.schema } : {}),
    toolChoice: toolChoiceItem.schema,
    mcp: mcp.schema,
    mcpServers: mcpServers.schema,
    thinkingMode: thinkingMode(options.thinkingModes, options.defaultThinkingMode).schema,
    reasoningEffort: effort(options.effortLevels, options.defaultEffort).schema,
  });
};

export {
  ChatModelAdaptiveThinkingConfigDef,
  ChatModelAdaptiveThinkingConfigSchema,
  effort,
  thinkingMode,
  type AdaptiveThinkingConfigOptions,
  type AnthropicEffortLevel,
  type AnthropicThinkingMode,
};
