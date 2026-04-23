import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";

import { ChatModelSchema, ChatModelSchemaType, InvalidConfigError, ModelResponseError } from "@adaline/provider";
import {
  AssistantRoleLiteral,
  ConfigType,
  ImageModalityLiteral,
  SearchResultModalityLiteral,
  SystemRoleLiteral,
  TextModalityLiteral,
  ToolCallModalityLiteral,
  ToolResponseModalityLiteral,
  ToolRoleLiteral,
  UserRoleLiteral,
} from "@adaline/types";

import { OpenAI } from "../../../src";
import { OpenAIChatModelConfigs } from "../../../src/configs";
import { BaseChatModel } from "../../../src/models";

// ─── Test Roles & Modalities ───────────────────────────────────────────────────

const mockRoles = ["system", "user", "assistant", "tool"] as const;
const mockWebSearchModalities = ["text", "image", "tool-call", "tool-response", "search-result"] as const;

const mockRolesMap = {
  system: SystemRoleLiteral,
  user: UserRoleLiteral,
  assistant: AssistantRoleLiteral,
  tool: ToolRoleLiteral,
};

// ─── Schema + Model Factory ────────────────────────────────────────────────────

const mockModelSchema: ChatModelSchemaType = ChatModelSchema(z.enum(mockRoles), z.enum(mockWebSearchModalities)).parse({
  name: "test-responses-model",
  description: "test model for responses api",
  maxInputTokens: 128000,
  maxOutputTokens: 16384,
  roles: mockRolesMap,
  modalities: mockWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.webSearch(16384, 4).def,
    schema: OpenAIChatModelConfigs.webSearch(16384, 4).schema,
  },
});

// GPT-5 preset fixture: includes reasoningEffort, verbosity, responseFormat, responseSchema, webSearchTool.
// Used by tests that exercise those fields on the Responses path.
const mockGpt5ModelSchema: ChatModelSchemaType = ChatModelSchema(z.enum(mockRoles), z.enum(mockWebSearchModalities)).parse({
  name: "test-gpt5-responses-model",
  description: "test gpt-5 with web search for responses api",
  maxInputTokens: 128000,
  maxOutputTokens: 16384,
  roles: mockRolesMap,
  modalities: mockWebSearchModalities,
  config: {
    def: OpenAIChatModelConfigs.gpt5WithWebSearch(16384, 4).def,
    schema: OpenAIChatModelConfigs.gpt5WithWebSearch(16384, 4).schema,
  },
});

const mockOptions = {
  apiKey: "test-api-key",
  baseUrl: "https://api.openai.com/v1",
  modelName: "test-responses-model",
};

function makeModel(overrides?: Partial<typeof mockOptions & { forceResponsesApi: boolean }>): BaseChatModel {
  return new BaseChatModel(mockModelSchema, { ...mockOptions, ...overrides });
}

function makeGpt5Model(overrides?: Partial<typeof mockOptions & { forceResponsesApi: boolean }>): BaseChatModel {
  return new BaseChatModel(mockGpt5ModelSchema, { ...mockOptions, modelName: "test-gpt5-responses-model", ...overrides });
}

// ─── Fixture Builders ─────────────────────────────────────────────────────────

function makeUserTextMessage(text: string) {
  return { role: UserRoleLiteral, content: [{ modality: TextModalityLiteral, value: text }] };
}

function makeSystemMessage(text: string) {
  return { role: SystemRoleLiteral, content: [{ modality: TextModalityLiteral, value: text }] };
}

function makeAssistantTextMessage(text: string) {
  return { role: AssistantRoleLiteral, content: [{ modality: TextModalityLiteral, value: text }] };
}

function makeAssistantToolCallMessage(callId: string, name: string, args: string) {
  return {
    role: AssistantRoleLiteral,
    content: [{ modality: ToolCallModalityLiteral, index: 0, id: callId, name, arguments: args }],
  };
}

function makeToolResponseMessage(callId: string, name: string, data: string) {
  return {
    role: ToolRoleLiteral,
    content: [{ modality: ToolResponseModalityLiteral, index: 0, id: callId, name, data }],
  };
}

function makeUserUrlImageMessage(url: string, detail: "auto" | "low" | "medium" | "high" = "auto") {
  return {
    role: UserRoleLiteral,
    content: [{ modality: ImageModalityLiteral, detail, value: { type: "url" as const, url } }],
  };
}

function makeUserBase64ImageMessage(base64: string, mediaType: "png" | "jpeg" | "webp" | "gif" = "png") {
  return {
    role: UserRoleLiteral,
    content: [{ modality: ImageModalityLiteral, detail: "auto" as const, value: { type: "base64" as const, base64, mediaType } }],
  };
}

function makeFunctionTool(name: string, description: string, parameters: object) {
  return {
    type: "function" as const,
    definition: {
      schema: {
        type: "function" as const,
        name,
        description,
        parameters,
        strict: true,
      },
    },
  };
}

// ─── Streaming Chunk Fixtures ─────────────────────────────────────────────────

function makeChunkLine(event: object): string {
  return `data: ${JSON.stringify(event)}\n`;
}

function makeCreated() {
  return makeChunkLine({
    type: "response.created",
    sequence_number: 0,
    response: { id: "resp_1", object: "response", model: "test-model", status: "in_progress", output: [] },
  });
}

function makeInProgress() {
  return makeChunkLine({
    type: "response.in_progress",
    sequence_number: 1,
    response: { id: "resp_1", object: "response", model: "test-model", status: "in_progress", output: [] },
  });
}

function makeQueued() {
  return makeChunkLine({
    type: "response.queued",
    sequence_number: 0,
    response: { id: "resp_1", object: "response", model: "test-model", status: "queued", output: [] },
  });
}

function makeTextDelta(delta: string, itemId = "msg_1") {
  return makeChunkLine({
    type: "response.output_text.delta",
    sequence_number: 2,
    item_id: itemId,
    output_index: 0,
    content_index: 0,
    delta,
  });
}

function makeAnnotationAdded(annotation: { type: "url_citation"; start_index: number; end_index: number; url: string; title: string }) {
  return makeChunkLine({
    type: "response.output_text.annotation.added",
    sequence_number: 3,
    item_id: "msg_1",
    output_index: 1,
    content_index: 0,
    annotation_index: 0,
    annotation,
  });
}

function makeOutputItemAdded(item: { id: string; type: string; call_id?: string; name?: string; arguments?: string; status?: string }) {
  return makeChunkLine({
    type: "response.output_item.added",
    sequence_number: 1,
    output_index: 0,
    item,
  });
}

function makeFunctionCallArgsDelta(itemId: string, delta: string) {
  return makeChunkLine({
    type: "response.function_call_arguments.delta",
    sequence_number: 2,
    item_id: itemId,
    output_index: 0,
    delta,
  });
}

function makeReasoningDelta(delta: string) {
  return makeChunkLine({
    type: "response.reasoning_summary_text.delta",
    sequence_number: 2,
    item_id: "rs_1",
    output_index: 0,
    summary_index: 0,
    delta,
  });
}

function makeRefusalDelta(delta: string) {
  return makeChunkLine({
    type: "response.refusal.delta",
    sequence_number: 2,
    item_id: "msg_1",
    output_index: 0,
    content_index: 0,
    delta,
  });
}

function makeCompleted(usage?: { input_tokens: number; output_tokens: number; total_tokens: number }) {
  return makeChunkLine({
    type: "response.completed",
    sequence_number: 99,
    response: {
      id: "resp_1",
      object: "response",
      model: "test-model",
      status: "completed",
      output: [],
      usage: usage ?? { input_tokens: 10, output_tokens: 5, total_tokens: 15 },
    },
  });
}

function makeFailed() {
  return makeChunkLine({
    type: "response.failed",
    sequence_number: 2,
    response: {
      id: "resp_1",
      object: "response",
      model: "test-model",
      status: "failed",
      output: [],
      error: { type: "server_error", message: "Internal server error", code: null, param: null },
    },
  });
}

function makeNestedError(message: string) {
  return makeChunkLine({
    type: "error",
    sequence_number: 1,
    error: { type: "invalid_request_error", code: null, message, param: null },
  });
}

function makeWebSearchInProgress() {
  return makeChunkLine({
    type: "response.web_search_call.in_progress",
    sequence_number: 1,
    item_id: "ws_1",
    output_index: 0,
  });
}

function makeWebSearchSearching() {
  return makeChunkLine({
    type: "response.web_search_call.searching",
    sequence_number: 2,
    item_id: "ws_1",
    output_index: 0,
  });
}

function makeWebSearchCompleted() {
  return makeChunkLine({
    type: "response.web_search_call.completed",
    sequence_number: 3,
    item_id: "ws_1",
    output_index: 0,
  });
}

// Helper to collect all yielded values from the async generator
async function collectChunks(
  model: BaseChatModel,
  chunk: string,
  buffer = ""
): Promise<{ partialResponse: { partialMessages: unknown[]; usage?: unknown }; buffer: string }[]> {
  const results: { partialResponse: { partialMessages: unknown[]; usage?: unknown }; buffer: string }[] = [];
  for await (const item of model.transformStreamChatResponseChunk(chunk, buffer)) {
    results.push(item as { partialResponse: { partialMessages: unknown[]; usage?: unknown }; buffer: string });
  }
  return results;
}

// ─── Responses-shaped complete response fixtures ───────────────────────────────

function makeResponsesEnvelope(output: object[], usage?: object) {
  return {
    id: "resp_test123",
    object: "response" as const,
    created_at: 1741369938,
    model: "gpt-4o-2024-08-06",
    status: "completed" as const,
    output,
    usage: usage ?? { input_tokens: 20, output_tokens: 11, total_tokens: 31 },
    error: null,
  };
}

