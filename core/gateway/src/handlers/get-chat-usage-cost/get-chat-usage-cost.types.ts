import { z } from "zod";

import { ChatModelV1 } from "@adaline/provider";
import { ChatModelPriceType, ChatUsageType } from "@adaline/types";

const GetChatUsageCostHandlerRequest = z
  .object({
    chatUsage: z.custom<ChatUsageType>(),
    chatModelPrice: z.custom<ChatModelPriceType>().optional(),
    model: z.custom<ChatModelV1>().optional(),
  })
  .refine(
    (data) => {
      // Ensure exactly one of chatModelPrice or model is provided
      return (data.chatModelPrice !== undefined) !== (data.model !== undefined);
    },
    {
      message: "Exactly one of chatModelPrice or model must be provided, not both.",
      path: ["chatModelPrice", "model"],
    }
  );

type GetChatUsageCostHandlerRequestType = z.infer<typeof GetChatUsageCostHandlerRequest>;

const GetChatUsageCostHandlerResponse = z.object({
  cost: z.number(),
  currency: z.string(),
  pricingModel: z.custom<ChatModelPriceType>(),
  usageTokens: z.custom<ChatUsageType>(),
});
type GetChatUsageCostHandlerResponseType = z.infer<typeof GetChatUsageCostHandlerResponse>;

export {
  GetChatUsageCostHandlerRequest,
  GetChatUsageCostHandlerResponse,
  type GetChatUsageCostHandlerRequestType,
  type GetChatUsageCostHandlerResponseType,
};
