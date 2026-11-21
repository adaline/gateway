import { describe, expect, it } from "vitest";

import { ProviderError } from "@adaline/provider";
import {
  AssistantRoleLiteral,
  ChatModelPrice,
  Config,
  createPartialReasoningMessage,
  createPartialTextMessage,
  MessageType,
} from "@adaline/types";

import { Bedrock } from "../../../src";
import pricingData from "../../../src/models/pricing.json";

async function collectAsyncGenerator<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];
  for await (const value of generator) {
    results.push(value);
  }
  return results;
}

const provider = new Bedrock();
const credentials = { awsAccessKeyId: "test-access-key", awsSecretAccessKey: "test-secret-key" };
const modelFor = (modelName: string) => provider.chatModel({ modelName, ...credentials });
const messages: MessageType[] = [{ role: "user", content: [{ modality: "text", value: "Hi" }] }];

describe("Bedrock catalog parity", () => {
  const schemas = provider.chatModelSchemas();

  it("registers exactly the chat models that have pricing", () => {
    expect(new Set(provider.chatModelLiterals())).toEqual(new Set(Object.keys(pricingData)));
  });

  it.each(Object.entries(schemas))("%s has a valid price and consistent token limits", (literal, schema) => {
    expect(schema.name).toBe(literal);
    expect(ChatModelPrice.safeParse(schema.price).success).toBe(true);
    const maxTokensDef = schema.config.def.maxTokens;
    if (maxTokensDef.type !== "range") throw new Error("expected range config for maxTokens");
    expect(maxTokensDef.max).toBe(schema.maxOutputTokens);
    expect(schema.config.def.awsRegion).toBeDefined();
  });

  it("drops the models that reached end of life", () => {
    for (const literal of [
      "anthropic.claude-3-haiku-20240307-v1:0",
      "anthropic.claude-3-5-haiku-20241022-v1:0",
      "anthropic.claude-sonnet-4-20250514-v1:0",
    ]) {
      expect(schemas[literal]).toBeUndefined();
      expect(() => modelFor(literal)).toThrow(ProviderError);
    }
  });

  it("adds the 2026-11 Claude models with their Bedrock prices", () => {
    const prices: Record<string, [number, number]> = {
      "anthropic.claude-opus-5-5": [4, 20],
      "anthropic.claude-sonnet-5-5": [2, 10],
      "anthropic.claude-fable-5-1": [10, 50],
      "anthropic.claude-fable-5-2": [8, 40],
      "anthropic.claude-haiku-5-5": [0.1, 0.5],
    };
    for (const [literal, [input, output]] of Object.entries(prices)) {
      expect(schemas[literal].price.tokenRanges[0].prices.base).toEqual({ inputPricePerMillion: input, outputPricePerMillion: output });
    }
    expect(schemas["anthropic.claude-haiku-5-5"].price.tokenRanges[1]).toMatchObject({
      minTokens: 100001,
      maxTokens: null,
      prices: { base: { inputPricePerMillion: 0.5, outputPricePerMillion: 2.5 } },
    });
  });

  it("carries the corrected limits", () => {
    expect(schemas["anthropic.claude-opus-4-6-v1"].maxInputTokens).toBe(1000000);
    expect(schemas["anthropic.claude-haiku-4-5-20251001-v1:0"].maxOutputTokens).toBe(64000);
    expect(schemas["anthropic.claude-sonnet-4-6"].maxOutputTokens).toBe(64000);
  });

  it.each(["us", "eu", "apac", "au", "jp", "ca", "global", "us-gov"])("resolves the %s. inference profile prefix", (prefix) => {
    const model = modelFor(`${prefix}.anthropic.claude-sonnet-5-5`);
    expect(model.modelSchema.name).toBe("anthropic.claude-sonnet-5-5");
  });
});

