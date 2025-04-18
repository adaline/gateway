import { GetChatUsageCostHandlerRequestType } from "./get-chat-usage-cost.types";

function handleGetChatUsageCost(request: GetChatUsageCostHandlerRequestType): number {
  const { promptTokens, completionTokens } = request.usageTokens;
  const { tiers } = request.modelPricing;

  // Helper: pick the per‑million rate for either input or output
  function getRate(tokens: number, kind: "input" | "output"): number {
    const tier = tiers.find((t) => tokens >= t.minTokens && (t.maxTokens === null || tokens < t.maxTokens));
    if (!tier) {
      console.warn(`No pricing tier for ${tokens} ${kind} tokens.`);
      return 0;
    }
    return tier.prices?.base?.[kind] ?? 0;
  }

  const inputRatePerMillion = getRate(promptTokens, "input");
  const outputRatePerMillion = getRate(completionTokens, "output");

  // rates are per‑1,000,000 tokens
  const inputCost = (promptTokens / 1_000_000) * inputRatePerMillion;
  const outputCost = (completionTokens / 1_000_000) * outputRatePerMillion;

  return inputCost + outputCost;
}

export { handleGetChatUsageCost };
