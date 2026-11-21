import { describe, expect, it } from "vitest";

import { ChatModelPrice, EmbeddingModelPrice } from "@adaline/types";

import * as Models from "../../src/models";
import embeddingPricingData from "../../src/models/embedding-pricing.json";
import pricingData from "../../src/models/pricing.json";
import { Vertex } from "../../src/provider";

// Retired on Vertex: 2.5 family on 2026-10-20, gemini-3.6-flash on 2026-11-19 (replacement gemini-3.8-flash).
const REMOVED_LITERALS = ["gemini-2.5-pro", "gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-3.6-flash"];

describe("Vertex catalog parity", () => {
  const provider = new Vertex();
  const literals = provider.chatModelLiterals();
  const schemas = provider.chatModelSchemas();
  const pricingKeys = Object.keys(pricingData);

  it("pricing keys = factory literals = chatModelSchemas() names", () => {
    expect([...pricingKeys].sort()).toEqual([...literals].sort());
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

  it("every registered chat schema uses the Vertex price, not the Google one", () => {
    for (const [literal, schema] of Object.entries(schemas)) {
      expect(schema.price).toEqual(pricingData[literal as keyof typeof pricingData]);
    }
  });

  it("removed literals are absent from pricing, factory and exports", () => {
    for (const literal of REMOVED_LITERALS) {
      expect(literals).not.toContain(literal);
      expect(pricingKeys).not.toContain(literal);
      expect(() =>
        provider.chatModel({ modelName: literal, authType: "accessToken", accessToken: "t", location: "l", projectId: "p" })
      ).toThrow();
    }
    const exportedLiterals = Object.entries(Models)
      .filter(([name]) => name.endsWith("Literal"))
      .map(([, value]) => value);
    for (const literal of REMOVED_LITERALS) {
      expect(exportedLiterals).not.toContain(literal);
    }
  });

  it("registers the 2026-11 additions at Global Standard PayGo list prices", () => {
    const expected: Record<string, [number, number]> = {
      "gemini-4-argon": [4, 20],
      "gemini-4-carbon": [4, 20],
      "gemini-4-hydrogen": [1.5, 7.5],
      "gemini-4-neon": [3, 15],
      "gemini-3.8-flash": [1.5, 7.5],
    };
    for (const [literal, [input, output]] of Object.entries(expected)) {
      expect(literals).toContain(literal);
      const ranges = pricingData[literal as keyof typeof pricingData].tokenRanges;
      expect(ranges).toHaveLength(1);
      expect(ranges[0].prices.base).toEqual({ inputPricePerMillion: input, outputPricePerMillion: output });
      expect(schemas[literal].maxInputTokens).toBe(1048576);
      expect(schemas[literal].maxOutputTokens).toBe(65536);
    }
  });

  it("every embedding price validates and matches the embedding factory", () => {
    expect(Object.keys(embeddingPricingData).sort()).toEqual(provider.embeddingModelLiterals().sort());
    for (const [key, price] of Object.entries(embeddingPricingData)) {
      expect(EmbeddingModelPrice.safeParse(price).success, key).toBe(true);
    }
    expect(embeddingPricingData["gemini-embedding-2"].inputPricePerMillion).toBe(0.2);
  });

  it("text-multilingual-embedding-002 has a real description", () => {
    const schema = provider.embeddingModelSchemas()["text-multilingual-embedding-002"];
    expect(schema.description).not.toBe("text-multilingual-embedding-002");
    expect(schema.description).toContain("2027-04-01");
  });
});