describe("Bedrock thinking and effort configs", () => {
  it("sends adaptive thinking and effort, and strips the AWS region from the body", () => {
    const model = modelFor("anthropic.claude-opus-5-5");
    expect(
      model.transformConfig(Config().parse({ awsRegion: "us-west-2", thinkingMode: "adaptive", reasoningEffort: "high" }), messages, [])
    ).toEqual({
      max_tokens: 128000,
      thinking: { type: "adaptive", display: "summarized" },
      output_config: { effort: "high" },
    });
  });

  it("rejects budget_tokens on adaptive-only models", () => {
    const model = modelFor("anthropic.claude-fable-5-2");
    // The error class comes from @adaline/anthropic's bundle, so match on its name rather than instanceof.
    expect(() => model.transformConfig(Config().parse({ reasoningEnabled: true, maxReasoningTokens: 1024 }), messages, [])).toThrow(
      expect.objectContaining({ name: "InvalidConfigError" })
    );
  });

  it("never sends sampling parameters to models that reject them", () => {
    const transformed = modelFor("anthropic.claude-fable-5").transformConfig(Config().parse({ temperature: 0.2, topK: 5 }), messages, []);
    expect(transformed).not.toHaveProperty("temperature");
    expect(transformed).not.toHaveProperty("top_k");
  });

  it("enables extended thinking on claude-haiku-4-5", () => {
    const model = modelFor("anthropic.claude-haiku-4-5-20251001-v1:0");
    expect(
      model.transformConfig(Config().parse({ maxTokens: 8000, reasoningEnabled: true, maxReasoningTokens: 2000 }), messages, [])
    ).toEqual({
      max_tokens: 8000,
      thinking: { type: "enabled", budget_tokens: 2000 },
    });
  });
});

describe("Bedrock text generation and streaming", () => {
  it("returns text and usage from a complete response", () => {
    const model = modelFor("anthropic.claude-sonnet-5-5");
    const result = model.transformCompleteChatResponse({
      id: "msg_bdrk_01",
      type: "message",
      role: "assistant",
      model: "claude-sonnet-5-5",
      content: [{ type: "text", text: "Hello from Bedrock." }],
      stop_reason: "end_turn",
      stop_sequence: null,
      usage: { input_tokens: 8, output_tokens: 5 },
    });
    expect(result.messages[0]).toEqual({ role: AssistantRoleLiteral, content: [{ modality: "text", value: "Hello from Bedrock." }] });
    expect(result.usage).toEqual({ promptTokens: 8, completionTokens: 5, totalTokens: 13 });
  });

  it("decodes event-stream frames into thinking and text deltas", async () => {
    const model = modelFor("anthropic.claude-haiku-5-5");
    const frame = (payload: object) => `{"bytes":"${Buffer.from(JSON.stringify(payload)).toString("base64")}"}`;
    const chunk = [
      frame({
        type: "message_start",
        message: {
          id: "msg_bdrk_02",
          type: "message",
          role: "assistant",
          content: [],
          model: "claude-haiku-5-5",
          stop_reason: null,
          stop_sequence: null,
          usage: { input_tokens: 11, output_tokens: 1 },
        },
      }),
      frame({ type: "content_block_start", index: 0, content_block: { type: "thinking", thinking: "" } }),
      frame({ type: "content_block_delta", index: 0, delta: { type: "thinking_delta", thinking: "Short answer." } }),
      frame({ type: "content_block_start", index: 1, content_block: { type: "text", text: "" } }),
      frame({ type: "content_block_delta", index: 1, delta: { type: "text_delta", text: "Hi!" } }),
      frame({ type: "message_delta", delta: { stop_reason: "end_turn", stop_sequence: null }, usage: { output_tokens: 9 } }),
    ].join("");

    const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));
    const partialMessages = results.flatMap((result) => result.partialResponse.partialMessages);
    expect(partialMessages).toContainEqual(createPartialReasoningMessage(AssistantRoleLiteral, "Short answer."));
    expect(partialMessages).toContainEqual(createPartialTextMessage(AssistantRoleLiteral, "Hi!"));
    const usages = results.map((result) => result.partialResponse.usage).filter((usage) => usage !== undefined);
    expect(usages[usages.length - 1]).toMatchObject({ completionTokens: 9 });
  });
});
