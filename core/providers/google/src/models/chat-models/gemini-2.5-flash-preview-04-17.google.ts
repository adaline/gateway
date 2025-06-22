import { z } from "zod";

import { ChatModelSchema } from "@adaline/provider";

import { GoogleChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModel, BaseChatModelOptions } from "./base-chat-model.google";
import { GoogleChatModelModalities, GoogleChatModelModalitiesEnum, GoogleChatModelRoles, GoogleChatModelRolesMap } from "./types";

const Gemini2_5FlashPreview0417Literal = "gemini-2.5-flash-preview-04-17";
const Gemini2_5FlashPreview0417Description =
  "Google's best model in Gemini 2.5 family in terms of price-performance, offering well-rounded capabilities.";

const Gemini2_5FlashPreview0417Schema = ChatModelSchema(GoogleChatModelRoles, GoogleChatModelModalitiesEnum).parse({
  name: Gemini2_5FlashPreview0417Literal,
  description: Gemini2_5FlashPreview0417Description,
  maxInputTokens: 1048576,
  maxOutputTokens: 65536,
  roles: GoogleChatModelRolesMap,
  modalities: GoogleChatModelModalities,
  config: {
    def: GoogleChatModelConfigs.responseSchema(2.0, 1.0, 65536, 4, 0.95).def,
    schema: GoogleChatModelConfigs.responseSchema(2.0, 1.0, 65536, 4, 0.95).schema,
  },
  price: pricingData[Gemini2_5FlashPreview0417Literal],
});

const Gemini2_5FlashPreview0417Options = BaseChatModelOptions;
type Gemini2_5FlashPreview0417OptionsType = z.infer<typeof Gemini2_5FlashPreview0417Options>;

class Gemini2_5FlashPreview0417 extends BaseChatModel {
  constructor(options: Gemini2_5FlashPreview0417OptionsType) {
    super(Gemini2_5FlashPreview0417Schema, options);
  }
}

export {
  Gemini2_5FlashPreview0417,
  Gemini2_5FlashPreview0417Literal,
  Gemini2_5FlashPreview0417Options,
  Gemini2_5FlashPreview0417Schema,
  type Gemini2_5FlashPreview0417OptionsType,
};
