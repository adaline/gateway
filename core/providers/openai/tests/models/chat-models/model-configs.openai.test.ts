import { describe, expect, it } from "vitest";

import { ChatModelSchemaType } from "@adaline/provider";

import { OpenAI } from "../../../src";
import { OpenAIChatModelConfigs } from "../../../src/configs";

type SelectStringDef = { type: "select-string"; default: string | null; choices: string[] };

function effortDef(schema: ChatModelSchemaType): SelectStringDef {
  const def = schema.config.def.reasoningEffort;
  if (!def || def.type !== "select-string") throw new Error(`expected select-string reasoningEffort for ${schema.name}`);
  return def as SelectStringDef;
}

describe("OpenAI model config definitions", () => {
  const provider = new OpenAI();
  const schemas = provider.chatModelSchemas();

  it("allows decimal temperatures for o3", () => {
    const o3Schema = schemas.o3;
    const temperatureDef = o3Schema.config.def.temperature;

    if (temperatureDef.type !== "range") throw new Error("expected range config for temperature");
    expect(temperatureDef.min).toBe(0);
    expect(temperatureDef.max).toBe(2);
    expect(temperatureDef.step).toBe(0.01);
    expect(o3Schema.config.schema.safeParse({ temperature: 0.7 }).success).toBe(true);
  });

  // No registered model uses the o1-series config any more (o1 was retired 2026-10-23), but the
  // config is still exported, so keep its fixed-temperature contract covered.
  it("keeps the o1-series config temperature fixed at 1.0", () => {
    const o1Config = OpenAIChatModelConfigs.o1Series(100000, 4);
    const temperatureDef = o1Config.def.temperature;

    if (temperatureDef.type !== "range") throw new Error("expected range config for temperature");
    expect(temperatureDef.min).toBe(1);
    expect(temperatureDef.max).toBe(1);
    expect(o1Config.schema.safeParse({ temperature: 0.7 }).success).toBe(false);
  });

  it("exposes response format controls for chatgpt-5.2", () => {
    const chatgpt52Schema = schemas["chatgpt-5.2"];
    const responseFormatDef = chatgpt52Schema.config.def.responseFormat;

    expect(chatgpt52Schema.name).toBe("chatgpt-5.2");
    expect(responseFormatDef.type).toBe("select-string");
    if (responseFormatDef.type !== "select-string") throw new Error("expected select-string config for responseFormat");
    expect(responseFormatDef.choices).toEqual(expect.arrayContaining(["text", "json_object", "json_schema"]));
  });

  describe("reasoning effort enums and defaults", () => {
    const noneToMax = ["none", "low", "medium", "high", "xhigh", "max"];
    const lowToMax = ["low", "medium", "high", "xhigh", "max"];

    it.each(["gpt-6-astra", "gpt-6.1-sol", "gpt-6.2-astra", "gpt-6.2-sol"])("%s: low..max (no none), default medium", (literal) => {
      const def = effortDef(schemas[literal]);
      expect(def.choices).toEqual(lowToMax);
      expect(def.default).toBe("medium");
      expect(schemas[literal].config.schema.safeParse({ reasoningEffort: "none" }).success).toBe(false);
      expect(schemas[literal].config.schema.safeParse({ reasoningEffort: "max" }).success).toBe(true);
    });

    it.each(["gpt-6-luna", "gpt-6-sol", "gpt-6.1-terra"])("%s: none..max, default medium", (literal) => {
      const def = effortDef(schemas[literal]);
      expect(def.choices).toEqual(noneToMax);
      expect(def.default).toBe("medium");
      expect(schemas[literal].config.schema.safeParse({ reasoningEffort: "minimal" }).success).toBe(false);
    });

    it.each(["gpt-5.6-sol", "gpt-5.6-terra", "gpt-5.6-luna"])("%s: none..max without minimal, default medium", (literal) => {
      const def = effortDef(schemas[literal]);
      expect(def.choices).toEqual(noneToMax);
      expect(def.choices).not.toContain("minimal");
      expect(def.default).toBe("medium");
      expect(schemas[literal].config.schema.safeParse({ reasoningEffort: "minimal" }).success).toBe(false);
    });

    it("gpt-5.5: none..xhigh, default medium", () => {
      const def = effortDef(schemas["gpt-5.5"]);
      expect(def.choices).toEqual(["none", "low", "medium", "high", "xhigh"]);
      expect(def.default).toBe("medium");
    });

    it("gpt-5.2 and gpt-5.4 keep the 'none' default", () => {
      expect(effortDef(schemas["gpt-5.2"]).default).toBe("none");
      expect(effortDef(schemas["gpt-5.4"]).default).toBe("none");
    });

    it("gpt-5.5-pro: medium/high/xhigh, default high", () => {
      const def = effortDef(schemas["gpt-5.5-pro"]);
      expect(def.choices).toEqual(["medium", "high", "xhigh"]);
      expect(def.default).toBe("high");
    });

    it("gpt-5-pro: high only", () => {
      const def = effortDef(schemas["gpt-5-pro"]);
      expect(def.choices).toEqual(["high"]);
      expect(def.default).toBe("high");
      expect(schemas["gpt-5-pro"].config.schema.safeParse({ reasoningEffort: "medium" }).success).toBe(false);
    });
  });

  describe("1.05M-context GPT-5.x family", () => {
    it.each(["gpt-5.4", "gpt-5.4-pro", "gpt-5.5", "gpt-5.5-pro"])("%s reports the same 922000 usable input as gpt-5.6", (literal) => {
      expect(schemas[literal].maxInputTokens).toBe(922000);
      expect(schemas[literal].maxOutputTokens).toBe(128000);
    });
  });

  describe("GPT-6 family", () => {
    const gpt6 = ["gpt-6-astra", "gpt-6-sol", "gpt-6-luna", "gpt-6.1-sol", "gpt-6.1-terra", "gpt-6.2-astra", "gpt-6.2-sol"];

    it.each(gpt6)("%s: 922000 max input, 128000 max output, reasoning mode", (literal) => {
      const schema = schemas[literal];
      expect(schema.maxInputTokens).toBe(922000);
      expect(schema.maxOutputTokens).toBe(128000);
      const maxTokensDef = schema.config.def.maxTokens;
      if (maxTokensDef.type !== "range") throw new Error("expected range config for maxTokens");
      expect(maxTokensDef.max).toBe(128000);
      expect(schema.config.def.reasoningMode).toBeDefined();
    });

    it("gpt-6-astra has no temperature, topP or logProbs config", () => {
      const def = schemas["gpt-6-astra"].config.def as Record<string, unknown>;
      expect(def.temperature).toBeUndefined();
      expect(def.topP).toBeUndefined();
      expect(def.logProbs).toBeUndefined();
      expect(def.topLogProbs).toBeUndefined();
      // Other GPT-6 models keep the sampling controls.
      expect((schemas["gpt-6-sol"].config.def as Record<string, unknown>).temperature).toBeDefined();
    });

    it("gpt-6.2-astra has two pricing tiers split at 272K input tokens", () => {
      const price = schemas["gpt-6.2-astra"].price;
      if (!price) throw new Error("expected price for gpt-6.2-astra");
      expect(price.tokenRanges).toEqual([
        { minTokens: 0, maxTokens: 272000, prices: { base: { inputPricePerMillion: 8, outputPricePerMillion: 40 } } },
        { minTokens: 272000, maxTokens: null, prices: { base: { inputPricePerMillion: 16, outputPricePerMillion: 60 } } },
      ]);
    });
  });

  describe("spec corrections", () => {
    it.each(["gpt-5", "gpt-5-mini", "gpt-5-nano"])("%s: 272000 max input, 128000 max output", (literal) => {
      expect(schemas[literal].maxInputTokens).toBe(272000);
      expect(schemas[literal].maxOutputTokens).toBe(128000);
    });

    it("gpt-5-pro: 272000 max output tokens", () => {
      expect(schemas["gpt-5-pro"].maxOutputTokens).toBe(272000);
      const maxTokensDef = schemas["gpt-5-pro"].config.def.maxTokens;
      if (maxTokensDef.type !== "range") throw new Error("expected range config for maxTokens");
      expect(maxTokensDef.max).toBe(272000);
    });

    it.each(["gpt-4o", "gpt-4o-2024-08-06", "gpt-4o-mini", "gpt-4o-mini-2024-07-18"])("%s: 16384 max output tokens", (literal) => {
      expect(schemas[literal].maxOutputTokens).toBe(16384);
      const maxTokensDef = schemas[literal].config.def.maxTokens;
      if (maxTokensDef.type !== "range") throw new Error("expected range config for maxTokens");
      expect(maxTokensDef.max).toBe(16384);
    });

    it("gpt-5.3-codex: 272000 max input, 128000 max output", () => {
      expect(schemas["gpt-5.3-codex"].maxInputTokens).toBe(272000);
      expect(schemas["gpt-5.3-codex"].maxOutputTokens).toBe(128000);
    });

    it("gpt-5.3-codex is routed to the Responses API", async () => {
      const model = provider.chatModel({ modelName: "gpt-5.3-codex", apiKey: "test-api-key" });
      expect(await model.getCompleteChatUrl({})).toBe("https://api.openai.com/v1/responses");
    });
  });
});
