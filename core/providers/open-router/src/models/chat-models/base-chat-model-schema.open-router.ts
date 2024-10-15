import { ChatModelSchema } from "@adaline/provider";

import { OpenRouterChatModelConfigs } from "../../configs";
import {
  OpenRouterChatModelModalities,
  OpenRouterChatModelModalitiesEnum,
  OpenRouterChatModelRoles,
  OpenRouterChatModelRolesMap,
} from "./types";

const BaseChatModelSchema = ChatModelSchema(OpenRouterChatModelRoles, OpenRouterChatModelModalitiesEnum).parse({
  name: "__base__",
  description: "Base chat model for Open Router",
  maxInputTokens: 128000,
  maxOutputTokens: 128000,
  roles: OpenRouterChatModelRolesMap,
  modalities: OpenRouterChatModelModalities,
  config: {
    def: OpenRouterChatModelConfigs.base(128000, 4).def,
    schema: OpenRouterChatModelConfigs.base(128000, 4).schema,
  },
});

export { BaseChatModelSchema };
