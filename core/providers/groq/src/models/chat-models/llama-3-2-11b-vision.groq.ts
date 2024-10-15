import { z } from "zod";

import { OpenAIChatModelModalities, OpenAIChatModelModalitiesEnum, OpenAIChatModelRoles, OpenAIChatModelRolesMap } from "@adaline/openai";
import { ChatModelSchema } from "@adaline/provider";

import { GroqChatModelConfigs } from "../../configs";
import { BaseChatModelGroq, BaseChatModelOptions } from "./base-chat-model.groq";

const Llama_3_2_11b_VisionLiteral = "llama-3.2-11b-vision-preview" as const;
// https://huggingface.co/meta-llama/Llama-3.2-11B-Vision
const Llama_3_2_11b_VisionDescription =
  "The Llama 3.2-Vision instruction-tuned models are optimized for visual recognition, image reasoning, captioning, \
  and answering general questions about an image. \
  The models outperform many of the available open source and closed multimodal models on common industry benchmarks.";

const Llama_3_2_11b_VisionSchema = ChatModelSchema(OpenAIChatModelRoles, OpenAIChatModelModalitiesEnum).parse({
  name: Llama_3_2_11b_VisionLiteral,
  description: Llama_3_2_11b_VisionDescription,
  maxInputTokens: 128000,
  maxOutputTokens: 8192,
  roles: OpenAIChatModelRolesMap,
  modalities: OpenAIChatModelModalities,
  config: {
    def: GroqChatModelConfigs.base(8192).def,
    schema: GroqChatModelConfigs.base(8192).schema,
  },
});

const Llama_3_2_11b_VisionOptions = BaseChatModelOptions;
type Llama_3_2_11b_VisionOptionsType = z.infer<typeof Llama_3_2_11b_VisionOptions>;

class Llama_3_2_11b_Vision extends BaseChatModelGroq {
  constructor(options: Llama_3_2_11b_VisionOptionsType) {
    super(Llama_3_2_11b_VisionSchema, options);
  }
}

export {
  Llama_3_2_11b_Vision,
  Llama_3_2_11b_VisionOptions,
  Llama_3_2_11b_VisionSchema,
  Llama_3_2_11b_VisionLiteral,
  type Llama_3_2_11b_VisionOptionsType,
};
