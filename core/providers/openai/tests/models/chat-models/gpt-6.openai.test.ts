import { describe, expect, it } from "vitest";

import { ChatModelV1 } from "@adaline/provider";
import { AssistantRoleLiteral, ConfigType, MessageType, SystemRoleLiteral, TextModalityLiteral, UserRoleLiteral } from "@adaline/types";

import { OpenAI } from "../../../src";

// All HTTP is out of scope here: these tests only exercise the request/response transforms
// with mocked payloads. No network calls are made.

const provider = new OpenAI();
const API_KEY = "test-api-key";

function makeModel(modelName: string): ChatModelV1 {
  return provider.chatModel({ modelName, apiKey: API_KEY });
}

const messages: MessageType[] = [
  { role: SystemRoleLiteral, content: [{ modality: TextModalityLiteral, value: "You are terse." }] },
  { role: UserRoleLiteral, content: [{ modality: TextModalityLiteral, value: "Say hello." }] },
];

async function collect(model: ChatModelV1, chunk: string, buffer = "") {
  const results: { partialResponse: { partialMessages: unknown[]; usage?: unknown }; buffer: string }[] = [];
  for await (const item of model.transformStreamChatResponseChunk(chunk, buffer)) {
    results.push(item as { partialResponse: { partialMessages: unknown[]; usage?: unknown }; buffer: string });
  }
  return results;
}

const sse = (event: object) => `data: ${JSON.stringify(event)}\n\n`;

describe("GPT-6 (forceResponsesApi) — gpt-6.2-sol", () => {
  const model = makeModel("gpt-6.2-sol");

  it("routes complete and stream requests to /v1/responses even without web search or tools", async () => {
    expect(await model.getCompleteChatUrl({})).toBe("https://api.openai.com/v1/responses");
    expect(await model.getStreamChatUrl({})).toBe("https://api.openai.com/v1/responses");
  });

  it("transforms a Chat-Completions-shaped request into a Responses payload with reasoning.effort", async () => {
    const {
      modelName,
      config,
      messages: parsedMessages,
    } = model.transformModelRequest({
      model: "gpt-6.2-sol",
      messages: [
        { role: "system", content: "You are terse." },
        { role: "user", content: "Say hello." },
      ],
      reasoning_effort: "max",
      max_completion_tokens: 2048,
    });
    expect(modelName).toBe("gpt-6.2-sol");
    expect(config.reasoningEffort).toBe("max");

    const body = await model.getCompleteChatData(config, parsedMessages);
    expect(body.model).toBe("gpt-6.2-sol");
    expect(body.reasoning).toEqual({ effort: "max" });
    expect(body.max_output_tokens).toBe(2048);
    expect(body.instructions).toBe("You are terse.");
    expect(body.input).toEqual([{ type: "message", role: "user", content: [{ type: "input_text", text: "Say hello." }] }]);
    expect(body.messages).toBeUndefined();
    expect(body.reasoning_effort).toBeUndefined();
    expect(body.max_completion_tokens).toBeUndefined();
  });

  it("nests reasoning mode next to effort and defaults max_output_tokens to the model max", async () => {
    const body = await model.getCompleteChatData({ reasoningEffort: "high", reasoningMode: "pro", maxTokens: 0 } as ConfigType, messages);
    expect(body.reasoning).toEqual({ effort: "high", mode: "pro" });
    expect(body.max_output_tokens).toBe(128000);
  });

  it("marks the streaming payload with stream: true", async () => {
    const body = await model.getStreamChatData({ reasoningEffort: "low" } as ConfigType, messages);
    expect(body.stream).toBe(true);
    expect(body.reasoning).toEqual({ effort: "low" });
  });

  it("rejects effort 'none' (not in the low..max enum)", async () => {
    await expect(model.getCompleteChatData({ reasoningEffort: "none" } as ConfigType, messages)).rejects.toThrow();
  });

  it("parses a mocked Responses API completion into text and usage", () => {
    const response = {
      id: "resp_gpt62",
      object: "response",
      created_at: 1763600000,
      model: "gpt-6.2-sol",
      status: "completed",
      output: [
        { id: "rs_1", type: "reasoning", summary: [] },
        {
          id: "msg_1",
          type: "message",
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text: "Hello.", annotations: [] }],
        },
      ],
      usage: { input_tokens: 21, output_tokens: 9, total_tokens: 30 },
      error: null,
    };
    const result = model.transformCompleteChatResponse(response);
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].role).toBe(AssistantRoleLiteral);
    expect(result.messages[0].content).toEqual([{ modality: TextModalityLiteral, value: "Hello." }]);
    expect(result.usage).toEqual({ promptTokens: 21, completionTokens: 9, totalTokens: 30 });
  });

  it("parses mocked Responses SSE events into partial text and final usage", async () => {
    const chunk =
      sse({
        type: "response.created",
        sequence_number: 0,
        response: { id: "resp_1", object: "response", status: "in_progress", output: [] },
      }) +
      sse({ type: "response.output_text.delta", sequence_number: 1, item_id: "msg_1", output_index: 0, content_index: 0, delta: "Hel" }) +
      sse({ type: "response.output_text.delta", sequence_number: 2, item_id: "msg_1", output_index: 0, content_index: 0, delta: "lo." }) +
      sse({
        type: "response.completed",
        sequence_number: 3,
        response: {
          id: "resp_1",
          object: "response",
          status: "completed",
          output: [],
          usage: { input_tokens: 21, output_tokens: 9, total_tokens: 30 },
        },
      });

    const results = await collect(model, chunk);
    const partials = results.flatMap((r) => r.partialResponse.partialMessages) as {
      role: string;
      partialContent: { modality: string; value: string };
    }[];
    const text = partials.filter((p) => p.partialContent.modality === "partial-text").map((p) => p.partialContent.value);
    expect(text.join("")).toBe("Hello.");
    expect(partials.every((p) => p.role === AssistantRoleLiteral)).toBe(true);
    const usage = results.find((r) => r.partialResponse.usage !== undefined)?.partialResponse.usage;
    expect(usage).toEqual({ promptTokens: 21, completionTokens: 9, totalTokens: 30 });
  });
});

