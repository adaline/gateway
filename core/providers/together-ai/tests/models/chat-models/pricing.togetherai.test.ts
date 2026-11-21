import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ChatModelSchema, ModelResponseError } from "@adaline/provider";
import { ChatModelPrice } from "@adaline/types";

import { TogetherAIChatModelConfigs } from "../../../src/configs";
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
    def: TogetherAIChatModelConfigs.base(128000, 4).def,
    schema: TogetherAIChatModelConfigs.base(128000, 4).schema,
  },
});

const modelFor = (modelName: string) => new BaseChatModel(modelSchema, { apiKey: "test-api-key", modelName });

describe("Together AI pricing catalog", () => {
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


  it("throws for a model Together no longer serves", () => {
    expect(() => modelFor("meta-llama/Llama-2-70b-hf").getModelPricing()).toThrow(ModelResponseError);
  });
});
