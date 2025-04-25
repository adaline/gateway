import { describe, expect, it, vi } from "vitest";

import { ChatModelV1 } from "@adaline/provider";
import { ChatModelPriceType, ChatUsageType } from "@adaline/types";

import { GatewayError } from "../../src/errors";
import { Gateway } from "../../src/gateway";

// Sample ChatModelPriceType for testing
const sampleChatModelPrice: ChatModelPriceType = {
  modelName: "test-model",
  currency: "USD",
  tokenRanges: [
    {
      minTokens: 0,
      maxTokens: null, // Represents infinity or no upper limit for this tier
      prices: {
        base: {
          inputPricePerMillion: 1.0, // $1 per million input tokens
          outputPricePerMillion: 3.0, // $3 per million output tokens
        },
      },
    },
  ],
};

// Sample ChatModelPriceType with Tiers
const tieredChatModelPrice: ChatModelPriceType = {
  modelName: "test-model-tiered",
  currency: "EUR",
  tokenRanges: [
    {
      minTokens: 0,
      maxTokens: 10000,
      prices: {
        base: {
          inputPricePerMillion: 0.5, // €0.5 / million input
          outputPricePerMillion: 1.5, // €1.5 / million output
        },
      },
    },
    {
      minTokens: 10000,
      maxTokens: null,
      prices: {
        base: {
          inputPricePerMillion: 0.4, // €0.4 / million input
          outputPricePerMillion: 1.2, // €1.2 / million output
        },
      },
    },
  ],
};

// Sample ChatUsageType
const sampleChatUsage: ChatUsageType = {
  promptTokens: 100000, // 0.1 million
  completionTokens: 200000, // 0.2 million
  totalTokens: 300000, // 0.3 million
};

describe("Gateway.getChatUsageCost", () => {
  it("should calculate cost correctly using chatModelPrice", () => {
    const result = Gateway.getChatUsageCost({
      chatUsage: sampleChatUsage,
      chatModelPrice: sampleChatModelPrice,
    });

    const expectedInputCost = (100000 / 1_000_000) * 1.0; // 0.1
    const expectedOutputCost = (200000 / 1_000_000) * 3.0; // 0.6
    const expectedTotalCost = expectedInputCost + expectedOutputCost; // 0.7

    expect(result.cost).toBeCloseTo(expectedTotalCost);
    expect(result.currency).toBe("USD");
    expect(result.pricingModel).toEqual(sampleChatModelPrice);
    expect(result.usageTokens).toEqual(sampleChatUsage);
  });

  it("should calculate cost correctly using model.getModelPricing()", () => {
    // Mock ChatModelV1 and its getModelPricing method
    const mockModel = {
      getModelPricing: vi.fn().mockReturnValue(sampleChatModelPrice),
      // Add other necessary properties/methods if required by the type,
      // but keep it minimal for this test.
      modelSchema: { name: "test-model" },
      provider: "test-provider",
      completeChat: vi.fn(),
      streamChat: vi.fn(),
      getEmbeddings: vi.fn(),
    } as unknown as ChatModelV1; // Cast to bypass full type implementation

    const result = Gateway.getChatUsageCost({
      chatUsage: sampleChatUsage,
      model: mockModel,
    });

    const expectedInputCost = (100000 / 1_000_000) * 1.0; // 0.1
    const expectedOutputCost = (200000 / 1_000_000) * 3.0; // 0.6
    const expectedTotalCost = expectedInputCost + expectedOutputCost; // 0.7

    expect(result.cost).toBeCloseTo(expectedTotalCost);
    expect(result.currency).toBe("USD");
    expect(result.pricingModel).toEqual(sampleChatModelPrice);
    expect(result.usageTokens).toEqual(sampleChatUsage);
    expect((mockModel as any).getModelPricing).toHaveBeenCalledTimes(1);
  });

  it("should use the correct tier for tiered pricing", () => {
    // Usage within the first tier
    const usageTier1: ChatUsageType = { promptTokens: 5000, completionTokens: 8000, totalTokens: 13000 };
    const resultTier1 = Gateway.getChatUsageCost({
      chatUsage: usageTier1,
      chatModelPrice: tieredChatModelPrice,
    });
    const expectedCostTier1 = (5000 / 1_000_000) * 0.5 + (8000 / 1_000_000) * 1.5;
    expect(resultTier1.cost).toBeCloseTo(expectedCostTier1);
    expect(resultTier1.currency).toBe("EUR");

    // Usage within the second tier
    const usageTier2: ChatUsageType = { promptTokens: 15000, completionTokens: 20000 };
    const resultTier2 = Gateway.getChatUsageCost({
      chatUsage: usageTier2,
      chatModelPrice: tieredChatModelPrice,
    });
    const expectedCostTier2 = (15000 / 1_000_000) * 0.4 + (20000 / 1_000_000) * 1.2;
    expect(resultTier2.cost).toBeCloseTo(expectedCostTier2);
    expect(resultTier2.currency).toBe("EUR");
  });

  it("should handle zero tokens correctly", () => {
    const result = Gateway.getChatUsageCost({
      chatUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
      chatModelPrice: sampleChatModelPrice,
    });
    expect(result.cost).toBe(0);
    expect(result.currency).toBe("USD");
  });

  it("should throw GatewayError if no matching token range is found", () => {
    const limitedRangePrice: ChatModelPriceType = {
      currency: "USD",
      modelName: "test-model-limited",
      tokenRanges: [
        {
          minTokens: 0,
          maxTokens: 50000, // Limited range
          prices: { base: { inputPricePerMillion: 1.0, outputPricePerMillion: 3.0 } },
        },
      ],
    };
    expect(() =>
      Gateway.getChatUsageCost({
        chatUsage: sampleChatUsage, // 100k prompt tokens, outside the range
        chatModelPrice: limitedRangePrice,
      })
    ).toThrow(GatewayError);
    expect(() =>
      Gateway.getChatUsageCost({
        chatUsage: sampleChatUsage, // 100k prompt tokens, outside the range
        chatModelPrice: limitedRangePrice,
      })
    ).toThrow(/Unable to find a pricing tier/);
  });

  it("should calculate cost with high precision", () => {
    const precisePrice: ChatModelPriceType = {
      currency: "USD",
      modelName: "test-model-precise",
      tokenRanges: [
        {
          minTokens: 0,
          maxTokens: null,
          prices: {
            base: {
              inputPricePerMillion: 0.123456,
              outputPricePerMillion: 0.987654,
            },
          },
        },
      ],
    };
    const preciseUsage: ChatUsageType = { promptTokens: 1, completionTokens: 1, totalTokens: 2 };
    const result = Gateway.getChatUsageCost({
      chatUsage: preciseUsage,
      chatModelPrice: precisePrice,
    });

    const expectedInputCost = (1 / 1_000_000) * 0.123456;
    const expectedOutputCost = (1 / 1_000_000) * 0.987654;
    const expectedTotalCost = expectedInputCost + expectedOutputCost;

    // Check the effective precision based on the implementation's toFixed(6)
    expect(Number(result.cost.toFixed(6))).toBe(Number(expectedTotalCost.toFixed(6)));
  });

  // Note: The case where neither chatModelPrice nor model is provided
  // is handled by the Zod schema validation within the Gateway.getChatUsageCost method itself.
  // Testing that would involve trying to bypass TypeScript/Zod checks,
  // which is generally not the goal of standard unit tests for the public API.
  // The .refine check ensures this condition won't occur with valid inputs.
});
