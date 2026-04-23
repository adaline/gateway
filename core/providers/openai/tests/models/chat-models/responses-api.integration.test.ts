import { describe, expect, it } from "vitest";

import {
  AssistantRoleLiteral,
  MessageType,
  PartialSearchResultModalityLiteral,
  PartialTextModalityLiteral,
  SearchResultModalityLiteral,
  SystemRoleLiteral,
  TextModalityLiteral,
  UserRoleLiteral,
} from "@adaline/types";

import { OpenAI } from "../../../src";

// ─── shared fixtures ──────────────────────────────────────────────────────────

const API_KEY = "test-api-key";

const systemMsg = {
  role: SystemRoleLiteral,
  content: [{ modality: TextModalityLiteral, value: "You are helpful." }],
} as const;

const userMsg = {
  role: UserRoleLiteral,
  content: [{ modality: TextModalityLiteral, value: "What is the capital of France?" }],
} as const;

const messages = [systemMsg, userMsg] as unknown as MessageType[];

// Exact canned Responses-API envelope per task spec (one annotation)
const webSearchEnvelope = {
  id: "resp_1",
  object: "response" as const,
  model: "gpt-4o",
  status: "completed" as const,
  output: [
    { id: "ws_1", type: "web_search_call", status: "completed" },
    {
      id: "msg_1",
      type: "message",
      role: "assistant",
      status: "completed",
      content: [
        {
          type: "output_text",
          text: "Paris is capital of France.",
          annotations: [
            {
              type: "url_citation",
              start_index: 0,
              end_index: 5,
              url: "https://example.com/paris",
              title: "Paris",
            },
          ],
        },
      ],
    },
  ],
  usage: { input_tokens: 15, output_tokens: 22, total_tokens: 37 },
};

// Canned envelope for gpt-5.2-pro (no web search)
const proModelEnvelope = {
  id: "resp_p",
  object: "response" as const,
  model: "gpt-5.2-pro",
  status: "completed" as const,
  output: [
    {
      id: "msg_1",
      type: "message",
      role: "assistant",
      status: "completed",
      content: [{ type: "output_text", text: "Hi there", annotations: [] }],
    },
  ],
  usage: { input_tokens: 2, output_tokens: 2, total_tokens: 4 },
};

// ─── 1. URL routing ───────────────────────────────────────────────────────────

describe("OpenAI Responses API — URL routing", () => {
  const provider = new OpenAI();

  it("gpt-4o with webSearchTool=true → URL ends /responses", async () => {
    const model = provider.chatModel({ modelName: "gpt-4o", apiKey: API_KEY });
    const url = await model.getCompleteChatUrl({ webSearchTool: true }, messages);
    expect(url).toMatch(/\/responses$/);
  });

  it("gpt-4o without webSearchTool → URL ends /chat/completions", async () => {
    const model = provider.chatModel({ modelName: "gpt-4o", apiKey: API_KEY });
    const url = await model.getCompleteChatUrl({}, messages);
    expect(url).toMatch(/\/chat\/completions$/);
  });

  it("gpt-5.2-pro → URL ends /responses regardless of config", async () => {
    const model = provider.chatModel({ modelName: "gpt-5.2-pro", apiKey: API_KEY });
    const url = await model.getCompleteChatUrl({}, messages);
    expect(url).toMatch(/\/responses$/);
  });
});

// ─── 2. Non-streaming round-trip: gpt-4o + webSearchTool=true ────────────────

describe("OpenAI Responses API — non-streaming round-trip (gpt-4o + webSearchTool)", () => {
  const provider = new OpenAI();
  const model = provider.chatModel({ modelName: "gpt-4o", apiKey: API_KEY });

  it("getCompleteChatData — instructions, input[0] as user message with input_text, tools contains web_search", async () => {
    const body = await model.getCompleteChatData({ webSearchTool: true }, messages);

    // system message becomes top-level instructions
    expect(body.instructions).toBe("You are helpful.");

    // input[0] is the user message
    const inputItems = body.input as Array<Record<string, unknown>>;
    expect(inputItems).toHaveLength(1);
    expect(inputItems[0]).toEqual({
      type: "message",
      role: "user",
      content: [{ type: "input_text", text: "What is the capital of France?" }],
    });

    // tools must include {type:"web_search"}
    const tools = body.tools as Array<{ type: string }>;
    expect(tools).toContainEqual({ type: "web_search" });

    // CC key must not be present
    expect(body.messages).toBeUndefined();
  });

  it("transformCompleteChatResponse — TextContent + SearchResultContent with one response", () => {
    const result = model.transformCompleteChatResponse(webSearchEnvelope);

    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].role).toBe(AssistantRoleLiteral);

    const content = result.messages[0].content;
    const textParts = content.filter((c) => c.modality === TextModalityLiteral);
    const searchParts = content.filter((c) => c.modality === SearchResultModalityLiteral);

    expect(textParts.length).toBeGreaterThanOrEqual(1);
    expect(searchParts).toHaveLength(1);

    const sr = searchParts[0] as { modality: string; value: { type: string; responses: Array<{ url: string }> } };
    expect(sr.value.type).toBe("openai");
    expect(sr.value.responses).toHaveLength(1);
    expect(sr.value.responses[0].url).toBe("https://example.com/paris");

    if (!result.usage) throw new Error("expected usage to be defined");
    expect(result.usage.promptTokens).toBe(15);
    expect(result.usage.completionTokens).toBe(22);
    expect(result.usage.totalTokens).toBe(37);
  });
});

