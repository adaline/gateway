import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { XAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.xai";
import { XAIChatModelRoles, XAIChatModelRolesMap, XAIChatModelTextToolModalities, XAIChatModelTextToolModalitiesEnum } from "./types";

// spec-reference: https://docs.x.ai/docs/models, https://docs.x.ai/developers/models,
// https://docs.x.ai/developers/models/grok-build-0.1 (retrieved 2026-07-10)
// maxOutputTokens is not published by xAI docs; 131072 is carried from the grok-4.x family
// convention shared across the grok-4.x model family.
const Grok_Build_0_1_Literal = "grok-build-0.1";
const Grok_Build_0_1_Description =
  "Grok Build 0.1 is xAI's intelligent coding model for agentic software engineering and web-dev workflow tasks, successor to Grok Code Fast 1, with a 256K context window.";

const Grok_Build_0_1_Schema = ChatModelSchema(XAIChatModelRoles, XAIChatModelTextToolModalitiesEnum).parse({
  name: Grok_Build_0_1_Literal,
  description: Grok_Build_0_1_Description,
  maxInputTokens: 256000,
  maxOutputTokens: 131072,
  roles: XAIChatModelRolesMap,
  modalities: XAIChatModelTextToolModalities,
  config: {
    def: XAIChatModelConfigs.ChatModelResponseSchemaConfigDef(131072, 4),
    schema: XAIChatModelConfigs.ChatModelResponseSchemaConfigSchema(131072, 4),
  },
  price: pricingData[Grok_Build_0_1_Literal],
});

const Grok_Build_0_1_Options = BaseChatModelOptions;
type Grok_Build_0_1_OptionsType = z.infer<typeof Grok_Build_0_1_Options>;

class Grok_Build_0_1 extends BaseChatModel {
  constructor(options: Grok_Build_0_1_OptionsType) {
    super(Grok_Build_0_1_Schema, options);
  }
}

export { Grok_Build_0_1, Grok_Build_0_1_Literal, Grok_Build_0_1_Options, Grok_Build_0_1_Schema, type Grok_Build_0_1_OptionsType };
