import { describe, expect, it } from "vitest";

import { InvalidConfigError } from "@adaline/provider";
import {
  AssistantRoleLiteral,
  Config,
  createPartialReasoningMessage,
  createPartialTextMessage,
  createReasoningContent,
  createTextContent,
  MessageType,
  ToolType,
  UserRoleLiteral,
} from "@adaline/types";

import { Anthropic } from "../../../src";

async function collectAsyncGenerator<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];
  for await (const value of generator) {
    results.push(value);
  }
  return results;
}

const provider = new Anthropic();
const modelFor = (modelName: string) => provider.chatModel({ modelName, apiKey: "test-api-key" });

const messages: MessageType[] = [{ role: UserRoleLiteral, content: [{ modality: "text", value: "Hi" }] }];
const tools: ToolType[] = [
  {
    type: "function",
    definition: {
      schema: {
        name: "get_weather",
        description: "Get the weather",
        parameters: { type: "object", properties: { city: { type: "string" } }, required: ["city"] },
      },
    },
  },
];

const configDef = (modelName: string) => provider.chatModelSchemas()[modelName].config.def;

describe("Anthropic thinking and effort configs", () => {
  describe("adaptive thinking models", () => {
    it.each(["claude-opus-4-7", "claude-opus-4-8", "claude-opus-5", "claude-sonnet-5", "claude-fable-5", "claude-opus-5-5"])(
      "%s rejects budget_tokens and never sends sampling parameters",
      (modelName) => {
        const model = modelFor(modelName);
        expect(() => model.transformConfig(Config().parse({ reasoningEnabled: true, maxReasoningTokens: 2048 }), messages, [])).toThrow(
          InvalidConfigError
        );
        // Not part of these models' config schemas, so they are dropped instead of triggering a 400 from the API.
        const transformed = model.transformConfig(Config().parse({ temperature: 0.5, topP: 0.9, topK: 5 }), messages, []);
        expect(transformed).not.toHaveProperty("temperature");
        expect(transformed).not.toHaveProperty("top_p");
        expect(transformed).not.toHaveProperty("top_k");
        expect(configDef(modelName)).not.toHaveProperty("temperature");
      }
    );

    it("maps adaptive thinking to summarized display and effort to output_config", () => {
      const model = modelFor("claude-opus-5-5");
      expect(model.transformConfig(Config().parse({ thinkingMode: "adaptive", reasoningEffort: "max" }), messages, [])).toEqual({
        max_tokens: 128000,
        thinking: { type: "adaptive", display: "summarized" },
        output_config: { effort: "max" },
      });
    });

    it("sends nothing for thinking or effort when they are not set, so the API defaults apply", () => {
      const model = modelFor("claude-opus-5-5");
      expect(model.transformConfig(Config().parse({ maxTokens: 1000 }), messages, [])).toEqual({ max_tokens: 1000 });
    });

    it("documents each model's thinking modes and effort defaults", () => {
      const expectations: Record<string, { modes: string[]; mode: string; levels: string[]; effort: string }> = {
        "claude-fable-5-2": { modes: ["adaptive"], mode: "adaptive", levels: ["low", "medium", "high", "xhigh", "max"], effort: "high" },
        "claude-opus-5-5": { modes: ["adaptive"], mode: "adaptive", levels: ["low", "medium", "high", "xhigh", "max"], effort: "medium" },
        "claude-sonnet-5-5": {
          modes: ["adaptive", "between_tools"],
          mode: "adaptive",
          levels: ["low", "medium", "high", "xhigh", "max"],
          effort: "high",
        },
        "claude-haiku-5-5": {
          modes: ["adaptive", "disabled"],
          mode: "adaptive",
          levels: ["low", "medium", "high", "xhigh", "max"],
          effort: "medium",
        },
        "claude-opus-4-8": {
          modes: ["adaptive", "disabled"],
          mode: "disabled",
          levels: ["low", "medium", "high", "xhigh", "max"],
          effort: "high",
        },
        "claude-sonnet-4-6": {
          modes: ["adaptive", "disabled"],
          mode: "disabled",
          levels: ["low", "medium", "high", "max"],
          effort: "high",
        },
      };
      for (const [modelName, expected] of Object.entries(expectations)) {
        const def = configDef(modelName);
        if (def.thinkingMode.type !== "select-string" || def.reasoningEffort.type !== "select-string") {
          throw new Error(`expected select-string thinking configs for ${modelName}`);
        }
        expect(def.thinkingMode.choices).toEqual(expected.modes);
        expect(def.thinkingMode.default).toBe(expected.mode);
        expect(def.reasoningEffort.choices).toEqual(expected.levels);
        expect(def.reasoningEffort.default).toBe(expected.effort);
      }
    });

    it("rejects thinking modes the model does not accept", () => {
      expect(() => modelFor("claude-opus-5-5").transformConfig(Config().parse({ thinkingMode: "disabled" }), messages, [])).toThrow(
        InvalidConfigError
      );
      expect(() => modelFor("claude-sonnet-5-5").transformConfig(Config().parse({ thinkingMode: "disabled" }), messages, [])).toThrow(
        InvalidConfigError
      );
      expect(modelFor("claude-sonnet-5-5").transformConfig(Config().parse({ thinkingMode: "between_tools" }), messages, [])).toEqual({
        max_tokens: 128000,
        thinking: { type: "between_tools" },
      });
      expect(modelFor("claude-haiku-5-5").transformConfig(Config().parse({ thinkingMode: "disabled" }), messages, [])).toEqual({
        max_tokens: 128000,
        thinking: { type: "disabled" },
      });
    });

    it("rejects effort levels the model does not support", () => {
      expect(() => modelFor("claude-sonnet-4-6").transformConfig(Config().parse({ reasoningEffort: "xhigh" }), messages, [])).toThrow(
        InvalidConfigError
      );
      expect(modelFor("claude-sonnet-4-6").transformConfig(Config().parse({ reasoningEffort: "max" }), messages, [])).toEqual({
        max_tokens: 128000,
        output_config: { effort: "max" },
      });
    });

    it("keeps sampling parameters on the 4.6 models", () => {
      expect(modelFor("claude-opus-4-6").transformConfig(Config().parse({ temperature: 0.4 }), messages, [])).toEqual({
        max_tokens: 128000,
        temperature: 0.4,
      });
    });
  });

  describe("forced tool use", () => {
    it.each(["claude-opus-5-5", "claude-sonnet-5-5", "claude-fable-5-1", "claude-fable-5-2"])(
      "%s rejects tool_choice 'any' and named tools but accepts 'auto' and 'none'",
      (modelName) => {
        const model = modelFor(modelName);
        expect(() => model.transformConfig(Config().parse({ toolChoice: "any" }), messages, tools)).toThrow(InvalidConfigError);
        expect(() => model.transformConfig(Config().parse({ toolChoice: "get_weather" }), messages, tools)).toThrow(InvalidConfigError);
        expect(model.transformConfig(Config().parse({ toolChoice: "auto" }), messages, tools)).toMatchObject({
          tool_choice: { type: "auto" },
        });
        expect(model.transformConfig(Config().parse({ toolChoice: "none" }), messages, tools)).toMatchObject({
          tool_choice: { type: "none" },
        });
      }
    );

    it("still allows forced tool use where the model accepts it", () => {
      const model = modelFor("claude-haiku-5-5");
      expect(model.transformConfig(Config().parse({ toolChoice: "get_weather" }), messages, tools)).toMatchObject({
        tool_choice: { type: "tool", name: "get_weather" },
      });
    });
  });

  describe("extended thinking models", () => {
    it("enables budget thinking on claude-haiku-4-5", () => {
      const model = modelFor("claude-haiku-4-5-20251001");
      expect(
        model.transformConfig(Config().parse({ maxTokens: 16000, reasoningEnabled: true, maxReasoningTokens: 4096 }), messages, [])
      ).toEqual({
        max_tokens: 16000,
        thinking: { type: "enabled", budget_tokens: 4096 },
      });
    });

    it("composes effort with budget_tokens on claude-opus-4-5", () => {
      const model = modelFor("claude-opus-4-5-20251101");
      expect(
        model.transformConfig(
          Config().parse({ maxTokens: 16000, reasoningEnabled: true, maxReasoningTokens: 4096, reasoningEffort: "low" }),
          messages,
          []
        )
      ).toEqual({
        max_tokens: 16000,
        thinking: { type: "enabled", budget_tokens: 4096 },
        output_config: { effort: "low" },
      });
      expect(() => model.transformConfig(Config().parse({ reasoningEffort: "max" }), messages, [])).toThrow(InvalidConfigError);
    });
  });

  describe("transformModelRequest", () => {
    it("maps thinking and output_config back to config", () => {
      const model = modelFor("claude-sonnet-5-5");
      const { config } = model.transformModelRequest({
        model: "claude-sonnet-5-5",
        max_tokens: 4096,
        messages: [{ role: "user", content: "Hi" }],
        thinking: { type: "between_tools" },
        output_config: { effort: "medium" },
      });
      expect(config).toMatchObject({ maxTokens: 4096, thinkingMode: "between_tools", reasoningEffort: "medium" });
    });

    it("maps extended thinking back to reasoningEnabled and maxReasoningTokens", () => {
      const model = modelFor("claude-opus-4-5-20251101");
      const { config } = model.transformModelRequest({
        model: "claude-opus-4-5-20251101",
        max_tokens: 4096,
        messages: [{ role: "user", content: "Hi" }],
        thinking: { type: "enabled", budget_tokens: 2048 },
      });
      expect(config).toMatchObject({ reasoningEnabled: true, maxReasoningTokens: 2048 });
    });
  });
});

