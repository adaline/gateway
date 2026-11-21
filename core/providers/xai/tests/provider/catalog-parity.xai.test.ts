import { readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

import { ChatModelPrice } from "@adaline/types";

import { XAI } from "../../src";
import pricingData from "../../src/models/pricing.json";

const provider = new XAI();
const pricingKeys = Object.keys(pricingData).sort();
const factoryLiterals = provider.chatModelLiterals().sort();
const schemas = provider.chatModelSchemas();

describe("xAI catalog parity", () => {
  it("should keep pricing.json keys, factory literals and chatModelSchemas() names identical", () => {
    const schemaNames = Object.values(schemas)
      .map((schema) => schema.name)
      .sort();
    expect(factoryLiterals).toEqual(pricingKeys);
    expect(schemaNames).toEqual(pricingKeys);
    expect(Object.keys(schemas).sort()).toEqual(pricingKeys);
  });

  it("should key every pricing.json entry by its own modelName", () => {
    Object.entries(pricingData).forEach(([key, entry]) => {
      expect(entry.modelName).toBe(key);
    });
  });

  it.each(Object.keys(schemas))("%s: price validates against ChatModelPrice", (literal) => {
    const result = ChatModelPrice.safeParse(schemas[literal].price);
    expect(result.success, JSON.stringify(result.error?.issues)).toBe(true);
  });

  it.each(Object.keys(schemas))("%s: maxOutputTokens does not exceed maxInputTokens", (literal) => {
    expect(schemas[literal].maxOutputTokens).toBeLessThanOrEqual(schemas[literal].maxInputTokens);
  });

  it("should no longer register or price the retired grok-build-0.1", () => {
    expect(factoryLiterals).not.toContain("grok-build-0.1");
    expect(pricingKeys).not.toContain("grok-build-0.1");
    expect(() => provider.chatModel({ modelName: "grok-build-0.1", apiKey: "test-api-key" })).toThrow();
  });

  it("should not reference grok-build-0.1 anywhere in the provider factory source", () => {
    const source = readFileSync(join(__dirname, "../../src/provider/provider.xai.ts"), "utf-8");
    expect(source).not.toMatch(/Grok_Build|grok-build/);
  });

  it("should register grok-4.7 and grok-4.6", () => {
    expect(factoryLiterals).toEqual(expect.arrayContaining(["grok-4.7", "grok-4.6"]));
  });

  it("should not expose logProbs or topLogProbs on any model (unsupported on grok-4.20+)", () => {
    Object.values(schemas).forEach((schema) => {
      expect(Object.keys(schema.config.def)).not.toContain("logProbs");
      expect(Object.keys(schema.config.def)).not.toContain("topLogProbs");
    });
  });
});

describe("xAI tiered pricing", () => {
  const expectedTiers: Record<string, [[number, number], [number, number]]> = {
    "grok-4.7": [
      [2.0, 6.0],
      [4.0, 12.0],
    ],
    "grok-4.6": [
      [2.0, 6.0],
      [4.0, 12.0],
    ],
    "grok-4.5": [
      [2.0, 6.0],
      [4.0, 12.0],
    ],
    "grok-4.3": [
      [1.25, 2.5],
      [2.5, 5.0],
    ],
    "grok-4.20-0309-reasoning": [
      [1.25, 2.5],
      [2.5, 5.0],
    ],
    "grok-4.20-0309-non-reasoning": [
      [1.25, 2.5],
      [2.5, 5.0],
    ],
    "grok-4.20-multi-agent-0309": [
      [1.25, 2.5],
      [2.5, 5.0],
    ],
  };

  it("should cover every registered model", () => {
    expect(Object.keys(expectedTiers).sort()).toEqual(pricingKeys);
  });

  it.each(Object.entries(expectedTiers))("%s: two contiguous tiers split at 200K prompt tokens", (literal, [short, long]) => {
    const price = ChatModelPrice.parse(schemas[literal].price);
    expect(price.currency).toBe("USD");
    expect(price.tokenRanges).toEqual([
      {
        minTokens: 0,
        maxTokens: 200000,
        prices: { base: { inputPricePerMillion: short[0], outputPricePerMillion: short[1] } },
      },
      {
        minTokens: 200000,
        maxTokens: null,
        prices: { base: { inputPricePerMillion: long[0], outputPricePerMillion: long[1] } },
      },
    ]);
  });

  it("should return the same tiers from getModelPricing() as the schema", () => {
    Object.keys(expectedTiers).forEach((literal) => {
      const model = provider.chatModel({ modelName: literal, apiKey: "test-api-key" });
      expect(model.getModelPricing()).toEqual(schemas[literal].price);
    });
  });
});
