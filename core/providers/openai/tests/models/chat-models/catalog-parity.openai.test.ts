import { describe, expect, it } from "vitest";

import { ChatModelPrice } from "@adaline/types";

import { OpenAI } from "../../../src";
import pricingData from "../../../src/models/pricing.json";

// Schemas retired on the OpenAI API (unregistered) but still exported because @adaline/azure
// wraps them. Their pricing keys are intentionally retained.
const AZURE_RETAINED_LITERALS = ["gpt-5.2-codex", "gpt-4.1-nano", "gpt-4o-2024-05-13"];

const REMOVED_LITERALS = [
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-0125",
  "gpt-3.5-turbo-1106",
  "gpt-4",
  "gpt-4-0613",
  "gpt-4-1106-preview",
  "gpt-4-turbo",
  "gpt-4-turbo-2024-04-09",
  "gpt-4.1-nano",
  "gpt-4o-2024-05-13",
  "o1",
  "o1-2024-12-17",
  "o3-mini",
  "o3-mini-2025-01-31",
  "o4-mini",
  "o4-mini-2025-04-16",
  "gpt-5.2-chat-latest",
];

const ADDED_LITERALS = ["gpt-6-astra", "gpt-6-sol", "gpt-6-luna", "gpt-6.1-sol", "gpt-6.1-terra", "gpt-6.2-astra", "gpt-6.2-sol"];

describe("OpenAI catalog parity", () => {
  const provider = new OpenAI();
  const schemas = provider.chatModelSchemas();
  const registered = provider.chatModelLiterals();
  const pricing = pricingData as Record<string, unknown>;
  const pricingKeys = Object.keys(pricing);

  it("factory literals match chatModelSchemas() keys and schema names", () => {
    expect([...registered].sort()).toEqual(Object.keys(schemas).sort());
    for (const literal of registered) {
      expect(schemas[literal].name, `schema name for ${literal}`).toBe(literal);
    }
  });

  it("every registered literal has a pricing entry", () => {
    const missing = registered.filter((literal) => !(literal in pricing));
    expect(missing).toEqual([]);
  });

  it("every pricing key is registered or an explicitly allowlisted Azure-retained schema", () => {
    const orphaned = pricingKeys.filter((key) => !registered.includes(key) && !AZURE_RETAINED_LITERALS.includes(key));
    expect(orphaned).toEqual([]);
  });

  it("Azure-retained schemas are priced but not registered", () => {
    for (const literal of AZURE_RETAINED_LITERALS) {
      expect(pricingKeys, `pricing key for ${literal}`).toContain(literal);
      expect(registered, `registered literal ${literal}`).not.toContain(literal);
    }
  });

  it.each(pricingKeys)("pricing entry '%s' validates against ChatModelPrice and names itself", (key) => {
    const parsed = ChatModelPrice.safeParse(pricing[key]);
    expect(parsed.success, parsed.success ? "" : parsed.error.message).toBe(true);
    if (parsed.success) expect(parsed.data.modelName).toBe(key);
  });

  it("every registered schema carries the price from pricing.json", () => {
    for (const literal of registered) {
      expect(schemas[literal].price, `price for ${literal}`).toEqual(ChatModelPrice.parse(pricing[literal]));
    }
  });

  it("removed literals are absent from chatModelSchemas()", () => {
    for (const literal of REMOVED_LITERALS) {
      expect(schemas[literal], `${literal} should not be registered`).toBeUndefined();
    }
  });

  it("removed literals other than the Azure-retained ones have no pricing entry", () => {
    for (const literal of REMOVED_LITERALS.filter((l) => !AZURE_RETAINED_LITERALS.includes(l))) {
      expect(pricing[literal], `${literal} pricing should be deleted`).toBeUndefined();
    }
  });

  it("removed literals cannot be instantiated", () => {
    for (const literal of REMOVED_LITERALS) {
      expect(() => provider.chatModel({ modelName: literal, apiKey: "test-api-key" })).toThrow();
    }
  });

  it("new GPT-6 literals are registered", () => {
    for (const literal of ADDED_LITERALS) {
      expect(registered).toContain(literal);
    }
  });
});