function makeCCCompletionResponse(text: string) {
  return {
    id: "chatcmpl-123",
    object: "chat.completion" as const,
    created: 1677652288,
    model: "gpt-4o",
    system_fingerprint: "fp_test",
    choices: [
      {
        index: 0,
        message: { role: "assistant", content: text },
        logprobs: null,
        finish_reason: "stop",
      },
    ],
    usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
  };
}

// ─── T05: routing ─────────────────────────────────────────────────────────────

describe("routing", () => {
  let model: BaseChatModel;

  beforeEach(() => {
    model = makeModel();
  });

  // getCompleteChatUrl cases
  it("returns /chat/completions URL when webSearchTool is omitted", async () => {
    const url = await model.getCompleteChatUrl({});
    expect(url).toMatch(/\/chat\/completions$/);
  });

  it("returns /chat/completions URL when webSearchTool is false", async () => {
    const url = await model.getCompleteChatUrl({ webSearchTool: false });
    expect(url).toMatch(/\/chat\/completions$/);
  });

  it("returns /responses URL when webSearchTool is true", async () => {
    const url = await model.getCompleteChatUrl({ webSearchTool: true });
    expect(url).toMatch(/\/responses$/);
  });

  it("returns /responses URL when forceResponsesApi constructor option is true", async () => {
    const forcedModel = makeModel({ forceResponsesApi: true });
    const url = await forcedModel.getCompleteChatUrl({});
    expect(url).toMatch(/\/responses$/);
  });

  // getStreamChatUrl cases — symmetric to getCompleteChatUrl
  it("returns /chat/completions URL for streaming when webSearchTool is omitted", async () => {
    const url = await model.getStreamChatUrl({});
    expect(url).toMatch(/\/chat\/completions$/);
  });

  it("returns /chat/completions URL for streaming when webSearchTool is false", async () => {
    const url = await model.getStreamChatUrl({ webSearchTool: false });
    expect(url).toMatch(/\/chat\/completions$/);
  });

  it("returns /responses URL for streaming when webSearchTool is true", async () => {
    const url = await model.getStreamChatUrl({ webSearchTool: true });
    expect(url).toMatch(/\/responses$/);
  });

  it("returns /responses URL for streaming when forceResponsesApi constructor option is true", async () => {
    const forcedModel = makeModel({ forceResponsesApi: true });
    const url = await forcedModel.getStreamChatUrl({});
    expect(url).toMatch(/\/responses$/);
  });
});

// ─── T06: request body — Responses path ──────────────────────────────────────

