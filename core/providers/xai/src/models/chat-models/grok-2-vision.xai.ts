import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { XAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.xai";
import { XAIChatModelModalities, XAIChatModelModalitiesEnum, XAIChatModelRoles, XAIChatModelRolesMap } from "./types";

const Grok_2_Vision_Literal = "grok-2-vision";
const Grok_2_Vision_Description =
  "Grok-2 Vision is xAI's multimodal model with image understanding capabilities and a 32K context window.";

const Grok_2_Vision_Schema = ChatModelSchema(XAIChatModelRoles, XAIChatModelModalitiesEnum).parse({
  name: Grok_2_Vision_Literal,
  description: Grok_2_Vision_Description,
  maxInputTokens: 32768,
  maxOutputTokens: 8192,
  roles: XAIChatModelRolesMap,
  modalities: XAIChatModelModalities,
  config: {
    def: XAIChatModelConfigs.ChatModelResponseSchemaConfigDef(8192, 4),
    schema: XAIChatModelConfigs.ChatModelResponseSchemaConfigSchema(8192, 4),
  },
  price: pricingData[Grok_2_Vision_Literal],
});

const Grok_2_Vision_Options = BaseChatModelOptions;
type Grok_2_Vision_OptionsType = z.infer<typeof Grok_2_Vision_Options>;

class Grok_2_Vision extends BaseChatModel {
  constructor(options: Grok_2_Vision_OptionsType) {
    super(Grok_2_Vision_Schema, options);
  }
}

export { Grok_2_Vision, Grok_2_Vision_Literal, Grok_2_Vision_Options, Grok_2_Vision_Schema, type Grok_2_Vision_OptionsType };
