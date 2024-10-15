import {
  OpenAIChatModelConfigs,
  OpenAIChatModelModalities,
  OpenAIChatModelModalitiesEnum,
  OpenAIChatModelRoles,
  OpenAIChatModelRolesMap,
} from "@adaline/openai";
import { ChatModelSchema } from "@adaline/provider";

const BaseChatModelSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: "__base__",
  description: "Base chat model for Azure OpenAI",
  maxInputTokens: 128000,
  maxOutputTokens: 128000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: OpenAIChatModelConfigs.base(128000, 4).def,
    schema: OpenAIChatModelConfigs.base(128000, 4).schema,
  },
});

export { BaseChatModelSchema };
