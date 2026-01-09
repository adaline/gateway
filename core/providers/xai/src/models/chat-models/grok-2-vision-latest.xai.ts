import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { XAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.xai";
import { XAIChatModelModalities, XAIChatModelModalitiesEnum, XAIChatModelRoles, XAIChatModelRolesMap } from "./types";

const Grok_2_Vision_Latest_Literal = "grok-2-vision-latest";
const Grok_2_Vision_Latest_Description =
  "Grok-2 Vision Latest is the most recent version of xAI's multimodal model with image understanding capabilities.";

const Grok_2_Vision_Latest_Schema = ChatModelSchema(XAIChatModelRoles, XAIChatModelModalitiesEnum).parse({
  name: Grok_2_Vision_Latest_Literal,
  description: Grok_2_Vision_Latest_Description,
  maxInputTokens: 32768,
  maxOutputTokens: 8192,
  roles: XAIChatModelRolesMap,
  modalities: XAIChatModelModalities,
  config: {
    def: XAIChatModelConfigs.ChatModelResponseSchemaConfigDef(8192, 4),
    schema: XAIChatModelConfigs.ChatModelResponseSchemaConfigSchema(8192, 4),
  },
  price: pricingData[Grok_2_Vision_Latest_Literal],
});

const Grok_2_Vision_Latest_Options = BaseChatModelOptions;
type Grok_2_Vision_Latest_OptionsType = z.infer<typeof Grok_2_Vision_Latest_Options>;

class Grok_2_Vision_Latest extends BaseChatModel {
  constructor(options: Grok_2_Vision_Latest_OptionsType) {
    super(Grok_2_Vision_Latest_Schema, options);
  }
}

export { Grok_2_Vision_Latest, Grok_2_Vision_Latest_Literal, Grok_2_Vision_Latest_Options, Grok_2_Vision_Latest_Schema, type Grok_2_Vision_Latest_OptionsType };
