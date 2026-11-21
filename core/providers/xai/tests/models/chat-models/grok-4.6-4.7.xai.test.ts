import { describe, expect, it } from "vitest";

import { InvalidConfigError, SelectStringConfigItemDefType } from "@adaline/provider";
import { AssistantRoleLiteral, Config, createPartialTextMessage, MessageType, PartialChatResponseType } from "@adaline/types";

import { BaseChatModel, Grok_4_6, Grok_4_6_Schema, Grok_4_7, Grok_4_7_Schema, XAI } from "../../../src";

async function collectAsyncGenerator<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];
  for await (const value of generator) {
    results.push(value);
  }
  return results;
}

const cases: { literal: string; create: () => BaseChatModel; schema: typeof Grok_4_7_Schema }[] = [
  { literal: "grok-4.7", create: () => new Grok_4_7({ apiKey: "test-api-key", modelName: "grok-4.7" }), schema: Grok_4_7_Schema },
  { literal: "grok-4.6", create: () => new Grok_4_6({ apiKey: "test-api-key", modelName: "grok-4.6" }), schema: Grok_4_6_Schema },
];

describe.each(cases)("$literal", ({ literal, create, schema }) => {
  describe("schema", () => {
    it("should carry the documented limits and modalities", () => {
      expect(schema.name).toBe(literal);
      expect(schema.maxInputTokens).toBe(500000);
      expect(schema.maxOutputTokens).toBe(131072);
      expect(schema.modalities).toEqual(["text", "tool-call", "tool-response"]);
    });

    it("should support structured outputs and tools via the provider factory", () => {
      const model = new XAI().chatModel({ modelName: literal, apiKey: "test-api-key" });
      expect(model.modelSchema).toBe(schema);
    });
  });

  describe("reasoningEffort config", () => {
    it.each(["low", "medium", "high", "xhigh"])("should accept '%s'", (effort) => {
      expect(create().transformConfig(Config().parse({ reasoningEffort: effort }), [], [])).toEqual({ reasoning_effort: effort });
    });

    it.each(["none", "minimal", "max"])("should reject '%s' (reasoning cannot be disabled)", (effort) => {
      expect(() => create().transformConfig(Config().parse({ reasoningEffort: effort }), [], [])).toThrow(InvalidConfigError);
    });

    it("should document a 'high' default without sending it when the caller omits the param", () => {
      const def = schema.config.def.reasoningEffort as SelectStringConfigItemDefType;
      expect(def.param).toBe("reasoning_effort");
      expect(def.default).toBe("high");
      expect(def.choices).toEqual(["low", "medium", "high", "xhigh"]);
      expect(create().transformConfig(Config().parse({}), [], [])).toEqual({});
    });

    it("should combine reasoning effort with the other reasoning-model params", () => {
      expect(
        create().transformConfig(Config().parse({ reasoningEffort: "xhigh", temperature: 0.4, maxTokens: 0, seed: 7 }), [], [])
      ).toEqual({ reasoning_effort: "xhigh", temperature: 0.4, max_tokens: 131072, seed: 7 });
    });

    it("should never send logprobs / top_logprobs, which xAI ignores on grok-4.20+", () => {
      expect(create().transformConfig(Config().parse({ logProbs: true, topLogProbs: 3 }), [], [])).toEqual({});
      expect("logProbs" in schema.config.def).toBe(false);
    });

    it("should carry reasoning_effort from an incoming request into config", () => {
      const request = create().transformModelRequest({
        model: literal,
        messages: [{ role: "user", content: "Hello!" }],
        reasoning_effort: "xhigh",
      });
      expect(request.config.reasoningEffort).toBe("xhigh");
    });
  });

  describe("getCompleteChatData", () => {
    it("should build a request body with the model name and reasoning effort", async () => {
      const messages: MessageType[] = [{ role: "user", content: [{ modality: "text", value: "Hi" }] }];
      const data = await create().getCompleteChatData(Config().parse({ reasoningEffort: "medium" }), messages);
      expect(data).toEqual({
        model: literal,
        reasoning_effort: "medium",
        messages: [{ role: "user", content: [{ type: "text", text: "Hi" }] }],
      });
    });
  });

  describe("transformCompleteChatResponse", () => {
    it("should map text content and usage from a mocked xAI response", () => {
      const response = {
        id: "a3d1c2e4-0b6f-4c1e-9d6a-7f2e8b9c0d1e",
        object: "chat.completion",
        created: 1763596800,
        model: literal,
        system_fingerprint: "fp_6ca29cf396",
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: "The capital of France is Paris.", refusal: null },
            finish_reason: "stop",
          },
        ],
        usage: { prompt_tokens: 14, completion_tokens: 9, total_tokens: 247, reasoning_tokens: 224 },
      };

      const result = create().transformCompleteChatResponse(response);
      expect(result.messages).toEqual([
        { role: AssistantRoleLiteral, content: [{ modality: "text", value: "The capital of France is Paris." }] },
      ]);
      expect(result.usage).toEqual({ promptTokens: 14, completionTokens: 9, totalTokens: 247 });
      expect(result.logProbs).toBeUndefined();
    });
  });

  describe("transformStreamChatResponseChunk", () => {
    it("should yield partial text and the final usage from mocked SSE chunks", async () => {
      const line = (body: object) => `data: ${JSON.stringify(body)}\n\n`;
      const base = {
        id: "b7e2",
        object: "chat.completion.chunk",
        created: 1763596800,
        model: literal,
        system_fingerprint: "fp_6ca29cf396",
      };
      const sse =
        line({ ...base, choices: [{ index: 0, delta: { role: "assistant", content: "The capital" } }] }) +
        line({ ...base, choices: [{ index: 0, delta: { content: " is Paris." } }] }) +
        line({ ...base, choices: [{ index: 0, delta: {}, finish_reason: "stop" }] }) +
        line({ ...base, choices: [], usage: { prompt_tokens: 14, completion_tokens: 9, total_tokens: 247, reasoning_tokens: 224 } }) +
        "data: [DONE]\n\n";

      // Split mid-line to exercise buffering across network chunks.
      const splitAt = sse.indexOf(" is Paris.") + 3;
      const model = create();
      const partials: PartialChatResponseType[] = [];
      let buffer = "";
      for (const chunk of [sse.slice(0, splitAt), sse.slice(splitAt)]) {
        const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, buffer));
        results.forEach((r) => partials.push(r.partialResponse));
        buffer = results.length > 0 ? results[results.length - 1].buffer : buffer;
      }

      const messages = partials.flatMap((p) => p.partialMessages);
      expect(messages).toEqual([
        createPartialTextMessage(AssistantRoleLiteral, "The capital"),
        createPartialTextMessage(AssistantRoleLiteral, " is Paris."),
      ]);
      const usages = partials.filter((p) => p.usage).map((p) => p.usage);
      expect(usages).toEqual([{ promptTokens: 14, completionTokens: 9, totalTokens: 247 }]);
    });
  });
});
