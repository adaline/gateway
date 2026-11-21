import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { describe, expect, it } from "vitest";

import { ChatModelPrice } from "@adaline/types";

import { Groq } from "../../src";
import pricingData from "../../src/models/pricing.json";

const provider = new Groq();
const pricingKeys = Object.keys(pricingData).sort();
const factoryLiterals = provider.chatModelLiterals().sort();
const schemas = provider.chatModelSchemas();

const removedLiterals = ["llama-3.1-8b-instant", "llama-3.3-70b-versatile", "qwen/qwen3.6-27b"];

describe("Groq catalog parity", () => {
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

  it.each(removedLiterals)("should no longer register or price the retired %s", (literal) => {
    expect(factoryLiterals).not.toContain(literal);
    expect(pricingKeys).not.toContain(literal);
    expect(() => provider.chatModel({ modelName: literal, apiKey: "test-api-key" })).toThrow();
  });

  it("should not reference the retired literals anywhere in the model sources", () => {
    const dir = join(__dirname, "../../src/models/chat-models");
    readdirSync(dir)
      .filter((file) => file.endsWith(".ts"))
      .forEach((file) => {
        const source = readFileSync(join(dir, file), "utf-8");
        removedLiterals.forEach((literal) => expect(source, file).not.toContain(`"${literal}"`));
      });
  });

  it("should register qwen/qwen3.8-27b with single-tier $0.80 / $4.00 pricing", () => {
    expect(factoryLiterals).toContain("qwen/qwen3.8-27b");
    expect(ChatModelPrice.parse(schemas["qwen/qwen3.8-27b"].price).tokenRanges).toEqual([
      { minTokens: 0, maxTokens: null, prices: { base: { inputPricePerMillion: 0.8, outputPricePerMillion: 4.0 } } },
    ]);
  });
});
