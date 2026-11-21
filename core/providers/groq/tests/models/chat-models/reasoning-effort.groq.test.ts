import { describe, expect, it } from "vitest";

import { ChatModelSchemaType, InvalidConfigError, SelectStringConfigItemDefType } from "@adaline/provider";
import { AssistantRoleLiteral, Config, createPartialTextMessage, MessageType, PartialChatResponseType } from "@adaline/types";

import {
  BaseChatModelGroq,
  Gpt_Oss_20b,
  Gpt_Oss_20bSchema,
  Gpt_Oss_120b,
  Gpt_Oss_120bSchema,
  Gpt_Oss_Safeguard_20b,
  Gpt_Oss_Safeguard_20bSchema,
  Groq,
  Llama_Prompt_Guard_2_22m,
  Qwen3_8_27b,
  Qwen3_8_27bSchema,
} from "../../../src";

async function collectAsyncGenerator<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];
  for await (const value of generator) {
    results.push(value);
  }
  return results;
}

const apiKey = "test-api-key";

describe("Groq reasoning effort", () => {
  const gptOssCases: { literal: string; create: () => BaseChatModelGroq; schema: ChatModelSchemaType }[] = [
    {
      literal: "openai/gpt-oss-20b",
      create: () => new Gpt_Oss_20b({ apiKey, modelName: "openai/gpt-oss-20b" }),
      schema: Gpt_Oss_20bSchema,
    },
    {
      literal: "openai/gpt-oss-120b",
      create: () => new Gpt_Oss_120b({ apiKey, modelName: "openai/gpt-oss-120b" }),
      schema: Gpt_Oss_120bSchema,
    },
    {
      literal: "openai/gpt-oss-safeguard-20b",
      create: () => new Gpt_Oss_Safeguard_20b({ apiKey, modelName: "openai/gpt-oss-safeguard-20b" }),
      schema: Gpt_Oss_Safeguard_20bSchema,
    },
  ];

  describe.each(gptOssCases)("$literal", ({ create, schema }) => {
    it.each(["low", "medium", "high"])("should accept '%s' and send it as reasoning_effort", (effort) => {
      expect(create().transformConfig(Config().parse({ reasoningEffort: effort }), [], [])).toEqual({ reasoning_effort: effort });
    });

    it.each(["none", "minimal", "xhigh", "default"])("should reject '%s'", (effort) => {
      expect(() => create().transformConfig(Config().parse({ reasoningEffort: effort }), [], [])).toThrow(InvalidConfigError);
    });

    it("should have no default and not send reasoning_effort when omitted", () => {
      const def = schema.config.def.reasoningEffort as SelectStringConfigItemDefType;
      expect(def.param).toBe("reasoning_effort");
      expect(def.default).toBeNull();
      expect(def.choices).toEqual(["low", "medium", "high"]);
      expect(create().transformConfig(Config().parse({}), [], [])).toEqual({});
    });

    it("should keep the base Groq params alongside reasoning effort", () => {
      expect(create().transformConfig(Config().parse({ reasoningEffort: "high", temperature: 0.2, maxTokens: 4096 }), [], [])).toEqual({
        reasoning_effort: "high",
        temperature: 0.2,
        max_tokens: 4096,
      });
    });
  });

  it("should not add reasoning effort to models Groq documents no control for", () => {
    const model = new Llama_Prompt_Guard_2_22m({ apiKey, modelName: "meta-llama/llama-prompt-guard-2-22m" });
    expect("reasoningEffort" in model.modelSchema.config.def).toBe(false);
  });
});

