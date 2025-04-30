import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import { BaseChatModelOptions, BaseChatModel } from "./base-chat-model.openai";
import { OpenAIChatModelTextToolModalities, OpenAIChatModelTextToolModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

const O3MiniLiteral = "o3-mini";
const O3MiniDescription =
  "o3-mini is the newest small reasoning model, providing high intelligence at the same cost and latency targets of o1-mini. Training data up to Sep 2023.";

const O3MiniSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: O3MiniLiteral,
  description: O3MiniDescription,
  maxInputTokens: 200000,
  maxOutputTokens: 100000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: OpenAIChatModelConfigs.oSeries(100000, 4).def,
    schema: OpenAIChatModelConfigs.oSeries(100000, 4).schema,
  },
});

const O3MiniOptions = BaseChatModelOptions;
type O3MiniOptionsType = z.infer<typeof O3MiniOptions>;

class O3Mini extends BaseChatModel {
  constructor(options: O3MiniOptionsType) {
    super(O3MiniSchema, options);
  }
}

export { O3Mini, O3MiniLiteral, O3MiniOptions, O3MiniSchema, type O3MiniOptionsType };
