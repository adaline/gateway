import { z } from "zod";

import { ChatModelPriceType, ChatUsageType } from "@adaline/types";

const GetChatUsageCostHandlerRequest = z.object({
  chatUsage: z.custom<ChatUsageType>(),
  chatModelPrice: z.custom<ChatModelPriceType>(),
});
type GetChatUsageCostHandlerRequestType = z.infer<typeof GetChatUsageCostHandlerRequest>;
export { GetChatUsageCostHandlerRequest, type GetChatUsageCostHandlerRequestType };
