import { z } from "zod";

import { ChatUsage, ModelPricing } from "@adaline/types";

const GetChatUsageCostHandlerRequest = z.object({
  usageTokens: ChatUsage,
  modelPricing: ModelPricing,
});
type GetChatUsageCostHandlerRequestType = z.infer<typeof GetChatUsageCostHandlerRequest>;
export { GetChatUsageCostHandlerRequest, type GetChatUsageCostHandlerRequestType };
