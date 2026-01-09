import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { XAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.xai";
import { XAIChatModelTextToolModalities, XAIChatModelTextToolModalitiesEnum, XAIChatModelRoles, XAIChatModelRolesMap } from "./types";

const Grok_3_Mini_Beta_Literal = "grok-3-mini-beta";
const Grok_3_Mini_Beta_Description =
  "Grok-3 Mini Beta is xAI's lightweight reasoning model with support for reasoning_effort parameter and a 131K context window.";

const Grok_3_Mini_Beta_Schema = ChatModelSchema(XAIChatModelRoles, XAIChatModelTextToolModalitiesEnum).parse({
  name: Grok_3_Mini_Beta_Literal,
  description: Grok_3_Mini_Beta_Description,
  maxInputTokens: 131072,
  maxOutputTokens: 131072,
  roles: XAIChatModelRolesMap,
  modalities: XAIChatModelTextToolModalities,
  config: {
    def: XAIChatModelConfigs.ChatModelMiniReasoningConfigDef(131072),
    schema: XAIChatModelConfigs.ChatModelMiniReasoningConfigSchema(131072, 4),
  },
  price: pricingData[Grok_3_Mini_Beta_Literal],
});

const Grok_3_Mini_Beta_Options = BaseChatModelOptions;
type Grok_3_Mini_Beta_OptionsType = z.infer<typeof Grok_3_Mini_Beta_Options>;

class Grok_3_Mini_Beta extends BaseChatModel {
  constructor(options: Grok_3_Mini_Beta_OptionsType) {
    super(Grok_3_Mini_Beta_Schema, options);
  }
}

export { Grok_3_Mini_Beta, Grok_3_Mini_Beta_Literal, Grok_3_Mini_Beta_Options, Grok_3_Mini_Beta_Schema, type Grok_3_Mini_Beta_OptionsType };
