import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { XAIChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.xai";
import { XAIChatModelTextToolModalities, XAIChatModelTextToolModalitiesEnum, XAIChatModelRoles, XAIChatModelRolesMap } from "./types";

const Grok_Code_Fast_1_Literal = "grok-code-fast-1";
const Grok_Code_Fast_1_Description =
  "Grok Code Fast 1 is xAI's specialized coding model optimized for code generation with a 256K context window.";

const Grok_Code_Fast_1_Schema = ChatModelSchema(XAIChatModelRoles, XAIChatModelTextToolModalitiesEnum).parse({
  name: Grok_Code_Fast_1_Literal,
  description: Grok_Code_Fast_1_Description,
  maxInputTokens: 262144,
  maxOutputTokens: 131072,
  roles: XAIChatModelRolesMap,
  modalities: XAIChatModelTextToolModalities,
  config: {
    def: XAIChatModelConfigs.ChatModelResponseSchemaConfigDef(131072, 4),
    schema: XAIChatModelConfigs.ChatModelResponseSchemaConfigSchema(131072, 4),
  },
  price: pricingData[Grok_Code_Fast_1_Literal],
});

const Grok_Code_Fast_1_Options = BaseChatModelOptions;
type Grok_Code_Fast_1_OptionsType = z.infer<typeof Grok_Code_Fast_1_Options>;

class Grok_Code_Fast_1 extends BaseChatModel {
  constructor(options: Grok_Code_Fast_1_OptionsType) {
    super(Grok_Code_Fast_1_Schema, options);
  }
}

export { Grok_Code_Fast_1, Grok_Code_Fast_1_Literal, Grok_Code_Fast_1_Options, Grok_Code_Fast_1_Schema, type Grok_Code_Fast_1_OptionsType };