describe("request body — Responses path", () => {
  let model: BaseChatModel;

  beforeEach(() => {
    model = makeModel();
  });

  it("maps system role to instructions top-level field", async () => {
    const messages = [makeSystemMessage("You are helpful."), makeUserTextMessage("Hello")];
    const body = (await model.getCompleteChatData({ webSearchTool: true }, messages)) as {
      instructions?: string;
      input: { type: string; role?: string }[];
    };
    expect(body.instructions).toBe("You are helpful.");
    expect(body.input.find((item) => item.role === "system")).toBeUndefined();
    expect(body.input.some((item) => item.type === "message" && item.role === "user")).toBe(true);
  });

  it("emits user text as input_text content part", async () => {
    const messages = [makeUserTextMessage("Hello world")];
    const body = (await model.getCompleteChatData({ webSearchTool: true }, messages)) as {
      input: { type: string; role?: string; content?: { type: string; text?: string }[] }[];
    };
    expect(body.input).toHaveLength(1);
    expect(body.input[0].type).toBe("message");
    expect(body.input[0].role).toBe("user");
    expect(body.input[0].content).toEqual([{ type: "input_text", text: "Hello world" }]);
  });

  it("emits user URL image as input_image with image_url.url and image_url.detail", async () => {
    const messages = [makeUserUrlImageMessage("https://example.com/photo.jpg", "auto")];
    const body = (await model.getCompleteChatData({ webSearchTool: true }, messages)) as {
      input: { type: string; content?: { type: string; image_url?: { url: string; detail: string } }[] }[];
    };
    expect(body.input[0].type).toBe("message");
    const part = body.input[0].content?.[0];
    expect(part?.type).toBe("input_image");
    expect(part?.image_url?.url).toBe("https://example.com/photo.jpg");
    expect(part?.image_url?.detail).toBe("auto");
  });

  it("emits user base64 image as input_image with data URI in image_url.url", async () => {
    const base64Url = "data:image/png;base64,iVBORw0KGgoAAAANS==";
    const messages = [makeUserBase64ImageMessage(base64Url, "png")];
    const body = (await model.getCompleteChatData({ webSearchTool: true }, messages)) as {
      input: { content?: { type: string; image_url?: { url: string; detail: string } }[] }[];
    };
    const part = body.input[0].content?.[0];
    expect(part?.type).toBe("input_image");
    expect(part?.image_url?.url).toBe(base64Url);
    expect(part?.image_url?.url.startsWith("data:")).toBe(true);
  });

  it("emits assistant text as output_text content part", async () => {
    const messages = [makeUserTextMessage("Hi"), makeAssistantTextMessage("Hello back")];
    const body = (await model.getCompleteChatData({ webSearchTool: true }, messages)) as {
      input: { type: string; role?: string; content?: { type: string; text?: string }[] }[];
    };
    const assistantItem = body.input.find((item) => item.type === "message" && item.role === "assistant");
    expect(assistantItem).toBeDefined();
    expect(assistantItem?.content).toEqual([{ type: "output_text", text: "Hello back" }]);
  });

  it("emits assistant tool_calls as top-level function_call items (not nested under role)", async () => {
    const messages = [
      makeUserTextMessage("What is the weather?"),
      makeAssistantToolCallMessage("call_abc", "get_weather", '{"city":"NYC"}'),
    ];
    const body = (await model.getCompleteChatData({ webSearchTool: true }, messages)) as {
      input: { type: string; role?: string; call_id?: string; name?: string; arguments?: string }[];
    };
    const funcCall = body.input.find((item) => item.type === "function_call");
    expect(funcCall).toBeDefined();
    expect(funcCall?.call_id).toBe("call_abc");
    expect(funcCall?.name).toBe("get_weather");
    expect(funcCall?.arguments).toBe('{"city":"NYC"}');
    // Must NOT be nested under a message item
    expect(funcCall?.role).toBeUndefined();
  });

  it("emits tool role as top-level function_call_output", async () => {
    const messages = [
      makeUserTextMessage("What is the weather?"),
      makeAssistantToolCallMessage("call_abc", "get_weather", '{"city":"NYC"}'),
      makeToolResponseMessage("call_abc", "get_weather", '{"temperature":"72F"}'),
    ];
    const body = (await model.getCompleteChatData({ webSearchTool: true }, messages)) as {
      input: { type: string; role?: string; call_id?: string; output?: string }[];
    };
    const toolOutput = body.input.find((item) => item.type === "function_call_output");
    expect(toolOutput).toBeDefined();
    expect(toolOutput?.call_id).toBe("call_abc");
    expect(toolOutput?.output).toBe('{"temperature":"72F"}');
    expect(toolOutput?.role).toBeUndefined();
  });

  it("flattens function tools to {type: function, name, description, parameters, strict}", async () => {
    const messages = [makeUserTextMessage("Call a tool")];
    const tools = [makeFunctionTool("get_weather", "Get weather data", { type: "object", properties: { city: { type: "string" } } })];
    const body = (await model.getCompleteChatData({ webSearchTool: true }, messages, tools)) as {
      tools: { type: string; name?: string; description?: string; parameters?: unknown; strict?: boolean; function?: unknown }[];
    };
    const fnTool = body.tools.find((t) => t.type === "function");
    expect(fnTool).toBeDefined();
    expect(fnTool?.name).toBe("get_weather");
    expect(fnTool?.description).toBe("Get weather data");
    expect(fnTool?.parameters).toEqual({ type: "object", properties: { city: { type: "string" } } });
    expect(fnTool?.strict).toBe(true);
    // Must NOT be nested under a `function` wrapper
    expect(fnTool?.function).toBeUndefined();
  });

  it("injects web_search built-in tool when webSearchTool=true and no user tools", async () => {
    const messages = [makeUserTextMessage("Search the web")];
    const body = (await model.getCompleteChatData({ webSearchTool: true }, messages)) as {
      tools: { type: string }[];
    };
    expect(body.tools).toEqual([{ type: "web_search" }]);
  });

  it("injects web_search built-in tool alongside user function tools", async () => {
    const messages = [makeUserTextMessage("Search and call tool")];
    const tools = [makeFunctionTool("get_data", "Fetch data", { type: "object", properties: {} })];
    const body = (await model.getCompleteChatData({ webSearchTool: true }, messages, tools)) as {
      tools: { type: string; name?: string }[];
    };
    expect(body.tools.some((t) => t.type === "function" && t.name === "get_data")).toBe(true);
    expect(body.tools.some((t) => t.type === "web_search")).toBe(true);
  });

  it("passes tool_choice string through (none|auto|required)", async () => {
    const messages = [makeUserTextMessage("Use tool")];
    const tools = [makeFunctionTool("my_fn", "My function", { type: "object", properties: {} })];
    const body = (await model.getCompleteChatData({ webSearchTool: true, toolChoice: "required" }, messages, tools)) as {
      tool_choice?: unknown;
    };
    expect(body.tool_choice).toBe("required");
  });

  it("flattens tool_choice function-name to {type:function, name}", async () => {
    const messages = [makeUserTextMessage("Force a tool")];
    const tools = [makeFunctionTool("my_fn", "My function", { type: "object", properties: {} })];
    const body = (await model.getCompleteChatData({ webSearchTool: true, toolChoice: "my_fn" }, messages, tools)) as {
      tool_choice?: { type: string; name?: string; function?: unknown };
    };
    expect(body.tool_choice).toEqual({ type: "function", name: "my_fn" });
    // No nested `function:{}` wrapper
    expect(body.tool_choice?.function).toBeUndefined();
  });

  it("maps reasoning_effort config to reasoning.effort", async () => {
    const gpt5Model = makeGpt5Model();
    const messages = [makeUserTextMessage("Reason about this")];
    const body = (await gpt5Model.getCompleteChatData({ webSearchTool: true, reasoningEffort: "high" }, messages)) as {
      reasoning?: { effort?: string };
      reasoning_effort?: unknown;
    };
    expect(body.reasoning).toEqual({ effort: "high" });
    expect(body.reasoning_effort).toBeUndefined();
  });

  it("maps response_format=json_schema to text.format with name/schema/strict", async () => {
    const gpt5Model = makeGpt5Model();
    const messages = [makeUserTextMessage("Respond in JSON")];
    const body = (await gpt5Model.getCompleteChatData(
      {
        webSearchTool: true,
        responseFormat: "json_schema",
        responseSchema: {
          name: "MySchema",
          description: "Schema for structured output",
          schema: {
            type: "object",
            required: ["name"],
            properties: { name: { type: "string" } },
            additionalProperties: false,
          },
          strict: true,
        },
      },
      messages
    )) as { text?: { format?: { type: string; name?: string; schema?: unknown; strict?: boolean } }; response_format?: unknown };
    expect(body.text?.format?.type).toBe("json_schema");
    expect(body.text?.format?.name).toBe("MySchema");
    expect(body.text?.format?.schema).toEqual({
      type: "object",
      required: ["name"],
      properties: { name: { type: "string" } },
      additionalProperties: false,
    });
    expect(body.text?.format?.strict).toBe(true);
    expect(body.response_format).toBeUndefined();
  });

  it("maps maxTokens config to max_output_tokens", async () => {
    const messages = [makeUserTextMessage("Short reply please")];
    const body = (await model.getCompleteChatData({ webSearchTool: true, maxTokens: 100 }, messages)) as {
      max_output_tokens?: number;
      max_completion_tokens?: unknown;
    };
    expect(body.max_output_tokens).toBe(100);
    expect(body.max_completion_tokens).toBeUndefined();
  });

  it("maps verbosity to text.verbosity", async () => {
    const gpt5Model = makeGpt5Model();
    const messages = [makeUserTextMessage("Verbose output")];
    const body = (await gpt5Model.getCompleteChatData({ webSearchTool: true, verbosity: "high" }, messages)) as {
      text?: { verbosity?: string };
      verbosity?: unknown;
    };
    expect(body.text?.verbosity).toBe("high");
    expect(body.verbosity).toBeUndefined();
  });

  it("drops CC-only keys (logprobs boolean, frequency_penalty, presence_penalty, stop, seed, stream_options, web_search_options, n)", async () => {
    const messages = [makeUserTextMessage("Test dropping CC-only keys")];
    const body = (await model.getCompleteChatData(
      {
        webSearchTool: true,
        frequencyPenalty: 0.5,
        presencePenalty: 0.5,
        stop: ["\n"],
        seed: 42,
      },
      messages
    )) as Record<string, unknown>;
    expect(body.logprobs).toBeUndefined();
    expect(body.frequency_penalty).toBeUndefined();
    expect(body.presence_penalty).toBeUndefined();
    expect(body.stop).toBeUndefined();
    expect(body.seed).toBeUndefined();
    expect(body.n).toBeUndefined();
    expect(body.stream_options).toBeUndefined();
    expect(body.web_search_options).toBeUndefined();
  });

  it("does not emit include field (Q6 scope gate)", async () => {
    const messages = [makeUserTextMessage("No include field")];
    const body = (await model.getCompleteChatData({ webSearchTool: true }, messages)) as Record<string, unknown>;
    expect(body.include).toBeUndefined();
  });

  it("emits allowed_domains filter when webSearchAllowedDomains is set", async () => {
    const messages = [makeUserTextMessage("search")];
    const body = (await model.getCompleteChatData(
      { webSearchTool: true, webSearchAllowedDomains: ["openai.com", "anthropic.com"] } as ConfigType,
      messages
    )) as { tools: Array<Record<string, unknown>> };
    const webSearchTool = body.tools.find((t) => t.type === "web_search");
    expect(webSearchTool).toBeDefined();
    expect((webSearchTool as { filters?: unknown }).filters).toEqual({ allowed_domains: ["openai.com", "anthropic.com"] });
  });

  it("emits user_location when webSearchUserLocation is set (partial fields)", async () => {
    const messages = [makeUserTextMessage("search")];
    const body = (await model.getCompleteChatData(
      { webSearchTool: true, webSearchUserLocation: { country: "US", city: "San Francisco" } } as ConfigType,
      messages
    )) as { tools: Array<Record<string, unknown>> };
    const webSearchTool = body.tools.find((t) => t.type === "web_search");
    expect((webSearchTool as { user_location?: unknown }).user_location).toEqual({
      type: "approximate",
      country: "US",
      city: "San Francisco",
    });
  });

  it("emits external_web_access=false when webSearchExternalAccess is false", async () => {
    const messages = [makeUserTextMessage("search")];
    const body = (await model.getCompleteChatData({ webSearchTool: true, webSearchExternalAccess: false } as ConfigType, messages)) as {
      tools: Array<Record<string, unknown>>;
    };
    const webSearchTool = body.tools.find((t) => t.type === "web_search");
    expect((webSearchTool as { external_web_access?: unknown }).external_web_access).toBe(false);
  });

  it("does not emit external_web_access when true (default)", async () => {
    const messages = [makeUserTextMessage("search")];
    const body = (await model.getCompleteChatData({ webSearchTool: true, webSearchExternalAccess: true } as ConfigType, messages)) as {
      tools: Array<Record<string, unknown>>;
    };
    const webSearchTool = body.tools.find((t) => t.type === "web_search");
    expect((webSearchTool as { external_web_access?: unknown }).external_web_access).toBeUndefined();
  });

  it("combines all three filter fields correctly", async () => {
    const messages = [makeUserTextMessage("search")];
    const body = (await model.getCompleteChatData(
      {
        webSearchTool: true,
        webSearchAllowedDomains: ["example.com"],
        webSearchUserLocation: { country: "US", timezone: "America/Los_Angeles" },
        webSearchExternalAccess: false,
      } as ConfigType,
      messages
    )) as { tools: Array<Record<string, unknown>> };
    const webSearchTool = body.tools.find((t) => t.type === "web_search") as {
      filters?: unknown;
      user_location?: unknown;
      external_web_access?: unknown;
    };
    expect(webSearchTool.filters).toEqual({ allowed_domains: ["example.com"] });
    expect(webSearchTool.user_location).toEqual({ type: "approximate", country: "US", timezone: "America/Los_Angeles" });
    expect(webSearchTool.external_web_access).toBe(false);
  });

  it("does not emit filters / user_location / external_web_access when they are omitted", async () => {
    const messages = [makeUserTextMessage("search")];
    const body = (await model.getCompleteChatData({ webSearchTool: true } as ConfigType, messages)) as {
      tools: Array<Record<string, unknown>>;
    };
    const webSearchTool = body.tools.find((t) => t.type === "web_search") as {
      filters?: unknown;
      user_location?: unknown;
      external_web_access?: unknown;
    };
    expect(webSearchTool.filters).toBeUndefined();
    expect(webSearchTool.user_location).toBeUndefined();
    expect(webSearchTool.external_web_access).toBeUndefined();
  });

  it("throws InvalidConfigError when webSearchTool=true and reasoningEffort=minimal", async () => {
    const gpt5Model = makeGpt5Model();
    const messages = [makeUserTextMessage("hi")];
    await expect(
      gpt5Model.getCompleteChatData({ webSearchTool: true, reasoningEffort: "minimal" } as ConfigType, messages)
    ).rejects.toThrow(InvalidConfigError);
  });

  it("throws InvalidConfigError when webSearchTool=true on a model whose schema lacks webSearchTool", async () => {
    const schemaWithoutWebSearch = ChatModelSchema(z.enum(mockRoles), z.enum(["text"] as const)).parse({
      name: "no-web-search-model",
      description: "test",
      maxInputTokens: 4096,
      maxOutputTokens: 1024,
      roles: mockRolesMap,
      modalities: ["text"],
      config: {
        def: OpenAIChatModelConfigs.base(1024, 4).def,
        schema: OpenAIChatModelConfigs.base(1024, 4).schema,
      },
    });
    const modelNoWS = new BaseChatModel(schemaWithoutWebSearch, mockOptions);
    const messages = [makeUserTextMessage("hi")];
    await expect(modelNoWS.getCompleteChatData({ webSearchTool: true }, messages)).rejects.toThrow(InvalidConfigError);
  });

  it("emits top_logprobs when logProbs=true and topLogProbs>0", async () => {
    const model = makeGpt5Model({ forceResponsesApi: true });
    const messages = [makeUserTextMessage("hi")];
    const body = await model.getCompleteChatData({ logProbs: true, topLogProbs: 3 } as ConfigType, messages);
    expect((body as Record<string, unknown>).top_logprobs).toBe(3);
    expect((body as Record<string, unknown>).logprobs).toBeUndefined();
  });

  it("emits top_logprobs=0 when logProbs=true and topLogProbs is omitted/default", async () => {
    const model = makeGpt5Model({ forceResponsesApi: true });
    const messages = [makeUserTextMessage("hi")];
    const body = await model.getCompleteChatData({ logProbs: true } as ConfigType, messages);
    expect((body as Record<string, unknown>).top_logprobs).toBe(0);
  });

  it("does not emit top_logprobs when logProbs is false/omitted", async () => {
    const model = makeGpt5Model({ forceResponsesApi: true });
    const messages = [makeUserTextMessage("hi")];
    const body = await model.getCompleteChatData({} as ConfigType, messages);
    expect((body as Record<string, unknown>).top_logprobs).toBeUndefined();
    expect((body as Record<string, unknown>).logprobs).toBeUndefined();
  });

  it("throws InvalidConfigError when topLogProbs>0 but logProbs is not true", async () => {
    const model = makeGpt5Model({ forceResponsesApi: true });
    const messages = [makeUserTextMessage("hi")];
    await expect(model.getCompleteChatData({ topLogProbs: 5 } as ConfigType, messages)).rejects.toThrow(InvalidConfigError);
  });

  it.skip("emits file content as input_file content part (deferred — Gateway doesn't yet expose file modality for OpenAI)", () => {
    // Skipped until Gateway adds a file/pdf modality for OpenAI user-role messages.
    // When added, assert that body.input[0].content includes {type:"input_file", ...}.
  });
});

