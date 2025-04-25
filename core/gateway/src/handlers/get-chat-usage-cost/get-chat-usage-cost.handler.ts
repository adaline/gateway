import { ChatModelPriceType } from "@adaline/types";

import { GatewayError } from "../../errors";
import { GetChatUsageCostHandlerRequestType, GetChatUsageCostHandlerResponseType } from "./get-chat-usage-cost.types";

function handleGetChatUsageCost(request: GetChatUsageCostHandlerRequestType): GetChatUsageCostHandlerResponseType {
  const { promptTokens, completionTokens } = request.chatUsage;
  let tokenRanges: ChatModelPriceType;
  if (request.chatModelPrice) {
    tokenRanges = request.chatModelPrice;
  } else if (request.model) {
    tokenRanges = (request.model as any).getModelPricing(); // ToDo Replace with a proper type as soon as finalized
  } else {
    throw new GatewayError("No chatModelPrice or model provided");
  }

  // Helper: pick the per‑million rate for either input or output
  function getRate(tokens: number, kind: "inputPricePerMillion" | "outputPricePerMillion"): number {
    const tokenRange = tokenRanges.tokenRanges.find(
      (t) => tokens >= t.minTokens && (t.maxTokens === null || t.maxTokens === undefined || tokens < t.maxTokens)
    );
    if (!tokenRange) {
      throw new GatewayError("Unable to find a pricing tier for the given token count. Please check your model pricing configuration.");
    }
    const rate = tokenRange.prices?.base?.[kind];
    if (rate === undefined) {
      throw new GatewayError(`Unable to find a pricing rate for the given token count. Please check your model pricing configuration.`);
    }
    return rate;
  }

  const inputRatePerMillion = getRate(promptTokens, "inputPricePerMillion");
  const outputRatePerMillion = getRate(completionTokens, "outputPricePerMillion");

  // rates are per‑1,000,000 tokens
  const inputCost = Number(((promptTokens / 1_000_000) * inputRatePerMillion).toFixed(6));
  const outputCost = Number(((completionTokens / 1_000_000) * outputRatePerMillion).toFixed(6));
  const totalCost = inputCost + outputCost;
  return {
    cost: totalCost,
    currency: tokenRanges.currency || "USD", // Default to USD if currency is not provided
    pricingModel: tokenRanges,
    usageTokens: request.chatUsage,
  };
}

export { handleGetChatUsageCost };
