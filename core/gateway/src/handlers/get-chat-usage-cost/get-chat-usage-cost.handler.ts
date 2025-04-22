import { ModelPricingType } from "@adaline/types";

import { GetChatUsageCostHandlerRequestType, GetChatUsageCostHandlerResponseType } from "./get-chat-usage-cost.types";

function handleGetChatUsageCost(request: GetChatUsageCostHandlerRequestType): GetChatUsageCostHandlerResponseType {
  const { promptTokens, completionTokens } = request.usageTokens;
  let tiers: ModelPricingType;

  // Determine pricing tiers based on the request
  if (request.customModelPricing) {
    tiers = request.customModelPricing;
  } else if (request.model) {
    tiers = (request.model as any).getModelPricing(); // ToDo Replace with a proper type as soon as finalized
  } else {
    throw new Error("No model pricing provided");
  }

  // Helper: pick the per‑million rate for either input or output
  function getRate(tokens: number, kind: "input" | "output"): number {
    const tier = tiers.tiers.find(
      (t) => tokens >= t.minTokens && (t.maxTokens === null || t.maxTokens === undefined || tokens < t.maxTokens)
    );
    if (!tier) {
      console.warn(`No pricing tier for ${tokens} ${kind} tokens.`);
      return 0;
    }
    return tier.prices?.base?.[kind] ?? 0;
  }

  // Calculate rates per million tokens
  const inputRatePerMillion = getRate(promptTokens, "input");
  const outputRatePerMillion = getRate(completionTokens, "output");

  // Calculate costs
  const inputCost = (promptTokens / 1_000_000) * inputRatePerMillion;
  const outputCost = (completionTokens / 1_000_000) * outputRatePerMillion;

  const totalCost = inputCost + outputCost;

  // Return the response with all required details
  return {
    cost: totalCost,
    currency: tiers.currency || "USD", // Default to USD if currency is not provided
    pricingModel: tiers,
    usageTokens: request.usageTokens,
  };
}

export { handleGetChatUsageCost };