// ─── T07: transformCompleteChatResponse — Responses path ─────────────────────

describe("transformCompleteChatResponse — Responses path", () => {
  let model: BaseChatModel;

  beforeEach(() => {
    model = makeModel();
  });

  it("dispatches to CC parser when response.object === chat.completion", () => {
    const response = makeCCCompletionResponse("Hello there");
    const result = model.transformCompleteChatResponse(response);
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].role).toBe(AssistantRoleLiteral);
    expect(result.messages[0].content[0].modality).toBe(TextModalityLiteral);
  });

  it("dispatches to Responses parser when response.object === response", () => {
    const envelope = makeResponsesEnvelope([
      {
        id: "msg_1",
        type: "message",
        role: "assistant",
        status: "completed",
        content: [{ type: "output_text", text: "Hello from Responses API", annotations: [] }],
      },
    ]);
    const result = model.transformCompleteChatResponse(envelope);
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].role).toBe(AssistantRoleLiteral);
    expect(result.messages[0].content.length).toBeGreaterThan(0);
    expect(result.messages[0].content.some((c) => c.modality === TextModalityLiteral)).toBe(true);
  });

  it("parses text-only output to a single TextContent", () => {
    const envelope = {
      id: "resp_1",
      object: "response" as const,
      model: "gpt-4o",
      status: "completed" as const,
      output: [
        {
          id: "msg_1",
          type: "message",
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text: "Hello", annotations: [] }],
        },
      ],
      usage: { input_tokens: 5, output_tokens: 3, total_tokens: 8 },
    };
    const result = model.transformCompleteChatResponse(envelope);
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].role).toBe(AssistantRoleLiteral);
    expect(result.messages[0].content).toHaveLength(1);
    const textContent = result.messages[0].content[0] as { modality: string; value: string };
    expect(textContent.modality).toBe(TextModalityLiteral);
    expect(textContent.value).toBe("Hello");
  });

  it("parses function_call output item to ToolCallContent with call_id and arguments", () => {
    const envelope = makeResponsesEnvelope([
      {
        id: "fc_1",
        type: "function_call",
        call_id: "call_xyz123",
        name: "get_weather",
        arguments: '{"city":"Paris"}',
        status: "completed",
      },
    ]);
    const result = model.transformCompleteChatResponse(envelope);
    expect(result.messages).toHaveLength(1);
    expect(result.messages[0].content).toHaveLength(1);
    const toolCall = result.messages[0].content[0] as {
      modality: string;
      id: string;
      name: string;
      arguments: string;
      index: number;
    };
    expect(toolCall.modality).toBe(ToolCallModalityLiteral);
    expect(toolCall.id).toBe("call_xyz123");
    expect(toolCall.name).toBe("get_weather");
    expect(toolCall.arguments).toBe('{"city":"Paris"}');
    expect(toolCall.index).toBe(0);
  });

  it("parses url_citation annotations to SearchResultContent with deduplicated responses", () => {
    // Mirror web-search.openai.test.ts dedup fixture, wrapped in Responses shape
    const text = "Paris is the capital of France [1]. It has a population of 2.1 million [2].";
    const envelope = makeResponsesEnvelope([
      {
        id: "ws_1",
        type: "web_search_call",
        status: "completed",
        action: { type: "search", query: "Paris population" },
      },
      {
        id: "msg_1",
        type: "message",
        role: "assistant",
        status: "completed",
        content: [
          {
            type: "output_text",
            text,
            annotations: [
              {
                type: "url_citation",
                start_index: 10,
                end_index: 13,
                url: "https://en.wikipedia.org/wiki/Paris",
                title: "Paris - Wikipedia",
              },
              {
                type: "url_citation",
                start_index: 50,
                end_index: 53,
                url: "https://en.wikipedia.org/wiki/Paris",
                title: "Paris - Wikipedia",
              },
            ],
          },
        ],
      },
    ]);
    const result = model.transformCompleteChatResponse(envelope);
    // TextContent + SearchResultContent
    expect(result.messages[0].content).toHaveLength(2);
    const searchResult = result.messages[0].content[1] as {
      modality: string;
      value: { responses: unknown[]; references: { responseIndices: number[] }[] };
    };
    expect(searchResult.modality).toBe(SearchResultModalityLiteral);
    // Dedup: same URL twice → one response entry
    expect(searchResult.value.responses).toHaveLength(1);
    expect(searchResult.value.references).toHaveLength(2);
    expect(searchResult.value.references[0].responseIndices).toEqual([0]);
    expect(searchResult.value.references[1].responseIndices).toEqual([0]);
  });

  it("truncates citation text to 40 chars prefix with leading ellipsis", () => {
    const text = "Paris is the capital of France [1]. It has a population of 2.1 million [2].";
    const envelope = makeResponsesEnvelope([
      {
        id: "msg_1",
        type: "message",
        role: "assistant",
        status: "completed",
        content: [
          {
            type: "output_text",
            text,
            annotations: [
              {
                type: "url_citation",
                start_index: 71,
                end_index: 74,
                url: "https://en.wikipedia.org/wiki/Paris",
                title: "Paris - Wikipedia",
              },
            ],
          },
        ],
      },
    ]);
    const result = model.transformCompleteChatResponse(envelope);
    const searchResult = result.messages[0].content[1] as {
      value: { references: { text: string }[] };
    };
    // prefixStart = max(0, 71-40) = 31, so has "..." prefix
    expect(searchResult.value.references[0].text).toMatch(/^\.\.\..*\[2\]$/);
  });

  it("surfaces refusal content-part as ResponseErrorContent with code='refusal'", () => {
    const envelope = makeResponsesEnvelope([
      {
        id: "msg_1",
        type: "message",
        role: "assistant",
        status: "completed",
        content: [{ type: "refusal", refusal: "I can't help with that." }],
      },
    ]);
    const result = model.transformCompleteChatResponse(envelope);
    const errorPart = result.messages[0].content.find((c: { modality: string }) => c.modality === "error") as
      | { modality: string; value: { type: string; value: { code: string; message: string; provider?: string } } }
      | undefined;
    expect(errorPart).toBeDefined();
    expect(errorPart!.value.type).toBe("response_error");
    expect(errorPart!.value.value.code).toBe("refusal");
    expect(errorPart!.value.value.message).toBe("I can't help with that.");
    expect(errorPart!.value.value.provider).toBe("openai");
    // No text content for a pure-refusal response
    expect(result.messages[0].content.filter((c: { modality: string }) => c.modality === TextModalityLiteral)).toHaveLength(0);
  });

  it("handles message with both output_text and refusal content parts", () => {
    const envelope = makeResponsesEnvelope([
      {
        id: "msg_1",
        type: "message",
        role: "assistant",
        status: "completed",
        content: [
          { type: "output_text", text: "Here's what I can share:", annotations: [] },
          { type: "refusal", refusal: "Cannot elaborate on the restricted part." },
        ],
      },
    ]);
    const result = model.transformCompleteChatResponse(envelope);
    const textParts = result.messages[0].content.filter((c: { modality: string }) => c.modality === TextModalityLiteral) as {
      modality: string;
      value: string;
    }[];
    const errorParts = result.messages[0].content.filter((c: { modality: string }) => c.modality === "error") as {
      modality: string;
      value: { type: string; value: { code: string; message: string; provider?: string } };
    }[];
    expect(textParts).toHaveLength(1);
    expect(textParts[0].value).toBe("Here's what I can share:");
    expect(errorParts).toHaveLength(1);
    expect(errorParts[0].value.value.code).toBe("refusal");
    expect(errorParts[0].value.value.message).toBe("Cannot elaborate on the restricted part.");
    expect(errorParts[0].value.value.provider).toBe("openai");
  });

  it("skips empty reasoning items (no summary, no encrypted_content)", () => {
    const envelope = makeResponsesEnvelope([
      {
        id: "rs_1",
        type: "reasoning",
        summary: [],
        status: null,
      },
      {
        id: "msg_1",
        type: "message",
        role: "assistant",
        status: "completed",
        content: [{ type: "output_text", text: "After reasoning...", annotations: [] }],
      },
    ]);
    const result = model.transformCompleteChatResponse(envelope);
    // Only the message text; empty reasoning item produced no content
    expect(result.messages[0].content).toHaveLength(1);
    const textContent = result.messages[0].content[0] as { modality: string; value: string };
    expect(textContent.modality).toBe(TextModalityLiteral);
    expect(textContent.value).toBe("After reasoning...");
  });

  it("surfaces reasoning item summary as ReasoningContent", () => {
    const envelope = {
      id: "resp_r",
      object: "response" as const,
      model: "gpt-4o",
      status: "completed" as const,
      output: [
        {
          id: "rs_1",
          type: "reasoning",
          status: null,
          summary: [
            { type: "summary_text", text: "Let me think about this." },
            { type: "summary_text", text: "Considering the options..." },
          ],
        },
        {
          id: "msg_1",
          type: "message",
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text: "Answer", annotations: [] }],
        },
      ],
      usage: { input_tokens: 5, output_tokens: 5, total_tokens: 10 },
    };
    const result = model.transformCompleteChatResponse(envelope);
    const reasoningPart = result.messages[0].content.find((c) => c.modality === "reasoning") as
      | { modality: string; value: { thinking: string; signature: string } }
      | undefined;
    expect(reasoningPart).toBeDefined();
    expect(reasoningPart!.value.thinking).toContain("Let me think about this.");
    expect(reasoningPart!.value.thinking).toContain("Considering the options...");
  });

  it("emits ReasoningContent with encrypted_content as signature", () => {
    const envelope = {
      id: "resp_r3",
      object: "response" as const,
      model: "gpt-4o",
      status: "completed" as const,
      output: [
        { id: "rs_1", type: "reasoning", summary: [], encrypted_content: "enc_base64_blob", status: null },
        {
          id: "msg_1",
          type: "message",
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text: "Answer", annotations: [] }],
        },
      ],
      usage: { input_tokens: 5, output_tokens: 5, total_tokens: 10 },
    };
    const result = model.transformCompleteChatResponse(envelope);
    const reasoningPart = result.messages[0].content.find((c) => c.modality === "reasoning") as
      | { modality: string; value: { thinking: string; signature: string } }
      | undefined;
    expect(reasoningPart).toBeDefined();
    expect(reasoningPart!.value.signature).toBe("enc_base64_blob");
  });

  it("emits no content for web_search_call without query and no annotations", () => {
    const envelope = makeResponsesEnvelope([
      { id: "ws_1", type: "web_search_call", status: "completed" },
      {
        id: "msg_1",
        type: "message",
        role: "assistant",
        status: "completed",
        content: [{ type: "output_text", text: "Web search result", annotations: [] }],
      },
    ]);
    const result = model.transformCompleteChatResponse(envelope);
    // Only the message text; web_search_call produced no content, no annotations and no query → no SearchResult
    expect(result.messages[0].content).toHaveLength(1);
    const textContent = result.messages[0].content[0] as { modality: string; value: string };
    expect(textContent.modality).toBe(TextModalityLiteral);
    expect(textContent.value).toBe("Web search result");
  });

  it("populates SearchResultContent.query from web_search_call.action.query", () => {
    const envelope = {
      id: "resp_q1",
      object: "response" as const,
      model: "gpt-4o",
      status: "completed" as const,
      output: [
        { id: "ws_1", type: "web_search_call", status: "completed", action: { type: "search", query: "latest AI news" } },
        {
          id: "msg_1",
          type: "message",
          role: "assistant",
          status: "completed",
          content: [
            {
              type: "output_text",
              text: "Foo.",
              annotations: [{ type: "url_citation", start_index: 0, end_index: 3, url: "https://e.com", title: "E" }],
            },
          ],
        },
      ],
      usage: { input_tokens: 5, output_tokens: 5, total_tokens: 10 },
    };
    const result = model.transformCompleteChatResponse(envelope);
    const searchPart = result.messages[0].content.find((c) => c.modality === "search-result") as
      | { modality: string; value: { query: string } }
      | undefined;
    expect(searchPart).toBeDefined();
    expect(searchPart!.value.query).toBe("latest AI news");
  });

  it("joins multiple web_search_call queries with ' | '", () => {
    const envelope = {
      id: "resp_q2",
      object: "response" as const,
      model: "gpt-4o",
      status: "completed" as const,
      output: [
        { id: "ws_1", type: "web_search_call", status: "completed", action: { type: "search", query: "q1" } },
        { id: "ws_2", type: "web_search_call", status: "completed", action: { type: "search", query: "q2" } },
        {
          id: "msg_1",
          type: "message",
          role: "assistant",
          status: "completed",
          content: [
            {
              type: "output_text",
              text: "Both.",
              annotations: [{ type: "url_citation", start_index: 0, end_index: 4, url: "https://e.com", title: "E" }],
            },
          ],
        },
      ],
      usage: { input_tokens: 5, output_tokens: 5, total_tokens: 10 },
    };
    const result = model.transformCompleteChatResponse(envelope);
    const searchPart = result.messages[0].content.find((c) => c.modality === "search-result") as
      | { modality: string; value: { query: string } }
      | undefined;
    expect(searchPart).toBeDefined();
    expect(searchPart!.value.query).toBe("q1 | q2");
  });

  it("emits SearchResultContent with query only when web_search_call happened but no annotations", () => {
    const envelope = {
      id: "resp_q3",
      object: "response" as const,
      model: "gpt-4o",
      status: "completed" as const,
      output: [
        { id: "ws_1", type: "web_search_call", status: "completed", action: { type: "search", query: "niche query" } },
        {
          id: "msg_1",
          type: "message",
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text: "Nothing useful found.", annotations: [] }],
        },
      ],
      usage: { input_tokens: 5, output_tokens: 2, total_tokens: 7 },
    };
    const result = model.transformCompleteChatResponse(envelope);
    const searchPart = result.messages[0].content.find((c) => c.modality === "search-result") as
      | { modality: string; value: { query: string; responses: unknown[]; references: unknown[] } }
      | undefined;
    expect(searchPart).toBeDefined();
    expect(searchPart!.value.query).toBe("niche query");
    expect(searchPart!.value.responses).toEqual([]);
    expect(searchPart!.value.references).toEqual([]);
  });

  it("maps usage.input_tokens to promptTokens and usage.output_tokens to completionTokens", () => {
    const envelope = makeResponsesEnvelope(
      [
        {
          id: "msg_1",
          type: "message",
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text: "Hello", annotations: [] }],
        },
      ],
      { input_tokens: 42, output_tokens: 17, total_tokens: 59 }
    );
    const result = model.transformCompleteChatResponse(envelope);
    if (!result.usage) throw new Error("expected usage to be defined");
    expect(result.usage.promptTokens).toBe(42);
    expect(result.usage.completionTokens).toBe(17);
    expect(result.usage.totalTokens).toBe(59);
    expect(result.logProbs).toEqual([]);
  });

  it("throws ModelResponseError on HTTP error envelope shape (no output, has error)", () => {
    const errorEnvelope = {
      id: "resp_err",
      object: "response" as const,
      model: "gpt-4o",
      status: "failed" as const,
      output: [],
      error: { type: "invalid_request_error", message: "Request was rejected", code: "invalid_request", param: null },
    };
    expect(() => model.transformCompleteChatResponse(errorEnvelope)).toThrow(ModelResponseError);
  });

  it("surfaces incomplete status as ResponseError content after partial output", () => {
    const envelope = {
      id: "resp_1",
      object: "response" as const,
      model: "gpt-4o",
      status: "incomplete" as const,
      incomplete_details: { reason: "max_output_tokens" },
      output: [
        {
          id: "msg_1",
          type: "message",
          role: "assistant",
          status: "incomplete",
          content: [{ type: "output_text", text: "Partial answer", annotations: [] }],
        },
      ],
      usage: { input_tokens: 10, output_tokens: 5, total_tokens: 15 },
    };
    const result = model.transformCompleteChatResponse(envelope);
    const contents = result.messages[0].content;
    expect(contents.some((c) => c.modality === "text" && (c as { value: string }).value === "Partial answer")).toBe(true);
    const errorPart = contents.find((c) => c.modality === "error") as
      | { modality: string; value: { type: string; value: { code: string; message: string; provider?: string } } }
      | undefined;
    expect(errorPart).toBeDefined();
    expect(errorPart!.value.type).toBe("response_error");
    expect(errorPart!.value.value.code).toBe("incomplete");
    expect(errorPart!.value.value.message).toContain("max_output_tokens");
    expect(errorPart!.value.value.provider).toBe("openai");
  });

  it("surfaces failed status with output as ResponseError (does not throw)", () => {
    const envelope = {
      id: "resp_2",
      object: "response" as const,
      model: "gpt-4o",
      status: "failed" as const,
      error: { type: "server_error", message: "backend hiccup", code: null, param: null },
      output: [
        {
          id: "msg_1",
          type: "message",
          role: "assistant",
          status: "failed",
          content: [{ type: "output_text", text: "So far...", annotations: [] }],
        },
      ],
      usage: { input_tokens: 5, output_tokens: 2, total_tokens: 7 },
    };
    const result = model.transformCompleteChatResponse(envelope);
    const errorPart = result.messages[0].content.find((c) => c.modality === "error") as
      | { modality: string; value: { type: string; value: { code: string; message: string } } }
      | undefined;
    expect(errorPart).toBeDefined();
    expect(errorPart!.value.value.code).toBe("server_error");
  });

  it("throws ModelResponseError on failed status with empty output", () => {
    const envelope = {
      id: "resp_3",
      object: "response" as const,
      model: "gpt-4o",
      status: "failed" as const,
      error: { type: "server_error", message: "hard fail", code: null, param: null },
      output: [],
      usage: { input_tokens: 0, output_tokens: 0, total_tokens: 0 },
    };
    expect(() => model.transformCompleteChatResponse(envelope)).toThrow(ModelResponseError);
  });

  it("surfaces cancelled status as ResponseError", () => {
    const envelope = {
      id: "resp_4",
      object: "response" as const,
      model: "gpt-4o",
      status: "cancelled" as const,
      output: [
        {
          id: "msg_1",
          type: "message",
          role: "assistant",
          status: "incomplete",
          content: [{ type: "output_text", text: "Starting...", annotations: [] }],
        },
      ],
      usage: { input_tokens: 5, output_tokens: 2, total_tokens: 7 },
    };
    const result = model.transformCompleteChatResponse(envelope);
    const errorPart = result.messages[0].content.find((c) => c.modality === "error") as
      | { modality: string; value: { type: string; value: { code: string; message: string } } }
      | undefined;
    expect(errorPart).toBeDefined();
    expect(errorPart!.value.value.code).toBe("cancelled");
  });

  it("accepts file_citation annotations without rejecting the response", () => {
    const model = makeModel();
    const envelope = {
      id: "resp_fc",
      object: "response",
      model: "gpt-4o",
      status: "completed",
      output: [
        {
          id: "msg_1",
          type: "message",
          role: "assistant",
          status: "completed",
          content: [
            {
              type: "output_text",
              text: "See the file.",
              annotations: [{ type: "file_citation", file_id: "file-abc", index: 5, filename: "report.pdf", quote: "foo" }],
            },
          ],
        },
      ],
      usage: { input_tokens: 5, output_tokens: 5, total_tokens: 10 },
    };
    const result = model.transformCompleteChatResponse(envelope);
    const textParts = result.messages[0].content.filter((c) => c.modality === "text");
    expect(textParts).toHaveLength(1);
    const searchParts = result.messages[0].content.filter((c) => c.modality === "search-result");
    expect(searchParts).toHaveLength(0); // file_citation is not url_citation; no SearchResultContent
  });

  it("accepts file_path annotations without rejecting the response", () => {
    const model = makeModel();
    const envelope = {
      id: "resp_fp",
      object: "response",
      model: "gpt-4o",
      status: "completed",
      output: [
        {
          id: "msg_1",
          type: "message",
          role: "assistant",
          status: "completed",
          content: [
            {
              type: "output_text",
              text: "Output saved.",
              annotations: [{ type: "file_path", file_id: "file-xyz", start_index: 0, end_index: 10 }],
            },
          ],
        },
      ],
      usage: { input_tokens: 5, output_tokens: 5, total_tokens: 10 },
    };
    const result = model.transformCompleteChatResponse(envelope);
    const textParts = result.messages[0].content.filter((c) => c.modality === "text");
    expect(textParts).toHaveLength(1);
  });

  it("accepts container_file_citation annotations without rejecting the response", () => {
    const model = makeModel();
    const envelope = {
      id: "resp_cfc",
      object: "response",
      model: "gpt-4o",
      status: "completed",
      output: [
        {
          id: "msg_1",
          type: "message",
          role: "assistant",
          status: "completed",
          content: [
            {
              type: "output_text",
              text: "Container output.",
              annotations: [
                {
                  type: "container_file_citation",
                  container_id: "cntr_1",
                  file_id: "file-1",
                  start_index: 0,
                  end_index: 5,
                  filename: "a.txt",
                },
              ],
            },
          ],
        },
      ],
      usage: { input_tokens: 5, output_tokens: 5, total_tokens: 10 },
    };
    const result = model.transformCompleteChatResponse(envelope);
    const textParts = result.messages[0].content.filter((c) => c.modality === "text");
    expect(textParts).toHaveLength(1);
  });

  it("mixes url_citation with non-URL annotations — only URL citations become SearchResultContent", () => {
    const model = makeModel();
    const envelope = {
      id: "resp_mix",
      object: "response",
      model: "gpt-4o",
      status: "completed",
      output: [
        {
          id: "msg_1",
          type: "message",
          role: "assistant",
          status: "completed",
          content: [
            {
              type: "output_text",
              text: "Paris.",
              annotations: [
                { type: "url_citation", start_index: 0, end_index: 5, url: "https://example.com/paris", title: "Paris" },
                { type: "file_citation", file_id: "file-abc", index: 10, filename: "paris.pdf" },
              ],
            },
          ],
        },
      ],
      usage: { input_tokens: 5, output_tokens: 5, total_tokens: 10 },
    };
    const result = model.transformCompleteChatResponse(envelope);
    const searchParts = result.messages[0].content.filter((c) => c.modality === "search-result");
    expect(searchParts).toHaveLength(1);
    expect((searchParts[0] as any).value.responses).toHaveLength(1);
    expect((searchParts[0] as any).value.responses[0].url).toBe("https://example.com/paris");
  });

  it("surfaces logprobs from output_text content parts", () => {
    const envelope = {
      id: "resp_lp",
      object: "response",
      model: "gpt-4o",
      status: "completed",
      output: [
        {
          id: "msg_1",
          type: "message",
          role: "assistant",
          status: "completed",
          content: [
            {
              type: "output_text",
              text: "Hi",
              annotations: [],
              logprobs: [
                {
                  token: "H",
                  logprob: -0.1,
                  bytes: [72],
                  top_logprobs: [
                    { token: "H", logprob: -0.1, bytes: [72] },
                    { token: "h", logprob: -2.5, bytes: [104] },
                  ],
                },
                {
                  token: "i",
                  logprob: -0.2,
                  bytes: [105],
                  top_logprobs: [{ token: "i", logprob: -0.2, bytes: [105] }],
                },
              ],
            },
          ],
        },
      ],
      usage: { input_tokens: 5, output_tokens: 2, total_tokens: 7 },
    };
    const result = model.transformCompleteChatResponse(envelope);
    expect(result.logProbs).toHaveLength(2);
    expect(result.logProbs?.[0]).toEqual({
      token: "H",
      logProb: -0.1,
      bytes: [72],
      topLogProbs: [
        { token: "H", logProb: -0.1, bytes: [72] },
        { token: "h", logProb: -2.5, bytes: [104] },
      ],
    });
    expect(result.logProbs?.[1].token).toBe("i");
    expect(result.logProbs?.[1].topLogProbs).toHaveLength(1);
  });

  it("returns empty logProbs when output_text parts have no logprobs", () => {
    const envelope = {
      id: "resp_nolp",
      object: "response",
      model: "gpt-4o",
      status: "completed",
      output: [
        {
          id: "msg_1",
          type: "message",
          role: "assistant",
          status: "completed",
          content: [{ type: "output_text", text: "Hi", annotations: [] }],
        },
      ],
      usage: { input_tokens: 5, output_tokens: 1, total_tokens: 6 },
    };
    const result = model.transformCompleteChatResponse(envelope);
    expect(result.logProbs).toEqual([]);
  });

  it("flattens logprobs across multiple output_text parts in one message", () => {
    const envelope = {
      id: "resp_multi",
      object: "response",
      model: "gpt-4o",
      status: "completed",
      output: [
        {
          id: "msg_1",
          type: "message",
          role: "assistant",
          status: "completed",
          content: [
            {
              type: "output_text",
              text: "A",
              annotations: [],
              logprobs: [{ token: "A", logprob: -0.1, bytes: [65], top_logprobs: [] }],
            },
            {
              type: "output_text",
              text: "B",
              annotations: [],
              logprobs: [{ token: "B", logprob: -0.2, bytes: [66], top_logprobs: [] }],
            },
          ],
        },
      ],
      usage: { input_tokens: 5, output_tokens: 2, total_tokens: 7 },
    };
    const result = model.transformCompleteChatResponse(envelope);
    expect(result.logProbs).toHaveLength(2);
    expect(result.logProbs?.[0].token).toBe("A");
    expect(result.logProbs?.[1].token).toBe("B");
  });
});