describe("Anthropic text generation with adaptive thinking", () => {
  it("returns summarized thinking, text and usage from a complete response", () => {
    const model = modelFor("claude-opus-5-5");
    const result = model.transformCompleteChatResponse({
      id: "msg_01",
      type: "message",
      role: "assistant",
      model: "claude-opus-5-5",
      content: [
        { type: "thinking", thinking: "The user greeted me.", signature: "sig_abc" },
        { type: "text", text: "Hello! How can I help?" },
      ],
      stop_reason: "end_turn",
      stop_sequence: null,
      usage: { input_tokens: 12, output_tokens: 40 },
    });

    expect(result.messages).toEqual([
      {
        role: AssistantRoleLiteral,
        content: [createReasoningContent("The user greeted me.", "sig_abc"), createTextContent("Hello! How can I help?")],
      },
    ]);
    expect(result.usage).toEqual({ promptTokens: 12, completionTokens: 40, totalTokens: 52 });
  });

  it("returns a refusal as a normal response", () => {
    const model = modelFor("claude-fable-5-2");
    const result = model.transformCompleteChatResponse({
      id: "msg_02",
      type: "message",
      role: "assistant",
      model: "claude-fable-5-2",
      content: [{ type: "text", text: "I can't help with that." }],
      stop_reason: "refusal",
      stop_sequence: null,
      usage: { input_tokens: 9, output_tokens: 6 },
    });
    expect(result.messages[0].content).toEqual([createTextContent("I can't help with that.")]);
  });
});

