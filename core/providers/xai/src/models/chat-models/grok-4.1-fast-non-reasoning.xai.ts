import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { XAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.xai";
import { XAIChatModelTextToolModalities, XAIChatModelTextToolModalitiesEnum, XAIChatModelRoles, XAIChatModelRolesMap } from "./types";

const Grok_4_1_Fast_Non_Reasoning_Literal = "grok-4.1-fast-non-reasoning";
const Grok_4_1_Fast_Non_Reasoning_Description =
  "Grok-4.1 Fast Non-Reasoning is xAI's updated fast model without reasoning capabilities with a 2M context window.";

const Grok_4_1_Fast_Non_Reasoning_Schema = ChatModelSchema(XAIChatModelRoles, XAIChatModelTextToolModalitiesEnum).parse({
  name: Grok_4_1_Fast_Non_Reasoning_Literal,
  description: Grok_4_1_Fast_Non_Reasoning_Description,
  maxInputTokens: 2097152,
  maxOutputTokens: 131072,
  roles: XAIChatModelRolesMap,
  modalities: XAIChatModelTextToolModalities,
  config: {
    def: XAIChatModelConfigs.ChatModelResponseSchemaConfigDef(131072, 4),
    schema: XAIChatModelConfigs.ChatModelResponseSchemaConfigSchema(131072, 4),
  },
  price: pricingData["grok-4.1-fast-non-reasoning"],
});

const Grok_4_1_Fast_Non_Reasoning_Options = BaseChatModelOptions;
type Grok_4_1_Fast_Non_Reasoning_OptionsType = z.infer<typeof Grok_4_1_Fast_Non_Reasoning_Options>;

class Grok_4_1_Fast_Non_Reasoning extends BaseChatModel {
  constructor(options: Grok_4_1_Fast_Non_Reasoning_OptionsType) {
    super(Grok_4_1_Fast_Non_Reasoning_Schema, options);
  }
}

export { Grok_4_1_Fast_Non_Reasoning, Grok_4_1_Fast_Non_Reasoning_Literal, Grok_4_1_Fast_Non_Reasoning_Options, Grok_4_1_Fast_Non_Reasoning_Schema, type Grok_4_1_Fast_Non_Reasoning_OptionsType };
