import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { XAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.xai";
import { XAIChatModelTextToolModalities, XAIChatModelTextToolModalitiesEnum, XAIChatModelRoles, XAIChatModelRolesMap } from "./types";

const Grok_2_Literal = "grok-2";
const Grok_2_Description =
  "Grok-2 is xAI's flagship language model with strong reasoning capabilities and a 131K context window.";

const Grok_2_Schema = ChatModelSchema(XAIChatModelRoles, XAIChatModelTextToolModalitiesEnum).parse({
  name: Grok_2_Literal,
  description: Grok_2_Description,
  maxInputTokens: 131072,
  maxOutputTokens: 32768,
  roles: XAIChatModelRolesMap,
  modalities: XAIChatModelTextToolModalities,
  config: {
    def: XAIChatModelConfigs.ChatModelResponseSchemaConfigDef(32768, 4),
    schema: XAIChatModelConfigs.ChatModelResponseSchemaConfigSchema(32768, 4),
  },
  price: pricingData[Grok_2_Literal],
});

const Grok_2_Options = BaseChatModelOptions;
type Grok_2_OptionsType = z.infer<typeof Grok_2_Options>;

class Grok_2 extends BaseChatModel {
  constructor(options: Grok_2_OptionsType) {
    super(Grok_2_Schema, options);
  }
}

export { Grok_2, Grok_2_Literal, Grok_2_Options, Grok_2_Schema, type Grok_2_OptionsType };
