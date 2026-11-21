import { describe, expect, it } from "vitest";

import { ChatModelPrice, EmbeddingModelPrice } from "@adaline/types";

import { Anthropic } from "../../../src";
import embeddingPricingData from "../../../src/models/embedding-pricing.json";
import pricingData from "../../../src/models/pricing.json";

describe("Anthropic catalog parity", () => {
  const provider = new Anthropic();
  const chatSchemas = provider.chatModelSchemas();
  const embeddingSchemas = provider.embeddingModelSchemas();

  it("registers exactly the chat models that have pricing", () => {
    expect(new Set(provider.chatModelLiterals())).toEqual(new Set(Object.keys(pricingData)));
    expect(new Set(Object.keys(chatSchemas))).toEqual(new Set(provider.chatModelLiterals()));
  });

  it("registers exactly the embedding models that have pricing", () => {
    expect(new Set(provider.embeddingModelLiterals())).toEqual(new Set(Object.keys(embeddingPricingData)));
  });

  it.each(Object.entries(chatSchemas))("%s has a valid price, name and token limits", (literal, schema) => {
    expect(schema.name).toBe(literal);
    expect(schema.description.length).toBeGreaterThan(0);
    expect(ChatModelPrice.safeParse(schema.price).success).toBe(true);
    expect(schema.maxOutputTokens).toBeLessThanOrEqual(schema.maxInputTokens);
    const maxTokensDef = schema.config.def.maxTokens;
    if (maxTokensDef.type !== "range") throw new Error("expected range config for maxTokens");
    expect(maxTokensDef.max).toBe(schema.maxOutputTokens);
  });

  it.each(Object.entries(embeddingSchemas))("%s has a valid embedding price", (_literal, schema) => {
    expect(EmbeddingModelPrice.safeParse(schema.price).success).toBe(true);
  });

  it("adds the 2026-11 Claude and Voyage models", () => {
    for (const literal of ["claude-fable-5-2", "claude-fable-5-1", "claude-opus-5-5", "claude-sonnet-5-5", "claude-haiku-5-5"]) {
      expect(chatSchemas[literal]).toBeDefined();
      expect(chatSchemas[literal].maxInputTokens).toBe(1000000);
      expect(chatSchemas[literal].maxOutputTokens).toBe(128000);
    }
    expect(embeddingSchemas["voyage-code-4"]).toBeDefined();
  });

  it("prices claude-haiku-5-5 by prompt length with the higher rate above 100,000 tokens", () => {
    const tiers = chatSchemas["claude-haiku-5-5"].price.tokenRanges;
    expect(tiers).toHaveLength(2);
    expect(tiers[0]).toMatchObject({
      minTokens: 0,
      maxTokens: 100001,
      prices: { base: { inputPricePerMillion: 0.1, outputPricePerMillion: 0.5 } },
    });
    expect(tiers[1]).toMatchObject({
      minTokens: 100001,
      maxTokens: null,
      prices: { base: { inputPricePerMillion: 0.5, outputPricePerMillion: 2.5 } },
    });
  });

  it("carries the corrected prices and limits", () => {
    expect(chatSchemas["claude-sonnet-5"].price.tokenRanges[0].prices.base).toEqual({ inputPricePerMillion: 2, outputPricePerMillion: 10 });
    expect(embeddingSchemas["voyage-4-large"].price.inputPricePerMillion).toBe(0.12);
    expect(chatSchemas["claude-haiku-4-5-20251001"].maxOutputTokens).toBe(64000);
    expect(chatSchemas["claude-sonnet-4-6"].maxInputTokens).toBe(1000000);
    expect(chatSchemas["claude-sonnet-4-6"].maxOutputTokens).toBe(128000);
    expect(chatSchemas["claude-opus-4-6"].maxInputTokens).toBe(1000000);
    expect(chatSchemas["claude-opus-4-7"].maxInputTokens).toBe(1000000);
  });
});
