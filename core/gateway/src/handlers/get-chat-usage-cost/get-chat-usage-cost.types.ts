import { z } from "zod";

import { ChatModelV1 } from "@adaline/provider";
import { ChatUsage, ModelPricing } from "@adaline/types";

const GetChatUsageCostHandlerRequest = z
  .object({
    usageTokens: ChatUsage,
    customModelPricing: ModelPricing.optional(),
    model: z.custom<ChatModelV1>().optional(),
  })
  .refine((data) => data.customModelPricing || data.model, {
    message: "Either customModelPricing or model must be provided.",
    path: ["customModelPricing", "model"],
  });

type GetChatUsageCostHandlerRequestType = z.infer<typeof GetChatUsageCostHandlerRequest>;
export { GetChatUsageCostHandlerRequest, type GetChatUsageCostHandlerRequestType };
