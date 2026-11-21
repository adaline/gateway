import { describe, expect, it } from "vitest";

import { ChatModelPrice, EmbeddingModelPrice } from "@adaline/types";

import embeddingPricingData from "../../src/models/embedding-pricing.json";
import pricingData from "../../src/models/pricing.json";
import { Google } from "../../src/provider";

// Literals that may deliberately appear in pricing.json without a factory entry (or vice versa).
// Keep empty unless a model is intentionally exported but unregistered (e.g. retained only for @adaline/vertex);
// document the reason next to each entry.
const PRICING_WITHOUT_FACTORY_ALLOWLIST: string[] = [];
const FACTORY_WITHOUT_PRICING_ALLOWLIST: string[] = [];

const NEW_MODELS_2026_11 = ["gemini-4-carbon", "gemini-4-argon", "gemini-4-neon", "gemini-4-hydrogen", "gemini-3.8-flash"];

describe("Google catalog parity", () => {
  const provider = new Google();
  const literals = provider.chatModelLiterals();
  const schemas = provider.chatModelSchemas();
  const pricingKeys = Object.keys(pricingData);

  it("pricing keys match factory literals (modulo documented allowlists)", () => {
    const pricingOnly = pricingKeys.filter((key) => !literals.includes(key));
    const factoryOnly = literals.filter((literal) => !pricingKeys.includes(literal));
    expect(pricingOnly.sort()).toEqual([...PRICING_WITHOUT_FACTORY_ALLOWLIST].sort());
    expect(factoryOnly.sort()).toEqual([...FACTORY_WITHOUT_PRICING_ALLOWLIST].sort());
  });

  it("factory literals match chatModelSchemas() names", () => {
    expect(Object.keys(schemas).sort()).toEqual([...literals].sort());
    for (const [literal, schema] of Object.entries(schemas)) {
      expect(schema.name).toBe(literal);
    }
  });

  it("every chat price validates against ChatModelPrice and is keyed by its modelName", () => {
    for (const [key, price] of Object.entries(pricingData)) {
      const parsed = ChatModelPrice.safeParse(price);
      expect(parsed.success, `${key}: ${parsed.success ? "" : parsed.error.message}`).toBe(true);
      expect(price.modelName).toBe(key);
    }
  });

  it("every registered chat schema carries its own pricing entry", () => {
    for (const [literal, schema] of Object.entries(schemas)) {
      expect(schema.price).toEqual(pricingData[literal as keyof typeof pricingData]);
    }
  });

  it("every embedding price validates and matches the embedding factory", () => {
    expect(Object.keys(embeddingPricingData).sort()).toEqual(provider.embeddingModelLiterals().sort());
    for (const [key, price] of Object.entries(embeddingPricingData)) {
      expect(EmbeddingModelPrice.safeParse(price).success, key).toBe(true);
    }
  });

  it("registers the 2026-11 additions with single-tier standard list prices", () => {
    const expected: Record<string, [number, number]> = {
      "gemini-4-carbon": [4, 20],
      "gemini-4-argon": [4, 20],
      "gemini-4-neon": [3, 15],
      "gemini-4-hydrogen": [1.5, 7.5],
      "gemini-3.8-flash": [1.5, 7.5],
      "gemini-3.6-flash": [1.5, 7.5],
    };
    for (const [literal, [input, output]] of Object.entries(expected)) {
      expect(literals).toContain(literal);
      const ranges = pricingData[literal as keyof typeof pricingData].tokenRanges;
      expect(ranges).toHaveLength(1);
      expect(ranges[0].maxTokens).toBeNull();
      expect(ranges[0].prices.base).toEqual({ inputPricePerMillion: input, outputPricePerMillion: output });
    }
  });

  it("new models declare 1,048,576 input / 65,536 output tokens", () => {
    for (const literal of NEW_MODELS_2026_11) {
      expect(schemas[literal].maxInputTokens).toBe(1048576);
      expect(schemas[literal].maxOutputTokens).toBe(65536);
    }
  });

  it("keeps the 2.5 family registered on Google (still served by the Gemini API)", () => {
    expect(literals).toEqual(expect.arrayContaining(["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.5-flash"]));
  });
});
