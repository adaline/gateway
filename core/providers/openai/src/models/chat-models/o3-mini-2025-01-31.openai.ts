import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { OpenAIChatModelConfigs } from "../../configs";
import { BaseChatModelOptions, BaseChatModel } from "./base-chat-model.openai";
import { OpenAIChatModelTextToolModalities, OpenAIChatModelTextToolModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "./types";

const O3Mini2025_01_31Literal = "o3-mini-2025-01-31";
const O3Mini2025_01_31Description =
  "o3-mini is the newest small reasoning model, providing high intelligence at the same cost and latency targets of o1-mini. Training data up to Sep 2023.";

const O3Mini2025_01_31Schema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelTextToolModalitiesEnum).parse({
  name: O3Mini2025_01_31Literal,
  description: O3Mini2025_01_31Description,
  maxInputTokens: 200000,
  maxOutputTokens: 100000,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelTextToolModalities,
  config: {
    def: OpenAIChatModelConfigs.oSeries(100000, 4).def,
    schema: OpenAIChatModelConfigs.oSeries(100000, 4).schema,
  },
});

const O3Mini2025_01_31Options = BaseChatModelOptions;
type O3Mini2025_01_31OptionsType = z.infer<typeof O3Mini2025_01_31Options>;

class O3Mini2025_01_31 extends BaseChatModel {
  constructor(options: O3Mini2025_01_31OptionsType) {
    super(O3Mini2025_01_31Schema, options);
  }
}

export { O3Mini2025_01_31, O3Mini2025_01_31Literal, O3Mini2025_01_31Options, O3Mini2025_01_31Schema, type O3Mini2025_01_31OptionsType };