// ─── T08: transformStreamChatResponseChunk — Responses path ──────────────────

describe("transformStreamChatResponseChunk — Responses path", () => {
  let model: BaseChatModel;

  beforeEach(() => {
    model = makeModel();
  });

  it("dispatches to CC parser when chunk.object === chat.completion.chunk", async () => {
    const ccChunk = makeChunkLine({
      id: "chatcmpl-123",
      object: "chat.completion.chunk",
      created: 1677652288,
      model: "gpt-4o",
      choices: [{ index: 0, delta: { role: "assistant", content: "Hello" }, finish_reason: null }],
    });
    const results = await collectChunks(model, ccChunk, "");
    const withContent = results.find((r) => r.partialResponse.partialMessages.length > 0);
    expect(withContent).toBeDefined();
    // CC buffer must NOT carry the Responses sidecar marker
    for (const r of results) {
      expect(r.buffer.startsWith("__RESP_STATE__")).toBe(false);
    }
  });

  it("dispatches to Responses parser when chunk.type starts with response.", async () => {
    const chunk = makeTextDelta("Hello");
    const results = await collectChunks(model, chunk, "");
    // Responses buffer carries the state sidecar
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.buffer.startsWith("__RESP_STATE__")).toBe(true);
    }
  });

  it("ignores response.created, response.in_progress, response.queued lifecycle events", async () => {
    const chunk = makeCreated() + makeInProgress() + makeQueued();
    const results = await collectChunks(model, chunk, "");
    // No partial messages from any lifecycle event; only the terminal state-only yield
    const allPartials = results.flatMap((r) => r.partialResponse.partialMessages);
    expect(allPartials).toHaveLength(0);
    // Buffer must carry the sidecar marker with empty state
    expect(results[results.length - 1].buffer.startsWith("__RESP_STATE__")).toBe(true);
  });

  it("emits PartialTextContent on response.output_text.delta", async () => {
    const chunk = makeTextDelta("Hello from Responses");
    const results = await collectChunks(model, chunk, "");
    const emitting = results.find((r) => r.partialResponse.partialMessages.length > 0);
    expect(emitting).toBeDefined();
    const msg = emitting!.partialResponse.partialMessages[0] as {
      role: string;
      partialContent: { modality: string; value: string };
    };
    expect(msg.role).toBe(AssistantRoleLiteral);
    expect(msg.partialContent.modality).toBe("partial-text");
    expect(msg.partialContent.value).toBe("Hello from Responses");
  });

  it("emits PartialSearchResultContent on response.output_text.annotation.added with one response + one reference", async () => {
    const chunk = makeAnnotationAdded({
      type: "url_citation",
      start_index: 10,
      end_index: 15,
      url: "https://en.wikipedia.org/wiki/Paris",
      title: "Paris - Wikipedia",
    });
    const results = await collectChunks(model, chunk, "");
    const emitting = results.find((r) => r.partialResponse.partialMessages.length > 0);
    expect(emitting).toBeDefined();
    const msg = emitting!.partialResponse.partialMessages[0] as {
      role: string;
      partialContent: {
        modality: string;
        value: {
          responses?: { source?: string; url?: string; title?: string }[];
          references?: { text?: string; responseIndices?: number[]; startIndex?: number; endIndex?: number }[];
        };
      };
    };
    expect(msg.role).toBe(AssistantRoleLiteral);
    expect(msg.partialContent.modality).toBe("partial-search-result");
    expect(msg.partialContent.value.responses).toHaveLength(1);
    expect(msg.partialContent.value.responses?.[0]).toEqual({
      source: "web",
      url: "https://en.wikipedia.org/wiki/Paris",
      title: "Paris - Wikipedia",
    });
    expect(msg.partialContent.value.references).toHaveLength(1);
    expect(msg.partialContent.value.references?.[0].responseIndices).toEqual([0]);
    expect(msg.partialContent.value.references?.[0].startIndex).toBe(10);
    expect(msg.partialContent.value.references?.[0].endIndex).toBe(15);
  });

  it("ignores response.web_search_call.* lifecycle events", async () => {
    const chunk = makeWebSearchInProgress();
    const results = await collectChunks(model, chunk, "");
    const allPartials = results.flatMap((r) => r.partialResponse.partialMessages);
    expect(allPartials).toHaveLength(0);
  });

  it("emits PartialReasoningContent on response.reasoning_summary_text.delta", async () => {
    const chunk = makeReasoningDelta("I am thinking...");
    const results = await collectChunks(model, chunk, "");
    const emitting = results.find((r) => r.partialResponse.partialMessages.length > 0);
    expect(emitting).toBeDefined();
    const msg = emitting!.partialResponse.partialMessages[0] as {
      role: string;
      partialContent: { modality: string; value: { type?: string; thinking?: string } };
    };
    expect(msg.role).toBe(AssistantRoleLiteral);
    expect(msg.partialContent.modality).toBe("partial-reasoning");
    expect(msg.partialContent.value.thinking).toBe("I am thinking...");
  });

  it("emits PartialResponseErrorContent with code='refusal' on response.refusal.delta", async () => {
    const chunk = makeRefusalDelta("I can't help");
    const results = await collectChunks(model, chunk, "");
    const emitting = results.find((r) => r.partialResponse.partialMessages.length > 0);
    expect(emitting).toBeDefined();
    const msg = emitting!.partialResponse.partialMessages[0] as {
      role: string;
      partialContent: { modality: string; value: { type: string; code?: string; message?: string; provider?: string } };
    };
    expect(msg.role).toBe(AssistantRoleLiteral);
    expect(msg.partialContent.modality).toBe("partial-error");
    expect(msg.partialContent.value.type).toBe("response_error");
    expect(msg.partialContent.value.code).toBe("refusal");
    expect(msg.partialContent.value.message).toBe("I can't help");
    expect(msg.partialContent.value.provider).toBe("openai");
  });

  it("concatenates refusal chunks across deltas via merge", async () => {
    // Stream two refusal delta chunks; each must emit a PartialResponseErrorContent carrying
    // its own fragment. The @adaline/types merger is responsible for concatenating the final
    // `message` field — contract tested at that layer.
    const chunk1 = makeRefusalDelta("I can't help");
    const chunk2 = makeRefusalDelta(" with that.");

    const partials: {
      role: string;
      partialContent: { modality: string; value: { type: string; code?: string; message?: string } };
    }[] = [];
    let buffer = "";
    for (const chunk of [chunk1, chunk2]) {
      const results = await collectChunks(model, chunk, buffer);
      for (const r of results) {
        for (const pm of r.partialResponse.partialMessages ?? []) {
          partials.push(
            pm as {
              role: string;
              partialContent: { modality: string; value: { type: string; code?: string; message?: string } };
            }
          );
        }
        buffer = r.buffer;
      }
    }
    const refusalPartials = partials.filter((pm) => pm.partialContent.value.code === "refusal");
    expect(refusalPartials).toHaveLength(2);
    expect(refusalPartials[0].partialContent.value.message).toBe("I can't help");
    expect(refusalPartials[1].partialContent.value.message).toBe(" with that.");
  });

  it("resolves item_id to synthetic index across chunks for function_call_arguments.delta", async () => {
    // Chunk 1: response.output_item.added with a function_call item
    const chunk1 = makeOutputItemAdded({
      id: "fc_1",
      type: "function_call",
      call_id: "call_xyz",
      name: "get_weather",
      arguments: "",
      status: "in_progress",
    });

    const results1 = await collectChunks(model, chunk1, "");
    // First chunk emits a tool-call partial message seeding name/call_id at index 0
    const emit1 = results1.find((r) => r.partialResponse.partialMessages.length > 0);
    expect(emit1).toBeDefined();
    const seed = emit1!.partialResponse.partialMessages[0] as {
      role: string;
      partialContent: { modality: string; index: number; id?: string; name?: string; arguments?: string };
    };
    expect(seed.partialContent.modality).toBe("partial-tool-call");
    expect(seed.partialContent.index).toBe(0);
    expect(seed.partialContent.id).toBe("call_xyz");
    expect(seed.partialContent.name).toBe("get_weather");

    // Buffer from chunk 1 must carry the sidecar with fc_1 → 0 mapping
    const buffer1 = results1[results1.length - 1].buffer;
    expect(buffer1.startsWith("__RESP_STATE__")).toBe(true);
    expect(buffer1).toContain('"fc_1":0');

    // Chunk 2: function_call_arguments.delta with same item_id — passes buffer1 through
    const chunk2 = makeFunctionCallArgsDelta("fc_1", '{"city":');
    const results2 = await collectChunks(model, chunk2, buffer1);
    const emit2 = results2.find((r) => r.partialResponse.partialMessages.length > 0);
    expect(emit2).toBeDefined();
    const delta = emit2!.partialResponse.partialMessages[0] as {
      role: string;
      partialContent: { modality: string; index: number; arguments?: string };
    };
    expect(delta.partialContent.modality).toBe("partial-tool-call");
    // Cross-chunk item_id → index resolution: index MUST be 0 (not a new allocation)
    expect(delta.partialContent.index).toBe(0);
    expect(delta.partialContent.arguments).toBe('{"city":');
  });

  it("sets partialResponse.usage from response.completed event", async () => {
    const chunk = makeCompleted({ input_tokens: 30, output_tokens: 10, total_tokens: 40 });
    const results = await collectChunks(model, chunk, "");
    const withUsage = results.find((r) => r.partialResponse.usage !== undefined);
    expect(withUsage).toBeDefined();
    const usage = withUsage!.partialResponse.usage as { promptTokens: number; completionTokens: number; totalTokens: number };
    expect(usage.promptTokens).toBe(30);
    expect(usage.completionTokens).toBe(10);
    expect(usage.totalTokens).toBe(40);
  });

  it("emits PartialResponseErrorContent on response.failed instead of throwing", async () => {
    const chunk = makeFailed();
    const results = await collectChunks(model, chunk, "");
    const allPartials = results.flatMap((r) => r.partialResponse.partialMessages) as {
      role: string;
      partialContent: { modality: string; value: { type?: string; code?: string; message?: string; provider?: string } };
    }[];
    const errorPartial = allPartials.find(
      (pm) => pm.partialContent?.modality === "partial-error" && pm.partialContent?.value?.type === "response_error"
    );
    expect(errorPartial).toBeDefined();
    expect(errorPartial!.partialContent.value.code).toBe("failed");
    expect(errorPartial!.partialContent.value.provider).toBe("openai");
  });

  it("emits PartialResponseErrorContent on response.incomplete instead of throwing", async () => {
    const chunk = makeChunkLine({
      type: "response.incomplete",
      response: {
        id: "resp_i",
        object: "response",
        model: "gpt-4o",
        status: "incomplete",
        incomplete_details: { reason: "max_output_tokens" },
        output: [],
        usage: null,
      },
    });
    const results = await collectChunks(model, chunk, "");
    const allPartials = results.flatMap((r) => r.partialResponse.partialMessages) as {
      role: string;
      partialContent: { modality: string; value: { type?: string; code?: string; message?: string } };
    }[];
    const errorPartial = allPartials.find(
      (pm) => pm.partialContent?.value?.type === "response_error" && pm.partialContent?.value?.code === "incomplete"
    );
    expect(errorPartial).toBeDefined();
    expect(errorPartial!.partialContent.value.message).toContain("max_output_tokens");
  });

  it("throws ModelResponseError on nested error event {type:error, error:{...}} with cause set to inner error payload", async () => {
    const message = "There was an issue with your request";
    const chunk = makeNestedError(message);
    try {
      await collectChunks(model, chunk, "");
      throw new Error("expected collectChunks to throw");
    } catch (err) {
      expect(err).toBeInstanceOf(ModelResponseError);
      const thrown = err as ModelResponseError;
      // The cause carries the stringified inner error payload
      expect((thrown.cause as Error).message).toContain(message);
    }
  });

  // Additional web_search_call lifecycle events dispatch check
  it("ignores response.web_search_call.searching lifecycle event", async () => {
    const chunk = makeWebSearchSearching();
    const results = await collectChunks(model, chunk, "");
    const allPartials = results.flatMap((r) => r.partialResponse.partialMessages);
    expect(allPartials).toHaveLength(0);
  });

  it("ignores response.web_search_call.completed lifecycle event", async () => {
    const chunk = makeWebSearchCompleted();
    const results = await collectChunks(model, chunk, "");
    const allPartials = results.flatMap((r) => r.partialResponse.partialMessages);
    expect(allPartials).toHaveLength(0);
  });

  it("emits PartialSearchResultContent on response.output_item.added for web_search_call", async () => {
    const chunk = makeChunkLine({
      type: "response.output_item.added",
      output_index: 0,
      item: { id: "ws_1", type: "web_search_call", status: "in_progress", action: { type: "search", query: "what is X?" } },
    });

    const results = await collectChunks(model, chunk, "");
    const allPartials = results.flatMap((r) => r.partialResponse.partialMessages) as {
      role: string;
      partialContent: { modality: string; value: { query?: string } };
    }[];
    const searchPartial = allPartials.find((pm) => pm.partialContent?.modality === "partial-search-result");
    expect(searchPartial).toBeDefined();
    expect(searchPartial!.partialContent.value.query).toBe("what is X?");
  });

  it("throws ModelResponseError on malformed JSON in SSE data line", async () => {
    const model = makeModel();
    const chunk = `data: {not-valid-json\n`;
    await expect(async () => {
      const gen = model.transformStreamChatResponseChunk(chunk, "");
      for await (const _ of gen) {
        /* drain */
      }
    }).rejects.toThrow(ModelResponseError);
  });
});

