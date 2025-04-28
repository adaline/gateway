import { z } from "zod";

import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "@adaline/openai";
import { ChatModelSchema } from "@adaline/provider";

import { GroqChatModelConfigs } from "../../configs";
import pricingData from "../pricing.json";
import { BaseChatModelGroq, BaseChatModelOptions } from "./base-chat-model.groq";

const Llama_3_2_90b_VisionLiteral = "llama-3.2-90b-vision-preview" as const;
// https://huggingface.co/meta-llama/Llama-3.2-90B-Vision
const Llama_3_2_90b_VisionDescription =
  "The Llama 3.2-90B Vision instruction-tuned models are optimized for advanced visual recognition, \
  complex image reasoning, detailed captioning, and answering intricate questions about images. \
  These models achieve state-of-the-art results on multiple industry benchmarks for multimodal tasks.";

const Llama_3_2_90b_VisionSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: Llama_3_2_90b_VisionLiteral,
  description: Llama_3_2_90b_VisionDescription,
  maxInputTokens: 131072,
  maxOutputTokens: 8192,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: GroqChatModelConfigs.base(8192).def,
    schema: GroqChatModelConfigs.base(8192).schema,
  },
  price: pricingData[Llama_3_2_90b_VisionLiteral],
});

const Llama_3_2_90b_VisionOptions = BaseChatModelOptions;
type Llama_3_2_90b_VisionOptionsType = z.infer<typeof Llama_3_2_90b_VisionOptions>;

class Llama_3_2_90b_Vision extends BaseChatModelGroq {
  constructor(options: Llama_3_2_90b_VisionOptionsType) {
    super(Llama_3_2_90b_VisionSchema, options);
  }
}

export {
  Llama_3_2_90b_Vision,
  Llama_3_2_90b_VisionLiteral,
  Llama_3_2_90b_VisionOptions,
  Llama_3_2_90b_VisionSchema,
  type Llama_3_2_90b_VisionOptionsType,
};
