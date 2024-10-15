import { z } from "zod";

import {
  OpenAIChatModelRoles,
  OpenAIChatModelRolesMap,
  OpenAIChatModelTextToolModalities,
  OpenAIChatModelTextToolModalitiesEnum,
} from "@adaline/openai";
import { ChatModelSchema } from "@adaline/provider";

import { GroqChatModelConfigs } from "../../configs";
import { BaseChatModelGroq, BaseChatModelOptions } from "./base-chat-model.groq";

const Llama_3_8b_Tool_UseLiteral = "llama3-groq-8b-8192-tool-use-preview" as const;
// https://huggingface.co/Groq/Llama-3-Groq-8B-Tool-Use
const Llama_3_8b_Tool_UseDescription =
  "This is the 8B parameter version of the Llama 3 Groq Tool Use model, \
  specifically designed for advanced tool use and function calling tasks.";

const Llama_3_8b_Tool_UseSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: Llama_3_8b_Tool_UseLiteral,
  description: Llama_3_8b_Tool_UseDescription,
  maxInputTokens: 8192,
  maxOutputTokens: 4096,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: GroqChatModelConfigs.base(4096).def,
    schema: GroqChatModelConfigs.base(4096).schema,
  },
});

const Llama_3_8b_Tool_Use_Options = BaseChatModelOptions;
type Llama_3_8b_Tool_Use_OptionsType = z.infer<typeof Llama_3_8b_Tool_Use_Options>;

class Llama_3_8b_Tool_Use extends BaseChatModelGroq {
  constructor(options: Llama_3_8b_Tool_Use_OptionsType) {
    super(Llama_3_8b_Tool_UseSchema, options);
  }
}

export {
  Llama_3_8b_Tool_Use,
  Llama_3_8b_Tool_Use_Options,
  Llama_3_8b_Tool_UseSchema,
  Llama_3_8b_Tool_UseLiteral,
  type Llama_3_8b_Tool_Use_OptionsType,
};
