import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ChatModelSchema, ModelResponseError } from "@adaline/provider";
import { ChatModelPrice } from "@adaline/types";

import { OpenRouterChatModelConfigs } from "../../../src/configs";
import { BaseChatModel } from "../../../src/models";
import pricingData from "../../../src/models/pricing.json";

const modelSchema = ChatModelSchema(z.enum(["system", "user", "assistant", "tool"]), z.enum(["text"])).parse({
  name: "test-model",
  description: "test-description",
  maxInputTokens: 128000,
  maxOutputTokens: 128000,
  roles: { system: "system", user: "user", assistant: "assistant", tool: "tool" },
  modalities: ["text"],
  config: {
    def: OpenRouterChatModelConfigs.base(128000, 4).def,
    schema: OpenRouterChatModelConfigs.base(128000, 4).schema,
  },
});

const modelFor = (modelName: string) => new BaseChatModel(modelSchema, { apiKey: "test-api-key", modelName });

describe("OpenRouter pricing catalog", () => {
  const entries = Object.entries(pricingData);

  it("is not empty", () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries)("%s is a valid ChatModelPrice keyed by its own modelName", (key, entry) => {
    expect(entry.modelName).toBe(key);
    expect(ChatModelPrice.safeParse(entry).success).toBe(true);
  });

  it("returns the pricing schedule for a listed model", () => {
    const [modelName, entry] = entries[0];
    expect(modelFor(modelName).getModelPricing()).toEqual(entry);
  });

  it("keeps long-context tiers for tiered models", () => {
    const tiered = entries.find(([, entry]) => entry.tokenRanges.length > 1);
    expect(tiered).toBeDefined();
    const pricing = modelFor(tiered![0]).getModelPricing();
    expect(pricing.tokenRanges[0].minTokens).toBe(0);
    expect(pricing.tokenRanges[pricing.tokenRanges.length - 1].maxTokens).toBeNull();
  });

  it("omits variable-price routers instead of storing a negative price", () => {
    expect("openrouter/auto" in pricingData).toBe(false);
    expect(() => modelFor("openrouter/auto").getModelPricing()).toThrow(ModelResponseError);
  });

  it("throws for an unknown model", () => {
    expect(() => modelFor("unknown/model").getModelPricing()).toThrow(ModelResponseError);
  });
});
