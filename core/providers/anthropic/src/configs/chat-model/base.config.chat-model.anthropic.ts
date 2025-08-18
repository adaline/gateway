import { z } from "zod";

import { maxTokens, mcpServers, stop, temperature, toolChoice, topK, topP } from "./common.config.chat-model.anthropic";

const ChatModelBaseConfigSchema = (maxOutputTokens: number, maxSequences: number) =>
  z.object({
    temperature: temperature.schema,
    maxTokens: maxTokens(maxOutputTokens).schema,
    stop: stop(maxSequences).schema,
    topP: topP.schema,
    topK: topK.schema,
    toolChoice: toolChoice.schema,
    mcpServers: mcpServers.schema,
  });

const ChatModelBaseConfigDef = (maxOutputTokens: number, maxSequences: number) =>
  ({
    temperature: temperature.def,
    maxTokens: maxTokens(maxOutputTokens).def,
    stop: stop(maxSequences).def,
    topP: topP.def,
    topK: topK.def,
    toolChoice: toolChoice.def,
    mcpServers: mcpServers.def,
  }) as const;

export { ChatModelBaseConfigDef, ChatModelBaseConfigSchema };