describe("GPT-6 (forceResponsesApi) — gpt-6-astra sampling controls", () => {
  const model = makeModel("gpt-6-astra");

  it("never emits temperature, top_p or logprobs on the Responses payload", async () => {
    const body = await model.getCompleteChatData(
      { temperature: 0.2, topP: 0.5, logProbs: true, reasoningEffort: "xhigh" } as ConfigType,
      messages
    );
    expect(body.temperature).toBeUndefined();
    expect(body.top_p).toBeUndefined();
    expect(body.logprobs).toBeUndefined();
    expect(body.top_logprobs).toBeUndefined();
    expect(body.reasoning).toEqual({ effort: "xhigh" });
  });
});

describe("GPT-6 none..max models are also forced onto Responses", () => {
  it.each(["gpt-6-luna", "gpt-6-sol", "gpt-6.1-terra"])("%s routes to /v1/responses and accepts effort 'none'", async (literal) => {
    const model = makeModel(literal);
    expect(await model.getCompleteChatUrl({})).toBe("https://api.openai.com/v1/responses");
    const body = await model.getCompleteChatData({ reasoningEffort: "none" } as ConfigType, messages);
    expect(body.reasoning).toEqual({ effort: "none" });
  });
});

describe("Chat Completions path — gpt-5.4-mini", () => {
  const model = makeModel("gpt-5.4-mini");

  it("routes to /v1/chat/completions", async () => {
    expect(await model.getCompleteChatUrl({})).toBe("https://api.openai.com/v1/chat/completions");
    expect(await model.getStreamChatUrl({})).toBe("https://api.openai.com/v1/chat/completions");
  });

  it("transforms a request into a Chat Completions payload with top-level reasoning_effort", async () => {
    const { config, messages: parsedMessages } = model.transformModelRequest({
      model: "gpt-5.4-mini",
      messages: [{ role: "user", content: "Say hello." }],
      reasoning_effort: "xhigh",
      max_completion_tokens: 512,
    });
    const body = await model.getCompleteChatData(config, parsedMessages);
    expect(body.model).toBe("gpt-5.4-mini");
    expect(body.reasoning_effort).toBe("xhigh");
    expect(body.max_completion_tokens).toBe(512);
    expect(body.messages).toEqual([{ role: "user", content: [{ type: "text", text: "Say hello." }] }]);
    expect(body.reasoning).toBeUndefined();
    expect(body.input).toBeUndefined();
  });

  it("parses a mocked Chat Completions response into text and usage", () => {
    const response = {
      id: "chatcmpl-1",
      object: "chat.completion",
      created: 1763600000,
      model: "gpt-5.4-mini",
      system_fingerprint: "fp_test",
      choices: [{ index: 0, message: { role: "assistant", content: "Hello." }, logprobs: null, finish_reason: "stop" }],
      usage: { prompt_tokens: 12, completion_tokens: 3, total_tokens: 15 },
    };
    const result = model.transformCompleteChatResponse(response);
    expect(result.messages).toEqual([{ role: AssistantRoleLiteral, content: [{ modality: TextModalityLiteral, value: "Hello." }] }]);
    expect(result.usage).toEqual({ promptTokens: 12, completionTokens: 3, totalTokens: 15 });
  });

  it("parses mocked Chat Completions SSE chunks into partial text and usage", async () => {
    const chunk =
      sse({
        id: "chatcmpl-1",
        object: "chat.completion.chunk",
        created: 1763600000,
        model: "gpt-5.4-mini",
        choices: [{ index: 0, delta: { role: "assistant", content: "Hello." }, logprobs: null, finish_reason: null }],
      }) +
      sse({
        id: "chatcmpl-1",
        object: "chat.completion.chunk",
        created: 1763600000,
        model: "gpt-5.4-mini",
        choices: [{ index: 0, delta: {}, logprobs: null, finish_reason: "stop" }],
        usage: { prompt_tokens: 12, completion_tokens: 3, total_tokens: 15 },
      });
    const results = await collect(model, chunk);
    const partials = results.flatMap((r) => r.partialResponse.partialMessages) as { partialContent: { modality: string; value: string } }[];
    expect(partials.map((p) => p.partialContent.value).join("")).toBe("Hello.");
    const usage = results.find((r) => r.partialResponse.usage !== undefined)?.partialResponse.usage;
    expect(usage).toEqual({ promptTokens: 12, completionTokens: 3, totalTokens: 15 });
    for (const r of results) expect(r.buffer.startsWith("__RESP_STATE__")).toBe(false);
  });
});
