import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { XAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.xai";
import { XAIChatModelTextToolModalities, XAIChatModelTextToolModalitiesEnum, XAIChatModelRoles, XAIChatModelRolesMap } from "./types";

const Grok_2_1212_Literal = "grok-2-1212";
const Grok_2_1212_Description =
  "Grok-2 version 1212 is a specific release of xAI's Grok-2 model with a 131K context window.";

const Grok_2_1212_Schema = ChatModelSchema(XAIChatModelRoles, XAIChatModelTextToolModalitiesEnum).parse({
  name: Grok_2_1212_Literal,
  description: Grok_2_1212_Description,
  maxInputTokens: 131072,
  maxOutputTokens: 32768,
  roles: XAIChatModelRolesMap,
  modalities: XAIChatModelTextToolModalities,
  config: {
    def: XAIChatModelConfigs.ChatModelResponseSchemaConfigDef(32768, 4),
    schema: XAIChatModelConfigs.ChatModelResponseSchemaConfigSchema(32768, 4),
  },
  price: pricingData[Grok_2_1212_Literal],
});

const Grok_2_1212_Options = BaseChatModelOptions;
type Grok_2_1212_OptionsType = z.infer<typeof Grok_2_1212_Options>;

class Grok_2_1212 extends BaseChatModel {
  constructor(options: Grok_2_1212_OptionsType) {
    super(Grok_2_1212_Schema, options);
  }
}

export { Grok_2_1212, Grok_2_1212_Literal, Grok_2_1212_Options, Grok_2_1212_Schema, type Grok_2_1212_OptionsType };