// ─── T17: registry ────────────────────────────────────────────────────────────

describe("registry", () => {
  const provider = new OpenAI();
  const schemas = provider.chatModelSchemas();

  const q2Models = [
    "gpt-4o",
    "gpt-4o-2024-08-06",
    "gpt-4o-2024-05-13",
    "gpt-4o-mini",
    "gpt-4o-mini-2024-07-18",
    "gpt-4.1",
    "gpt-4.1-mini",
    "gpt-5",
    "gpt-5-mini",
    "gpt-5-nano",
    "gpt-5-chat-latest",
    "gpt-5.1",
    "gpt-5.2",
    "gpt-5.2-chat-latest",
    "chatgpt-5.2",
    "gpt-5.4",
    "gpt-5.4-mini",
    "gpt-5.2-pro",
    "gpt-5.4-pro",
    "o1",
    "o1-2024-12-17",
    "o3",
    "o3-2025-04-16",
    "o3-mini",
    "o3-mini-2025-01-31",
    "o4-mini",
    "o4-mini-2025-04-16",
  ];

  // Models that must NOT declare webSearchTool at all (no Responses web_search support).
  const noWebSearchModels = [
    "gpt-4.1-nano", // no Responses web_search support
    "chatgpt-4o-latest", // no function-call support (M1 critic)
    "gpt-5.2-codex", // codex variant, tool-free
    "gpt-5.3-codex", // codex variant, tool-free
  ];

  // CC always-on-search SKUs: they DO declare webSearchTool but stay on the CC path.
  const ccSearchPreviewModels = [
    "gpt-4o-search-preview",
    "gpt-4o-search-preview-2025-03-11",
    "gpt-4o-mini-search-preview",
    "gpt-4o-mini-search-preview-2025-03-11",
    "gpt-5-search-api",
  ];

  describe("Q2 allowlist — declares webSearchTool + search-result modality", () => {
    it.each(q2Models)("model '%s' declares webSearchTool config key", (literal) => {
      const schema = schemas[literal];
      expect(schema, `schema missing for ${literal}`).toBeDefined();
      expect(schema.config.def.webSearchTool).toBeDefined();
      expect((schema.config.def.webSearchTool as { type: string }).type).toBe("select-boolean");
      expect((schema.config.def.webSearchTool as { param: string }).param).toBe("webSearch");
    });

    it.each(q2Models)("model '%s' webSearchTool defaults to false", (literal) => {
      const schema = schemas[literal];
      expect((schema.config.def.webSearchTool as { default: unknown }).default).toBe(false);
    });

    it.each(q2Models)("model '%s' advertises search-result modality", (literal) => {
      const schema = schemas[literal];
      expect(schema.modalities).toContain(SearchResultModalityLiteral);
    });

    it.each(q2Models)(
      "model '%s' declares webSearchAllowedDomains, webSearchUserLocation, webSearchExternalAccess config keys",
      (literal) => {
        const schema = schemas[literal];
        expect(schema.config.def.webSearchAllowedDomains).toBeDefined();
        expect(schema.config.def.webSearchUserLocation).toBeDefined();
        expect(schema.config.def.webSearchExternalAccess).toBeDefined();
      }
    );
  });

  describe("Q2 exclusions — must NOT declare webSearchTool", () => {
    it.each(noWebSearchModels)("model '%s' does not declare webSearchTool", (literal) => {
      const schema = schemas[literal];
      expect(schema, `schema missing for ${literal}`).toBeDefined();
      expect((schema.config.def as Record<string, unknown>).webSearchTool).toBeUndefined();
    });

    it.each(noWebSearchModels)(
      "model '%s' does not declare webSearchAllowedDomains/webSearchUserLocation/webSearchExternalAccess",
      (literal) => {
        const schema = schemas[literal];
        const def = schema.config.def as Record<string, unknown>;
        expect(def.webSearchAllowedDomains).toBeUndefined();
        expect(def.webSearchUserLocation).toBeUndefined();
        expect(def.webSearchExternalAccess).toBeUndefined();
      }
    );
  });

  describe("CC search-preview SKUs — keep their existing webSearchTool config (unchanged)", () => {
    it.each(ccSearchPreviewModels)("model '%s' still declares webSearchTool (CC path)", (literal) => {
      const schema = schemas[literal];
      expect(schema, `schema missing for ${literal}`).toBeDefined();
      expect((schema.config.def as Record<string, unknown>).webSearchTool).toBeDefined();
    });

    it.each(ccSearchPreviewModels)("model '%s' does NOT declare Responses-API-only filter keys (CC path unchanged)", (literal) => {
      const schema = schemas[literal];
      const def = schema.config.def as Record<string, unknown>;
      expect(def.webSearchAllowedDomains).toBeUndefined();
      expect(def.webSearchUserLocation).toBeUndefined();
      expect(def.webSearchExternalAccess).toBeUndefined();
    });
  });

  describe("regression — top-level leakage + caller-config immutability", () => {
    it("does not leak web-search filter config keys at the top level of the Responses body", async () => {
      const model = makeGpt5Model();
      const body = await model.getCompleteChatData(
        {
          webSearchTool: true,
          webSearchAllowedDomains: ["example.com"],
          webSearchUserLocation: { country: "US", city: "SF" },
          webSearchExternalAccess: false,
        } as ConfigType,
        [makeUserTextMessage("search")]
      );
      // None of the raw config keys should appear at the top level — they're consumed by
      // transformToolsResponsesApi and built into the `tools` entry.
      expect((body as Record<string, unknown>).webSearchAllowedDomains).toBeUndefined();
      expect((body as Record<string, unknown>).webSearchUserLocation).toBeUndefined();
      expect((body as Record<string, unknown>).webSearchExternalAccess).toBeUndefined();
      // But they SHOULD appear in the web_search tool entry.
      const tools = body.tools as Array<Record<string, unknown>>;
      const webSearchTool = tools.find((t) => t.type === "web_search") as Record<string, unknown>;
      expect(webSearchTool.filters).toEqual({ allowed_domains: ["example.com"] });
      expect(webSearchTool.user_location).toEqual({ type: "approximate", country: "US", city: "SF" });
      expect(webSearchTool.external_web_access).toBe(false);
    });

    it("does not leak webSearchExternalAccess default=true at the top level of the Responses body", async () => {
      const model = makeGpt5Model();
      const body = await model.getCompleteChatData({ webSearchTool: true } as ConfigType, [makeUserTextMessage("search")]);
      // Zod applies the default (true) during parse; verify it never surfaces at top level.
      expect((body as Record<string, unknown>).webSearchExternalAccess).toBeUndefined();
    });

    it("does not mutate the caller's config on the Responses path", async () => {
      const model = makeGpt5Model();
      const tool = makeFunctionTool("get_weather", "stub", { type: "object", properties: {}, required: [] });
      const originalConfig = { webSearchTool: true, toolChoice: "auto" };
      const snapshot = JSON.parse(JSON.stringify(originalConfig));
      await model.getCompleteChatData(originalConfig as ConfigType, [makeUserTextMessage("hi")], [tool]);
      expect(originalConfig).toEqual(snapshot);
    });

    it("does not mutate the caller's config on the CC path", async () => {
      const model = makeGpt5Model();
      const tool = makeFunctionTool("get_weather", "stub", { type: "object", properties: {}, required: [] });
      const originalConfig = { webSearchTool: false, toolChoice: "auto" };
      const snapshot = JSON.parse(JSON.stringify(originalConfig));
      await model.getCompleteChatData(originalConfig as ConfigType, [makeUserTextMessage("hi")], [tool]);
      expect(originalConfig).toEqual(snapshot);
    });
  });
});
