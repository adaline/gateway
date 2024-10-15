import { ChatModelSchema } from "@adaline/provider";

import { TogetherAIChatModelConfigs } from "../../configs";
import {
  TogetherAIChatModelModalities,
  TogetherAIChatModelModalitiesEnum,
  TogetherAIChatModelRoles,
  TogetherAIChatModelRolesMap,
} from "./types";

const BaseChatModelSchema = ChatModelSchema(TogetherAIChatModelRoles, TogetherAIChatModelModalitiesEnum).parse({
  name: "__base__",
  description: "Base chat model for Together AI",
  maxInputTokens: 128000,
  maxOutputTokens: 128000,
  roles: TogetherAIChatModelRolesMap,
  modalities: TogetherAIChatModelModalities,
  config: {
    def: TogetherAIChatModelConfigs.base(128000, 4).def,
    schema: TogetherAIChatModelConfigs.base(128000, 4).schema,
  },
});

export { BaseChatModelSchema };