describe("Anthropic streaming with adaptive thinking", () => {
  const sse = (payload: object) => `data: ${JSON.stringify(payload)}\n`;

  it("streams thinking deltas, text deltas and final usage", async () => {
    const model = modelFor("claude-sonnet-5-5");
    const chunk = [
      sse({
        type: "message_start",
        message: {
          id: "msg_03",
          type: "message",
          role: "assistant",
          content: [],
          model: "claude-sonnet-5-5",
          stop_reason: null,
          stop_sequence: null,
          usage: { input_tokens: 20, output_tokens: 1 },
        },
      }),
      sse({ type: "content_block_start", index: 0, content_block: { type: "thinking", thinking: "" } }),
      sse({ type: "content_block_delta", index: 0, delta: { type: "thinking_delta", thinking: "Planning a reply." } }),
      sse({ type: "content_block_stop", index: 0 }),
      sse({ type: "content_block_start", index: 1, content_block: { type: "text", text: "" } }),
      sse({ type: "content_block_delta", index: 1, delta: { type: "text_delta", text: "Hi there" } }),
      sse({ type: "content_block_stop", index: 1 }),
      sse({ type: "message_delta", delta: { stop_reason: "end_turn", stop_sequence: null }, usage: { output_tokens: 30 } }),
      sse({ type: "message_stop" }),
    ].join("");

    const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));
    const partialMessages = results.flatMap((result) => result.partialResponse.partialMessages);

    expect(partialMessages).toContainEqual(createPartialReasoningMessage(AssistantRoleLiteral, "Planning a reply."));
    expect(partialMessages).toContainEqual(createPartialTextMessage(AssistantRoleLiteral, "Hi there"));

    const usages = results.map((result) => result.partialResponse.usage).filter((usage) => usage !== undefined);
    expect(usages[0]).toMatchObject({ promptTokens: 20 });
    expect(usages[usages.length - 1]).toMatchObject({ completionTokens: 30 });
  });
});