// ─── 3. CC regression: gpt-4o without webSearchTool ─────────────────────────

describe("OpenAI Responses API — CC regression (gpt-4o without webSearchTool)", () => {
  const provider = new OpenAI();
  const model = provider.chatModel({ modelName: "gpt-4o", apiKey: API_KEY });

  it("getCompleteChatData — body.messages defined, body.input undefined", async () => {
    const body = await model.getCompleteChatData({}, messages);
    expect(body.messages).toBeDefined();
    expect(body.input).toBeUndefined();
  });
});

// ─── 4. Pro-model plain text: gpt-5.2-pro ────────────────────────────────────

describe("OpenAI Responses API — pro-model plain-text (gpt-5.2-pro)", () => {
  const provider = new OpenAI();
  const model = provider.chatModel({ modelName: "gpt-5.2-pro", apiKey: API_KEY });

  it("getCompleteChatData — body.input defined, body.messages undefined", async () => {
    const body = await model.getCompleteChatData({}, messages);
    expect(body.input).toBeDefined();
    expect(body.messages).toBeUndefined();
  });

  it("transformCompleteChatResponse — TextContent value is 'Hi there'", () => {
    const result = model.transformCompleteChatResponse(proModelEnvelope);

    expect(result.messages).toHaveLength(1);
    const textContent = result.messages[0].content.find((c) => c.modality === TextModalityLiteral) as
      | { modality: string; value: string }
      | undefined;
    expect(textContent).toBeDefined();
    expect(textContent!.value).toBe("Hi there");

    if (!result.usage) throw new Error("expected usage to be defined");
    expect(result.usage.promptTokens).toBe(2);
    expect(result.usage.completionTokens).toBe(2);
    expect(result.usage.totalTokens).toBe(4);
  });
});

// ─── 5. Streaming round-trip: gpt-4o + webSearchTool=true ────────────────────

describe("OpenAI Responses API — streaming round-trip (gpt-4o + webSearchTool)", () => {
  const provider = new OpenAI();
  const model = provider.chatModel({ modelName: "gpt-4o", apiKey: API_KEY });

  // 5 SSE data: chunks matching the task specification
  const sseChunks = [
    `data: ${JSON.stringify({ type: "response.created", response: { id: "resp_stream", object: "response", model: "gpt-4o", status: "in_progress", output: [] } })}\n`,
    `data: ${JSON.stringify({ type: "response.output_text.delta", item_id: "msg_1", output_index: 0, content_index: 0, delta: "Paris" })}\n`,
    `data: ${JSON.stringify({ type: "response.output_text.delta", item_id: "msg_1", output_index: 0, content_index: 0, delta: " is the capital." })}\n`,
    `data: ${JSON.stringify({ type: "response.output_text.annotation.added", item_id: "msg_1", output_index: 0, content_index: 0, annotation_index: 0, annotation: { type: "url_citation", start_index: 0, end_index: 5, url: "https://example.com/paris", title: "Paris" } })}\n`,
    `data: ${JSON.stringify({ type: "response.completed", response: { id: "resp_stream", object: "response", model: "gpt-4o", status: "completed", output: [], usage: { input_tokens: 10, output_tokens: 15, total_tokens: 25 } } })}\n`,
  ];

  it("yields ≥2 partial-text, ≥1 partial-search-result, and usage on the final chunk", async () => {
    let buffer = "";
    const partialTexts: string[] = [];
    const partialSearchResults: unknown[] = [];
    let finalUsage: { promptTokens?: number; completionTokens?: number; totalTokens?: number } | undefined;

    for (const chunk of sseChunks) {
      const gen = model.transformStreamChatResponseChunk(chunk, buffer);
      for await (const { partialResponse, buffer: newBuffer } of gen) {
        buffer = newBuffer;
        for (const msg of partialResponse.partialMessages) {
          if (msg.partialContent?.modality === PartialTextModalityLiteral) {
            const val = (msg.partialContent as { modality: string; value: string }).value;
            if (val && val.length > 0) {
              partialTexts.push(val);
            }
          } else if (msg.partialContent?.modality === PartialSearchResultModalityLiteral) {
            partialSearchResults.push(msg);
          }
        }
        if (partialResponse.usage) {
          finalUsage = partialResponse.usage;
        }
      }
    }

    // at least 2 text deltas were emitted
    expect(partialTexts.length).toBeGreaterThanOrEqual(2);

    // at least 1 partial search result was emitted (from annotation.added)
    expect(partialSearchResults.length).toBeGreaterThanOrEqual(1);

    // final chunk yielded usage
    expect(finalUsage).toBeDefined();
    expect(finalUsage!.promptTokens).toBe(10);
    expect(finalUsage!.completionTokens).toBe(15);
    expect(finalUsage!.totalTokens).toBe(25);
  });
});