describe("qwen/qwen3.8-27b", () => {
  const create = () => new Qwen3_8_27b({ apiKey, modelName: "qwen/qwen3.8-27b" });

  describe("schema", () => {
    it("should carry the documented limits and text+tool modalities", () => {
      expect(Qwen3_8_27bSchema.name).toBe("qwen/qwen3.8-27b");
      expect(Qwen3_8_27bSchema.maxInputTokens).toBe(131072);
      expect(Qwen3_8_27bSchema.maxOutputTokens).toBe(16384);
      expect(Qwen3_8_27bSchema.modalities).toEqual(["text", "tool-call", "tool-response"]);
      expect(Qwen3_8_27bSchema.description).toContain("Direct successor to Qwen3.6 27B");
    });

    it("should be reachable through the provider factory", () => {
      expect(new Groq().chatModel({ modelName: "qwen/qwen3.8-27b", apiKey }).modelSchema).toBe(Qwen3_8_27bSchema);
    });
  });

  describe("reasoningEffort config", () => {
    it.each(["none", "low", "medium", "high"])("should accept '%s'", (effort) => {
      expect(create().transformConfig(Config().parse({ reasoningEffort: effort }), [], [])).toEqual({ reasoning_effort: effort });
    });

    it.each(["default", "minimal", "xhigh"])("should reject '%s'", (effort) => {
      expect(() => create().transformConfig(Config().parse({ reasoningEffort: effort }), [], [])).toThrow(InvalidConfigError);
    });

    it("should have no default and not send reasoning_effort when omitted", () => {
      const def = Qwen3_8_27bSchema.config.def.reasoningEffort as SelectStringConfigItemDefType;
      expect(def.default).toBeNull();
      expect(def.choices).toEqual(["none", "low", "medium", "high"]);
      expect(create().transformConfig(Config().parse({}), [], [])).toEqual({});
    });

    it("should cap maxTokens at the 16384 output limit", () => {
      expect(create().transformConfig(Config().parse({ maxTokens: 16384 }), [], [])).toEqual({ max_tokens: 16384 });
      expect(() => create().transformConfig(Config().parse({ maxTokens: 16385 }), [], [])).toThrow(InvalidConfigError);
    });

    it("should carry reasoning_effort from an incoming request into config", () => {
      const request = create().transformModelRequest({
        model: "qwen/qwen3.8-27b",
        messages: [{ role: "user", content: "Hello!" }],
        reasoning_effort: "none",
      });
      expect(request.config.reasoningEffort).toBe("none");
    });
  });

  describe("getCompleteChatData", () => {
    it("should build a request body with the model name and reasoning effort", async () => {
      const messages: MessageType[] = [{ role: "user", content: [{ modality: "text", value: "Hi" }] }];
      const data = await create().getCompleteChatData(Config().parse({ reasoningEffort: "low" }), messages);
      expect(data).toMatchObject({ model: "qwen/qwen3.8-27b", reasoning_effort: "low" });
    });
  });

  describe("transformCompleteChatResponse", () => {
    it("should map text content and usage from a mocked Groq response", () => {
      const response = {
        id: "chatcmpl-f51b2cd2-bef7-417e-964e-a08f0b513c22",
        object: "chat.completion",
        created: 1763596800,
        model: "qwen/qwen3.8-27b",
        system_fingerprint: "fp_a4be8e0f7b",
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: "Paris is the capital of France." },
            logprobs: null,
            finish_reason: "stop",
          },
        ],
        usage: {
          queue_time: 0.0179,
          prompt_tokens: 18,
          prompt_time: 0.0021,
          completion_tokens: 8,
          completion_time: 0.0124,
          total_tokens: 26,
          total_time: 0.0145,
        },
        x_groq: { id: "req_01kaaaaaaaaaaaaaaaaaaaaaaa" },
      };

      const result = create().transformCompleteChatResponse(response);
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].role).toBe(AssistantRoleLiteral);
      expect(result.messages[0].content).toEqual([expect.objectContaining({ modality: "text", value: "Paris is the capital of France." })]);
      expect(result.usage).toEqual({ promptTokens: 18, completionTokens: 8, totalTokens: 26 });
    });
  });

  describe("transformStreamChatResponseChunk", () => {
    it("should yield partial text and the final usage from mocked SSE chunks", async () => {
      const line = (body: object) => `data: ${JSON.stringify(body)}\n\n`;
      const base = {
        id: "chatcmpl-9c1d",
        object: "chat.completion.chunk",
        created: 1763596800,
        model: "qwen/qwen3.8-27b",
        system_fingerprint: "fp_a4be8e0f7b",
      };
      const usage = { prompt_tokens: 18, completion_tokens: 8, total_tokens: 26 };
      const sse =
        line({ ...base, choices: [{ index: 0, delta: { role: "assistant", content: "" }, logprobs: null, finish_reason: null }] }) +
        line({ ...base, choices: [{ index: 0, delta: { content: "Paris is" }, logprobs: null, finish_reason: null }] }) +
        line({ ...base, choices: [{ index: 0, delta: { content: " the capital." }, logprobs: null, finish_reason: null }] }) +
        line({ ...base, choices: [{ index: 0, delta: {}, logprobs: null, finish_reason: "stop" }], usage }) +
        "data: [DONE]\n\n";

      // Split mid-line to exercise buffering across network chunks.
      const splitAt = sse.indexOf(" the capital.") + 4;
      const model = create();
      const partials: PartialChatResponseType[] = [];
      let buffer = "";
      for (const chunk of [sse.slice(0, splitAt), sse.slice(splitAt)]) {
        const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, buffer));
        results.forEach((r) => partials.push(r.partialResponse));
        buffer = results.length > 0 ? results[results.length - 1].buffer : buffer;
      }

      const text = partials
        .flatMap((p) => p.partialMessages)
        .map((m) => (m.partialContent.modality === "partial-text" ? m.partialContent.value : ""))
        .join("");
      expect(text).toBe("Paris is the capital.");
      expect(partials.flatMap((p) => p.partialMessages)).toContainEqual(createPartialTextMessage(AssistantRoleLiteral, "Paris is"));
      const usages = partials.filter((p) => p.usage).map((p) => p.usage);
      expect(usages).toEqual([{ promptTokens: 18, completionTokens: 8, totalTokens: 26 }]);
    });
  });
});
