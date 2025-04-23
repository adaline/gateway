import { GatewayError } from "../../errors";
import { GetChatUsageCostHandlerRequestType } from "./get-chat-usage-cost.types";

function handleGetChatUsageCost(request: GetChatUsageCostHandlerRequestType): number {
  const { promptTokens, completionTokens } = request.chatUsage;
  const { tokenRanges } = request.chatModelPrice;

  // Helper: pick the per‑million rate for either input or output
  function getRate(tokens: number, kind: "inputPricePerMillion" | "outputPricePerMillion"): number {
    const tokenRange = tokenRanges.find(
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

  return inputCost + outputCost;
}

export { handleGetChatUsageCost };
