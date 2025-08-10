import { beforeEach, describe, expect, it } from "vitest";
import { z, ZodError } from "zod";

import { ChatModelSchema, ChatModelSchemaType, InvalidMessagesError, InvalidToolsError, ModelResponseError } from "@adaline/provider";
import {
  AssistantRoleLiteral,
  ChatResponseType,
  ChatUsageType,
  Config,
  ContentType,
  createPartialTextMessage,
  createPartialToolCallMessage,
  createTextContent,
  createToolCallContent,
  ImageModalityLiteral,
  MessageType,
  SystemRoleLiteral,
  TextModalityLiteral,
  ToolCallModalityLiteral,
  ToolResponseModalityLiteral,
  ToolRoleLiteral,
  ToolType,
  UserRoleLiteral,
} from "@adaline/types";

import { AnthropicChatModelConfigs } from "../../../src/configs";
import { BaseChatModel } from "../../../src/models";
import { AnthropicRequestType } from "../../../src/models/chat-models/types";

// Helper function to collect results from the async generator
async function collectAsyncGenerator<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];
  for await (const value of generator) {
    results.push(value);
  }
  return results;
}
describe("BaseChatModel", () => {
  const mockRolesMap = {
    system: "system",
    user: "user",
    assistant: "assistant",
    tool: "tool",
  };
  const mockRoles = ["system", "user", "assistant", "tool"] as const;
  const mockModalities = ["text", "image", "tool-call", "tool-response"] as const;

  const mockModelSchema: ChatModelSchemaType = ChatModelSchema(z.enum(mockRoles), z.enum(mockModalities)).parse({
    name: "test-model",
    description: "test-description",
    maxInputTokens: 200000,
    maxOutputTokens: 8192,
    roles: mockRolesMap,
    modalities: mockModalities,
    config: {
      def: AnthropicChatModelConfigs.base(200000, 4).def,
      schema: AnthropicChatModelConfigs.base(200000, 4).schema,
    },
  });

  const mockOptions = {
    apiKey: "test-api-key",
    baseUrl: "https://api.anthropic.com/v1",
    modelName: "test-model",
  };

  describe("constructor", () => {
    it("should initialize properties correctly", () => {
      const baseChatModel = new BaseChatModel(mockModelSchema, mockOptions);
      expect(baseChatModel.modelSchema).toBe(mockModelSchema);
      expect(baseChatModel.getDefaultBaseUrl()).toBe("https://api.anthropic.com/v1");
    });
  });

  describe("getDefaultBaseUrl", () => {
    it("should return the baseUrl without trailing slash", () => {
      const model = new BaseChatModel(mockModelSchema, mockOptions);
      expect(model.getDefaultBaseUrl()).toBe("https://api.anthropic.com/v1");
    });
  });

  describe("getDefaultHeaders", () => {
    it("should return the default headers with API key", () => {
      const model = new BaseChatModel(mockModelSchema, mockOptions);
      expect(model.getDefaultHeaders()).toEqual({
        "anthropic-dangerous-direct-browser-access": "true",
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "x-api-key": "test-api-key",
      });
    });
  });

  describe("getDefaultParams", () => {
    it("should return the default params with model name", () => {
      const model = new BaseChatModel(mockModelSchema, mockOptions);
      expect(model.getDefaultParams()).toEqual({
        model: "test-model",
      });
    });
  });

  describe("transformConfig", () => {
    let model: BaseChatModel;
    let tools: ToolType[];
    let messages: MessageType[];

    beforeEach(() => {
      model = new BaseChatModel(mockModelSchema, mockOptions);
      tools = [];
      messages = [];
    });

    // Valid configuration test (existing test)
    it("should transform and return every config", () => {
      const config = Config().parse({
        temperature: 1,
        maxTokens: 2000,
        stop: ["test"],
        topP: 1,
      });
      expect(model.transformConfig(config, messages, tools)).toEqual({
        max_tokens: 2000,
        temperature: 1,
        top_p: 1,
        stop_sequences: ["test"],
      });
    });

    // Stop list tests
    it("should throw an error if stop array length is greater than 4", () => {
      const config = Config().parse({
        temperature: 1,
        maxTokens: 2000,
        stop: ["s1", "s2", "s3", "s4", "s5"], // 5 strings, invalid
        topP: 1,
        frequencyPenalty: 0.5,
        presencePenalty: 0.5,
        seed: 1,
        logProbs: true,
        topLogProbs: 0,
      });
      expect(() => model.transformConfig(config, messages, tools)).toThrowError();
    });

    // Temperature tests
    it("should throw an error when temperature is below 0", () => {
      const config = Config().parse({
        temperature: -0.1, // invalid: below 0
        maxTokens: 2000,
        stop: ["test"],
        topP: 1,
        frequencyPenalty: 0.5,
        presencePenalty: 0.5,
        seed: 1,
        logProbs: true,
        topLogProbs: 0,
      });
      expect(() => model.transformConfig(config, messages, tools)).toThrowError();
    });

    it("should throw an error when temperature is above 2", () => {
      const config = Config().parse({
        temperature: 2.1, // invalid: above 2
        maxTokens: 2000,
        stop: ["test"],
        topP: 1,
        frequencyPenalty: 0.5,
        presencePenalty: 0.5,
        seed: 1,
        logProbs: true,
        topLogProbs: 0,
      });
      expect(() => model.transformConfig(config, messages, tools)).toThrowError();
    });

    // topP tests
    it("should throw an error when topP is below 0", () => {
      const config = Config().parse({
        temperature: 1,
        maxTokens: 2000,
        stop: ["test"],
        topP: -0.01, // invalid: below 0
        frequencyPenalty: 0.5,
        presencePenalty: 0.5,
        seed: 1,
        logProbs: true,
        topLogProbs: 0,
      });
      expect(() => model.transformConfig(config, messages, tools)).toThrowError();
    });

    it("should throw an error when topP is above 1", () => {
      const config = Config().parse({
        temperature: 1,
        maxTokens: 2000,
        stop: ["test"],
        topP: 1.01, // invalid: above 1
        frequencyPenalty: 0.5,
        presencePenalty: 0.5,
        seed: 1,
        logProbs: true,
        topLogProbs: 0,
      });
      expect(() => model.transformConfig(config, messages, tools)).toThrowError();
    });

    // Additional valid case for boundary values
    it("should transform valid boundary values correctly", () => {
      const config = Config().parse({
        temperature: 0, // lower boundary
        maxTokens: 1500,
        stop: ["s1", "s2", "s3", "s4"], // max allowed stop strings
        topP: 0, // lower boundary
        frequencyPenalty: -2, // lower boundary
        presencePenalty: 2, // upper boundary
        seed: 0, // lower boundary
        logProbs: true, // should be 0 in transformed config
        topLogProbs: 20, // upper boundary
      });
      expect(model.transformConfig(config, messages, tools)).toEqual({
        max_tokens: 1500,
        temperature: 0,

        top_p: 0,
        stop_sequences: ["s1", "s2", "s3", "s4"],
      });
    });

    it("should throw error if tool is defined", () => {
      expect(() => {
        const config = Config().parse({
          toolChoice: "auto",
        });
        model.transformConfig(config, messages, tools);
      }).toThrowError();
    });

    // ReasoningEnabled tests
    it("should transform config with reasoningEnabled correctly", () => {
      const config = Config().parse({
        maxTokens: 2000,
        reasoningEnabled: true,
        maxReasoningTokens: 500,
      });
      expect(model.transformConfig(config, messages, tools)).toEqual({
        max_tokens: 2000,
        thinking: {
          type: "enabled",
          budget_tokens: 500,
        },
      });
    });

    it("should throw  if reasoningEnabled is true but maxReasoningTokens is missing", () => {
      const config = Config().parse({
        maxTokens: 2000,
        reasoningEnabled: true,
        // maxReasoningTokens is missing
      });
      expect(() => model.transformConfig(config, messages, tools)).toThrow();
      try {
        model.transformConfig(config, messages, tools);
      } catch (e: any) {
        expect(e.info).toContain("Invalid extended thinking config");
        expect(e.cause?.message).toContain("Both 'reasoningEnabled' and 'maxReasoningTokens' must be defined together");
      }
    });

    it("should throw  if maxReasoningTokens is defined but reasoningEnabled is missing or false", () => {
      const config = Config().parse({
        maxTokens: 2000,
        maxReasoningTokens: 500,
        // reasoningEnabled is missing
      });
      expect(() => model.transformConfig(config, messages, tools)).toThrow();
      try {
        model.transformConfig(config, messages, tools);
      } catch (e: any) {
        expect(e.info).toContain("Invalid extended thinking config");
        expect(e.cause?.message).toContain("Both 'reasoningEnabled' and 'maxReasoningTokens' must be defined together");
      }
    });

    it("should throw  if maxReasoningTokens is greater than or equal to maxTokens", () => {
      const config = Config().parse({
        maxTokens: 500,
        reasoningEnabled: true,
        maxReasoningTokens: 500, // Equal to maxTokens
      });
      expect(() => model.transformConfig(config, messages, tools)).toThrow();
      try {
        model.transformConfig(config, messages, tools);
      } catch (e: any) {
        expect(e.info).toContain("Invalid extended thinking token budget");
        expect(e.cause?.message).toContain("maxReasoningTokens (500) must be less than max_tokens (500)");
      }

      const config2 = Config().parse({
        maxTokens: 500,
        reasoningEnabled: true,
        maxReasoningTokens: 600, // Greater than maxTokens
      });
      expect(() => model.transformConfig(config2, messages, tools)).toThrow();
      try {
        model.transformConfig(config2, messages, tools);
      } catch (e: any) {
        expect(e.info).toContain("Invalid extended thinking token budget");
        expect(e.cause?.message).toContain("maxReasoningTokens (600) must be less than max_tokens (500)");
      }
    });

    it("should not include thinking object if reasoningEnabled is undefined", () => {
      const config = Config().parse({
        maxTokens: 2000,
        // reasoningEnabled is undefined
        // maxReasoningTokens is undefined
      });
      expect(model.transformConfig(config, messages, tools)).toEqual({
        max_tokens: 2000,
      });
    });
  });

  describe("BaseChatModel transformMessages", () => {
    let model: BaseChatModel;

    beforeEach(() => {
      model = new BaseChatModel(mockModelSchema, mockOptions);
    });

    // --- Basic Cases ---

    it("should return empty array for null input", () => {
      expect(model.transformMessages(null as any)).toEqual({ messages: [] });
    });

    it("should return empty array for undefined input", () => {
      expect(model.transformMessages(undefined as any)).toEqual({ messages: [] });
    });

    it("should return empty array for empty messages array", () => {
      expect(model.transformMessages([])).toEqual({ messages: [] });
    });

    // --- Parsing Errors ---

    it("should throw InvalidMessagesError if safeParse fails", () => {
      const invalidInput = [{ role: "user" }]; // Missing content array

      expect(() => model.transformMessages(invalidInput as any)).toThrow(InvalidMessagesError);
      try {
        model.transformMessages(invalidInput as any);
      } catch (e: any) {
        expect(e).toBeInstanceOf(InvalidMessagesError);
        expect(e.info).toBe("Invalid messages");
        expect(JSON.parse(e.cause.message)).toEqual([
          {
            code: "invalid_type",
            expected: "array",
            received: "undefined",
            path: ["content"],
            message: "Required",
          },
        ]);
      }
    });

    it("should throw InvalidMessagesError if safeParse fails on second message", () => {
      const messages: MessageType[] = [
        { role: SystemRoleLiteral, content: [{ modality: TextModalityLiteral, value: "Hi" }] },
        { role: UserRoleLiteral, content: null as any }, // Invalid content
      ];

      expect(() => model.transformMessages(messages)).toThrow(InvalidMessagesError);
      try {
        model.transformMessages(messages);
      } catch (e: any) {
        expect(e).toBeInstanceOf(InvalidMessagesError);
        expect(e.info).toBe("Invalid messages");
        expect(JSON.parse(e.cause.message)).toEqual([
          {
            code: "invalid_type",
            expected: "array",
            received: "null",
            path: ["content"],
            message: "Expected array, received null",
          },
        ]); // Check it's the error from the *second* parse attempt
      }
    });

    // --- Validation Errors ---

    it("should throw InvalidMessagesError for unsupported modality", () => {
      const messages: MessageType[] = [
        {
          role: UserRoleLiteral,
          content: [{ modality: "audio", value: "some_audio.mp3" }] as any, // audio is not in modalities
        },
      ];

      expect(() => model.transformMessages(messages)).toThrow(InvalidMessagesError);
    });

    it("should throw InvalidMessagesError for PDF modality (not supported by Anthropic)", () => {
      const messages: MessageType[] = [
        {
          role: UserRoleLiteral,
          content: [
            {
              modality: "pdf" as const,
              value: { type: "base64", base64: "JVBERi0xLjQK...", mediaType: "pdf" },
            },
          ],
        },
      ];

      expect(() => model.transformMessages(messages)).toThrow(InvalidMessagesError);
    });

    it("should throw InvalidMessagesError for unsupported role", () => {
      const messages: MessageType[] = [
        {
          role: "guest" as any, // guest is not in roles
          content: [{ modality: TextModalityLiteral, value: "Hello" }],
        },
      ];

      expect(() => model.transformMessages(messages)).toThrow(InvalidMessagesError);
      try {
        model.transformMessages(messages);
      } catch (e: any) {
        expect(e).toBeInstanceOf(InvalidMessagesError);
        expect(JSON.parse(e.cause?.message)).toEqual([
          {
            received: "guest",
            code: "invalid_enum_value",
            options: ["system", "user", "assistant", "tool"],
            path: ["role"],
            message: "Invalid enum value. Expected 'system' | 'user' | 'assistant' | 'tool', received 'guest'",
          },
        ]);
      }
    });

    // --- Role/Modality Combination Errors ---

    it("should throw InvalidMessagesError for System role with non-text modality", () => {
      const messages: MessageType[] = [
        {
          role: SystemRoleLiteral,
          content: [{ modality: ImageModalityLiteral, value: { type: "url", url: "image.png" }, detail: "low" }],
        },
      ];

      expect(() => model.transformMessages(messages)).toThrow(InvalidMessagesError);
      try {
        model.transformMessages(messages);
      } catch (e: any) {
        expect(e).toBeInstanceOf(InvalidMessagesError);
        expect(e.info).toContain("Invalid message 'role' and 'modality' combination");
        expect(e.cause?.message).toContain(`role : '${SystemRoleLiteral}' cannot have content with modality : '${ImageModalityLiteral}'`);
      }
    });

    it("should throw InvalidMessagesError for Assistant role with non-text/tool_call modality", () => {
      const messages: MessageType[] = [
        {
          role: AssistantRoleLiteral,
          content: [{ modality: ImageModalityLiteral, value: { type: "url", url: "image.png" }, detail: "low" }],
        },
      ];

      expect(() => model.transformMessages(messages)).toThrow(InvalidMessagesError);
      try {
        model.transformMessages(messages);
      } catch (e: any) {
        expect(e).toBeInstanceOf(InvalidMessagesError);
        expect(e.info).toContain("Invalid message 'role' and 'modality' combination");
        expect(e.cause?.message).toContain(
          `role : '${AssistantRoleLiteral}' cannot have content with modality : '${ImageModalityLiteral}'`
        );
      }
    });

    it("should throw InvalidMessagesError for User role with non-text/image modality", () => {
      const messages: MessageType[] = [
        {
          role: UserRoleLiteral,
          content: [{ modality: ToolCallModalityLiteral, id: "t1", name: "f1", arguments: "{}" }] as any,
        },
      ];

      expect(() => model.transformMessages(messages)).toThrow(InvalidMessagesError);
      try {
        model.transformMessages(messages);
      } catch (e: any) {
        expect(e).toBeInstanceOf(InvalidMessagesError);
        expect(e.info).toContain("Invalid messages");
        expect(JSON.parse(e.cause?.message)).toEqual([
          {
            code: "invalid_type",
            expected: "number",
            received: "undefined",
            path: ["content", 0, "index"],
            message: "Required",
          },
        ]);
      }
    });

    it("should throw InvalidMessagesError for Tool role with non-tool_response modality", () => {
      const messages: MessageType[] = [
        {
          role: ToolRoleLiteral,
          content: [{ modality: TextModalityLiteral, value: "some text instead of response" }],
        },
      ];
      expect(() => model.transformMessages(messages)).toThrow(InvalidMessagesError);
      try {
        model.transformMessages(messages);
      } catch (e: any) {
        expect(e).toBeInstanceOf(InvalidMessagesError);
        expect(e.info).toContain("Invalid message 'role' and 'modality' combination");
        expect(e.cause?.message).toContain("role : 'tool' cannot have content with modality : 'text'");
      }
    });

    it("should throw InvalidMessagesError for Tool role with zero content items", () => {
      const messages: MessageType[] = [
        {
          role: ToolRoleLiteral,
          content: [],
        },
      ];

      expect(() => model.transformMessages(messages)).toThrow(InvalidMessagesError);
      try {
        model.transformMessages(messages);
      } catch (e: any) {
        expect(e).toBeInstanceOf(InvalidMessagesError);
        expect(e.info).toContain("Invalid message 'role' for model : test-model");
        expect(e.cause?.message).toContain("model : 'test-model' requires first message to be from user");
      }
    });

    it("should throw InvalidMessagesError for Tool role with multiple content items", () => {
      const messages: MessageType[] = [
        {
          role: ToolRoleLiteral,
          content: [
            { modality: ToolResponseModalityLiteral, id: "t1", data: "Result 1" } as any,
            { modality: ToolResponseModalityLiteral, id: "t2", data: "Result 2" } as any,
          ],
        },
      ];

      expect(() => model.transformMessages(messages)).toThrow(InvalidMessagesError);
      try {
        model.transformMessages(messages);
      } catch (e: any) {
        expect(e).toBeInstanceOf(InvalidMessagesError);
        expect(e.info).toContain(`Invalid messages`);
        expect(JSON.parse(e.cause?.message)).toEqual([
          {
            code: "invalid_type",
            expected: "number",
            received: "undefined",
            path: ["content", 0, "index"],
            message: "Required",
          },
          {
            code: "invalid_type",
            expected: "string",
            received: "undefined",
            path: ["content", 0, "name"],
            message: "Required",
          },
          {
            code: "invalid_type",
            expected: "number",
            received: "undefined",
            path: ["content", 1, "index"],
            message: "Required",
          },
          {
            code: "invalid_type",
            expected: "string",
            received: "undefined",
            path: ["content", 1, "name"],
            message: "Required",
          },
        ]);
      }
    });

    // --- Happy Path Transformations ---

    it("should correctly transform a simple User message with text", () => {
      const messages: MessageType[] = [
        {
          role: UserRoleLiteral,
          content: [{ modality: TextModalityLiteral, value: "Hello there!" }],
        },
      ];

      const expected: AnthropicRequestType = {
        messages: [
          {
            role: "user", // "user role"
            content: [{ type: "text", text: "Hello there!" }],
          },
        ],
        system: "",
      };
      expect(model.transformMessages(messages)).toEqual(expected);
    });

    it("should error  with image URL", () => {
      const messages: MessageType[] = [
        {
          role: UserRoleLiteral,
          content: [{ modality: ImageModalityLiteral, value: { type: "url", url: "http://example.com/image.jpg" }, detail: "high" }],
        },
      ];

      const expected: AnthropicRequestType = {
        messages: [
          {
            role: "user", // "user role"
            content: [{ type: "image_url", image_url: { url: "http://example.com/image.jpg", detail: "high" } }] as any,
          },
        ],
      };
      try {
        model.transformMessages(messages);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidMessagesError);
      }
    });

    it("should correctly transform a User message with image Base64", () => {
      const messages: MessageType[] = [
        {
          role: UserRoleLiteral,
          content: [
            {
              modality: ImageModalityLiteral,
              value: { type: "base64", base64: "data:image/png;base64,iVBORw0KG...", mediaType: "png" },
              detail: "low",
            },
          ],
        },
      ];

      const expected: AnthropicRequestType = {
        messages: [
          {
            role: "user", // "user role"
            content: [
              {
                source: {
                  data: "iVBORw0KG...",
                  media_type: "image/png",
                  type: "base64",
                },
                type: "image",
              },
            ],
          },
        ],
        system: "",
      };
      expect(model.transformMessages(messages)).toEqual(expected);
    });

    it("should correctly transform a User message with mixed text and image content", () => {
      const messages: MessageType[] = [
        {
          role: UserRoleLiteral,
          content: [
            { modality: TextModalityLiteral, value: "Look at this:" },
            {
              modality: ImageModalityLiteral,
              value: { type: "base64", base64: "data:image/png;base64,iVBORw0KG...", mediaType: "png" },
              detail: "low",
            },
            { modality: TextModalityLiteral, value: "What do you see?" },
          ],
        },
      ];

      const result = model.transformMessages(messages);
      expect((result as any).messages[0].role).toEqual("user");
      expect((result as any).messages[0].content).toEqual(
        expect.arrayContaining([
          { type: "text", text: "Look at this:" },
          {
            source: {
              data: "iVBORw0KG...",
              media_type: "image/png",
              type: "base64",
            },
            type: "image",
          },
          { type: "text", text: "What do you see?" },
        ])
      );
      expect((result as any).messages[0].content.length).toBe(3);
    });

    it("should erro  out as alternate message should between user and assistant", () => {
      const messages: MessageType[] = [
        { role: SystemRoleLiteral, content: [{ modality: TextModalityLiteral, value: "System prompt." }] },
        { role: UserRoleLiteral, content: [{ modality: TextModalityLiteral, value: "User query?" }] },
        {
          role: AssistantRoleLiteral,
          content: [
            { modality: TextModalityLiteral, value: "Assistant response." },
            { modality: ToolCallModalityLiteral, id: "t1", name: "func", arguments: "{}", index: 1 },
          ],
        },
        { role: ToolRoleLiteral, content: [{ modality: ToolResponseModalityLiteral, id: "t1", data: "result", index: 1, name: "a" }] },
      ];
      try {
        model.transformMessages(messages);
      } catch (error) {
        expect(error).toBeInstanceOf(InvalidMessagesError);
      }
    });
  });

  const anthropicData = (payload: object): string => `data: ${JSON.stringify(payload)}\n`;

  describe("transformStreamChatResponseChunk (Anthropic)", () => {
    let model: BaseChatModel;

    beforeEach(() => {
      model = new BaseChatModel(mockModelSchema, mockOptions);
    });

    // --- Happy Paths ---

    it("should process a message_start chunk (first chunk, contains usage)", async () => {
      const payload = {
        type: "message_start",
        message: {
          id: "msg_123",
          type: "message",
          role: "assistant",
          content: [], // Content blocks usually start empty here
          model: "claude-3-opus-20240229",
          stop_reason: null,
          stop_sequence: null,
          usage: { input_tokens: 15, output_tokens: 0 }, // Initial usage
        },
      };
      const chunk = anthropicData(payload);
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      expect(results).toHaveLength(1); // Yields once for message_start
      expect(results[0].buffer).toBe(""); // Line processed, buffer empty
      // message_start primarily provides initial usage and context
      expect(results[0].partialResponse.partialMessages).toEqual([]);
      expect(results[0].partialResponse.usage).toEqual({
        promptTokens: 15,
        completionTokens: 0,
        totalTokens: 15, // Calculated in the transform function
      });
    });

    it("should process a content_block_start chunk (text)", async () => {
      // Assumes message_start happened previously
      const payload = {
        type: "content_block_start",
        index: 0,
        content_block: { type: "text", text: "" }, // Often starts empty
      };
      const chunk = anthropicData(payload);
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      expect(results).toHaveLength(1);
      expect(results[0].buffer).toBe("");
      // A content_block_start for text might yield an empty initial text message
      // depending on createPartialTextMessage implementation, or potentially []
      // Adjust based on how createPartialTextMessage handles empty initial text.
      // Assuming it creates a message:
      expect(results[0].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, "")]);
      expect(results[0].partialResponse.usage).toBeUndefined(); // No usage in this event type
    });

    it("should process a content_block_delta chunk (text delta)", async () => {
      // Assumes message_start and content_block_start happened
      const payload = {
        type: "content_block_delta",
        index: 0,
        delta: { type: "text_delta", text: "Hello" },
      };
      const chunk = anthropicData(payload);
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      expect(results).toHaveLength(1);
      expect(results[0].buffer).toBe("");
      expect(results[0].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, "Hello")]);
      expect(results[0].partialResponse.usage).toBeUndefined();
    });

    it("should process a content_block_start chunk (tool_use)", async () => {
      const payload = {
        type: "content_block_start",
        index: 0,
        content_block: { type: "tool_use", id: "toolu_abc123", name: "get_current_weather", input: {} }, // Input often empty here
      };
      const chunk = anthropicData(payload);
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      expect(results).toHaveLength(1);
      expect(results[0].buffer).toBe("");
      expect(results[0].partialResponse.partialMessages).toEqual([
        // Creates the tool call structure
        createPartialToolCallMessage(AssistantRoleLiteral, 0, "toolu_abc123", "get_current_weather", ""),
      ]);
      expect(results[0].partialResponse.usage).toBeUndefined();
    });

    it("should process a content_block_delta chunk (tool arguments delta)", async () => {
      const payload = {
        type: "content_block_delta",
        index: 0, // Matches the tool_use index
        delta: { type: "input_json_delta", partial_json: '{"location":' },
      };
      const chunk = anthropicData(payload);
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      expect(results).toHaveLength(1);
      expect(results[0].buffer).toBe("");
      // Yields only the argument delta according to the code
      expect(results[0].partialResponse.partialMessages).toEqual([
        createPartialToolCallMessage(AssistantRoleLiteral, 0, "", "", '{"location":'), // Note empty id/name
      ]);
      expect(results[0].partialResponse.usage).toBeUndefined();
    });

    it("should process a message_delta chunk (usage update / stop reason)", async () => {
      const payload = {
        type: "message_delta",
        delta: { stop_reason: "tool_use", stop_sequence: null },
        usage: { output_tokens: 55 }, // Cumulative output tokens for the message so far
      };
      const chunk = anthropicData(payload);
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      expect(results).toHaveLength(1);
      expect(results[0].buffer).toBe("");
      expect(results[0].partialResponse.partialMessages).toEqual([]); // No content in message_delta
      expect(results[0].partialResponse.usage).toEqual({
        promptTokens: undefined, // Not present in message_delta
        completionTokens: 55,
        totalTokens: 55, // Calculated in transform
      });
      // Note: The transform function currently doesn't extract stop_reason/stop_sequence
      // into the yielded partialResponse. If it did, you'd add an assertion here.
      // expect(results[0].partialResponse.stopReason).toBe("tool_use");
    });

    it("should process multiple complete lines (text deltas) in a single chunk", async () => {
      const payload1 = { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "Part 1." } };
      const payload2 = { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: " Part 2." } };
      const chunk = anthropicData(payload1) + anthropicData(payload2);
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      expect(results).toHaveLength(2); // Yields per processed line

      // First yield (from payload1)
      expect(results[0].buffer).toBe(""); // Buffer state after processing the *first* complete line
      expect(results[0].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, "Part 1.")]);
      expect(results[0].partialResponse.usage).toBeUndefined();

      // Second yield (from payload2)
      expect(results[1].buffer).toBe(""); // Buffer state after processing the *second* complete line
      expect(results[1].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, " Part 2.")]);
      expect(results[1].partialResponse.usage).toBeUndefined();
    });

    it("should terminate processing when 'message_stop' is received", async () => {
      const payload1 = { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "Final bit." } };
      const payload2 = {
        type: "message_stop",
        "amazon-bedrock-invocationMetrics": {
          /* ... some metrics ... */
        },
      }; // Example stop
      const payload3 = { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "Should be ignored." } }; // After stop

      const chunk = anthropicData(payload1) + anthropicData(payload2) + anthropicData(payload3);
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      // Only yields for the line before message_stop
      expect(results).toHaveLength(1);
      expect(results[0].buffer).toBe(""); // Buffer is empty because message_stop caused loop termination after processing previous line
      expect(results[0].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, "Final bit.")]);
      expect(results[0].partialResponse.usage).toBeUndefined();
    });

    it("should handle empty text delta objects", async () => {
      const payload = { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "" } };
      const chunk = anthropicData(payload);
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      expect(results).toHaveLength(1);
      expect(results[0].buffer).toBe("");
      expect(results[0].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, "")]); // Yields message with empty text
      expect(results[0].partialResponse.usage).toBeUndefined();
    });

    // --- Buffering Scenarios ---

    it("should handle an empty chunk", async () => {
      const chunk = "";
      const buffer = "previous incomplete data";
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, buffer));

      // Yields nothing as no lines were completed/processed
      expect(results).toHaveLength(0);
      // Note: The generator doesn't yield the final buffer state explicitly.
      // If testing the *consumer* of this generator, you'd check the final buffer there.
    });

    it("should handle a chunk with only whitespace/newlines", async () => {
      const chunk = "\n \n";
      const bufferedPayload = { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "Buffered." } };
      const buffer = anthropicData(bufferedPayload); // Buffer contains a *complete* line ending with \n
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, buffer));

      // Should process the buffered line, then process the newlines (which are ignored), yielding once.
      expect(results).toHaveLength(1);
      expect(results[0].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, "Buffered.")]);
    });

    it("should buffer an incomplete chunk (start of line)", async () => {
      const chunk = 'data: {"type": "content_b'; // Incomplete Anthropic line
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      expect(results).toHaveLength(0); // No complete line processed, nothing yielded
      // The final buffer state would be 'data: {"type": "content_b' if checked externally
    });

    it("should buffer an incomplete chunk (middle of line)", async () => {
      const chunk = 'lock_delta", "index": 0';
      const buffer = 'data: {"type": "content_b';
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, buffer));

      expect(results).toHaveLength(0); // No complete line processed
      // The final buffer state would be 'data: {"type": "content_block_delta", "index": 0'
    });

    it("should process a complete line from buffer and new chunk", async () => {
      const buffer = 'data: {"type": "content_block_delta", "index": 0, "delta": '; // Incomplete
      const chunk = '{"type": "text_delta", "text": "Complete!"}}\n'; // Completes the JSON and adds newline
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, buffer));

      expect(results).toHaveLength(1);
      expect(results[0].buffer).toBe(`data: {"type": "content_block_delta", "index": 0, "delta": `); // Line was completed and processed
      expect(results[0].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, "Complete!")]);
    });

    it("should process complete line and buffer the rest", async () => {
      const payload1 = { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "First." } };
      const incompleteLine = 'data: {"type": "content_block_delta", "index": 0, "delta": {"type": "text_d';
      const chunk = anthropicData(payload1) + incompleteLine;
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      // Yields only for the first complete line
      expect(results).toHaveLength(1);

      // First (and only) yield corresponds to processing the first line
      expect(results[0].buffer).toBe(""); // Buffer reflects state *after* processing the complete line
      expect(results[0].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, "First.")]);

      // The final buffer state (containing `incompleteLine`) would need external tracking/checking
      // as the generator doesn't yield it after the loop if no more lines were fully processed.
    });

    it("should handle chunk ending exactly at newline", async () => {
      const payload = { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "Exact." } };
      const chunk = anthropicData(payload); // Includes trailing \n
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      expect(results).toHaveLength(1);
      expect(results[0].buffer).toBe(""); // Newline consumed, buffer empty
      expect(results[0].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, "Exact.")]);
    });

    it("should combine buffer and chunk correctly when buffer has partial data", async () => {
      const buffer = 'data: {"type": "content_b';
      const chunk = 'lock_delta", "index": 0, "delta": {"type": "text_delta", "text": "Joined!"}}\n';
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, buffer));

      expect(results).toHaveLength(1);
      expect(results[0].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, "Joined!")]);
    });

    // --- Error Handling ---

    it("should throw ModelResponseError for malformed JSON", async () => {
      const chunk = 'data: {"type": "message_start", "message": null\n'; // Invalid JSON (missing closing brace)
      const generator = model.transformStreamChatResponseChunk(chunk, "");

      // Check cause is SyntaxError
      try {
        await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));
      } catch (e: any) {
        expect(e.cause).toBeInstanceOf(SyntaxError);
      }
    });

    it("should throw ModelResponseError for invalid data structure (missing 'type')", async () => {
      // Valid JSON, but doesn't match expected Anthropic structure
      const chunk = 'data: {"index": 0, "delta": {"text": "Hello"}}\n';
      const generator = model.transformStreamChatResponseChunk(chunk, "");

      await expect(collectAsyncGenerator(generator)).rejects.toThrow(ModelResponseError);
      // Check cause is Error with specific message
      try {
        await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));
      } catch (e: any) {
        expect(e.cause).toBeInstanceOf(Error);
        expect(e.cause?.message).toContain("expected 'type' property");
      }
    });

    it("should throw ModelResponseError for invalid data structure (Zod schema fail)", async () => {
      // Valid JSON, has 'type', but inner structure is wrong for 'content_block_delta'
      const chunk = anthropicData({ type: "content_block_delta", index: "wrong_type", delta: { foo: "bar" } });
      const generator = model.transformStreamChatResponseChunk(chunk, "");

      await expect(collectAsyncGenerator(generator)).rejects.toThrow(ModelResponseError);
      // Zod errors are nested within the cause
      try {
        await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));
      } catch (e: any) {
        expect(e.cause).toBeDefined(); // Should be the ZodError instance
        expect(e.cause?.errors).toBeInstanceOf(Array); // ZodError has an 'errors' property
      }
    });

    it("should ignore lines not starting with 'data: ' after trimming", async () => {
      const validPayload = { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "Valid" } };
      const chunk =
        "event: message\n" + // Ignored line
        anthropicData(validPayload) + // Valid line
        "ignore this line\n" + // Ignored line
        ":heartbeat\n"; // Ignored line (SSE comment)
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      // Only yields for the valid 'data:' line
      expect(results).toHaveLength(1);
      expect(results[0].buffer).toBe(""); // Valid line processed, ignored lines don't affect buffer here
      expect(results[0].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, "Valid")]);
    });

    // --- message_stop Specifics ---

    it("should handle message_stop correctly even with preceding valid data", async () => {
      const payload1 = { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "Final bit." } };
      const payload2 = {
        type: "message_stop",
        "amazon-bedrock-invocationMetrics": {
          /*...*/
        },
      };
      const chunk = anthropicData(payload1) + anthropicData(payload2);
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      expect(results).toHaveLength(1); // Yields for the data before message_stop
      expect(results[0].buffer).toBe(""); // Buffer empty as message_stop terminated processing
      expect(results[0].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, "Final bit.")]);
    });

    it("should yield nothing if chunk only contains message_stop", async () => {
      const stopPayload = {
        type: "message_stop",
        "amazon-bedrock-invocationMetrics": {
          /*...*/
        },
      };
      const doneChunk = anthropicData(stopPayload);
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(doneChunk, ""));
      expect(results).toHaveLength(0); // Generator returns immediately on message_stop, yields nothing.
    });

    it("should yield nothing if chunk has data *after* message_stop", async () => {
      const stopPayload = {
        type: "message_stop",
        "amazon-bedrock-invocationMetrics": {
          /*...*/
        },
      };
      const ignoredPayload = { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "ignored" } };
      const chunkWithStopFirst = anthropicData(stopPayload) + anthropicData(ignoredPayload);
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunkWithStopFirst, ""));
      expect(results).toHaveLength(0); // Returns on message_stop, ignores subsequent lines in the same chunk processing loop.
    });
  });

  describe("transformTools", () => {
    let modelWithTools: BaseChatModel;
    let modelWithoutTools: BaseChatModel;

    const validTool1: ToolType = {
      type: "function",
      definition: {
        schema: {
          name: "get_weather_from_location",
          description: "Get the current weather of a location",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "location to get weather of",
              },
            },
            required: ["location"],
          },
        },
      },
    };

    const validTool2: ToolType = {
      type: "function",
      definition: {
        schema: {
          name: "get_stock_price",
          description: "Get the current stock price of a company",
          parameters: {
            type: "object",
            properties: {
              location: {
                type: "string",
                description: "company name to get stock price of",
              },
            },
            required: ["company"],
          },
        },
      },
    };

    const invalidToolMissingName = {
      // name: "missing",
      description: "This tool is invalid because it lacks a name",
      definition: {
        schema: { type: "object", properties: { p1: { type: "string" } } },
      },
    };

    const invalidToolMissingSchema = {
      name: "no_schema_tool",
      description: "This tool is invalid because it lacks a definition schema",
      definition: {
        // schema: { ... } // Missing schema
      },
    };

    beforeEach(() => {
      // Model that supports tools (assuming mockModalities includes 'tool-call')
      modelWithTools = new BaseChatModel(mockModelSchema, mockOptions);

      // Model that *does not* support tools
      const schemaWithoutTools = { ...mockModelSchema, modalities: [TextModalityLiteral] as const }; // Only text
      modelWithoutTools = new BaseChatModel(schemaWithoutTools as any, mockOptions); // Cast as any if type complains
    });

    it("should return empty array if input tools array is null or undefined", () => {
      expect(modelWithTools.transformTools(null as any)).toEqual({ tools: [] }); // Check null
      expect(modelWithTools.transformTools(undefined as any)).toEqual({ tools: [] }); // Check undefined
    });

    it("should return empty array if input tools array is empty", () => {
      expect(modelWithTools.transformTools([])).toEqual({ tools: [] });
    });

    it("should transform a single valid tool correctly", () => {
      const expected = {
        tools: [
          {
            description: "Get the current weather of a location",
            input_schema: {
              properties: {
                location: {
                  description: "location to get weather of",
                  type: "string",
                },
              },
              required: ["location"],
              type: "object",
            },
            name: "get_weather_from_location",
          },
        ],
      };
      expect(modelWithTools.transformTools([validTool1])).toEqual(expected);
    });

    it("should transform multiple valid tools correctly", () => {
      const expected = {
        tools: [
          {
            description: "Get the current weather of a location",
            input_schema: {
              properties: {
                location: {
                  description: "location to get weather of",
                  type: "string",
                },
              },
              required: ["location"],
              type: "object",
            },
            name: "get_weather_from_location",
          },
          {
            description: "Get the current stock price of a company",
            input_schema: {
              properties: {
                location: {
                  description: "company name to get stock price of",
                  type: "string",
                },
              },
              required: ["company"],
              type: "object",
            },
            name: "get_stock_price",
          },
        ],
      };

      expect(modelWithTools.transformTools([validTool1, validTool2])).toEqual(expected);
    });

    it("should throw InvalidToolsError if the model does not support the tool-call modality", () => {
      expect(() => modelWithoutTools.transformTools([validTool1])).toThrow(InvalidToolsError);
      expect(() => modelWithoutTools.transformTools([validTool1])).toThrow(
        // Match specific part of the error message
        /does not support tool modality : 'tool-call'/
      );
      try {
        modelWithoutTools.transformTools([validTool1]);
      } catch (e: any) {
        expect(e).toBeInstanceOf(InvalidToolsError);
        expect(e.info).toContain(`Invalid tool 'modality' for model`);
        expect(e.cause).toBeInstanceOf(Error);
        if (e.cause instanceof Error) {
          expect(e.cause.message).toContain("does not support tool modality : 'tool-call'");
        }
      }
    });

    it("should throw InvalidToolsError if a tool in the array fails validation (e.g., missing name)", () => {
      // We need to cast because TS might catch the missing property type error
      const tools = [validTool1, invalidToolMissingName as any as ToolType];
      expect(() => modelWithTools.transformTools(tools)).toThrow(InvalidToolsError);
      expect(() => modelWithTools.transformTools(tools)).toThrow(/Invalid tools/);

      try {
        modelWithTools.transformTools(tools);
      } catch (e: any) {
        expect(e).toBeInstanceOf(InvalidToolsError);
        expect(e.info).toBe("Invalid tools");
        expect(e.cause).toBeInstanceOf(z.ZodError); // Should be a Zod validation error
        if (e.cause instanceof z.ZodError) {
          // Check if the Zod error mentions the missing field ('name' in this case)
          expect(e.cause.errors.some((err: any) => err.path.includes("name"))).toBe(false);
        }
      }
    });

    it("should throw InvalidToolsError if a tool in the array fails validation (e.g., missing definition.schema)", () => {
      const tools = [invalidToolMissingSchema as any as ToolType];
      expect(() => modelWithTools.transformTools(tools)).toThrow(InvalidToolsError);
      expect(() => modelWithTools.transformTools(tools)).toThrow(/Invalid tools/);

      try {
        modelWithTools.transformTools(tools);
      } catch (e: any) {
        expect(e).toBeInstanceOf(InvalidToolsError);
        expect(e.info).toBe("Invalid tools");
        expect(e.cause).toBeInstanceOf(z.ZodError);
        if (e.cause instanceof z.ZodError) {
          // Check if the Zod error mentions the missing field ('schema' within 'definition')
          expect(e.cause.errors.some((err: any) => err.path.includes("definition") && err.path.includes("schema"))).toBe(false);
        }
      }
    });
  });

  describe("transformCompleteChatResponse (Anthropic)", () => {
    let model: BaseChatModel;

    beforeEach(() => {
      model = new BaseChatModel(mockModelSchema, mockOptions);
    });

    // --- Helper to create a basic valid Anthropic response ---
    const createMockAnthropicResponse = (content: any[], usage = { input_tokens: 10, output_tokens: 20 }): any => ({
      id: "msg_12345",
      type: "message",
      role: "assistant",
      content: content,
      model: "claude-3-opus-20240229",
      stop_reason: "end_turn",
      stop_sequence: null,
      usage: usage,
    });

    // --- Happy Paths ---

    it("should transform a response with only text content", () => {
      const mockResponse = createMockAnthropicResponse([{ type: "text", text: "Hello there!" }]);
      const expectedContent: ContentType[] = [createTextContent("Hello there!")];
      const expectedMessages: MessageType[] = [{ role: AssistantRoleLiteral, content: expectedContent }];
      const expectedUsage: ChatUsageType = { promptTokens: 10, completionTokens: 20, totalTokens: 30 };

      const result = model.transformCompleteChatResponse(mockResponse);

      expect(result).toEqual<ChatResponseType>({
        messages: expectedMessages,
        usage: expectedUsage,
        logProbs: [],
      });
    });

    it("should transform a response with only tool_use content", () => {
      const toolInput = { location: "Boston", unit: "celsius" };
      const mockResponse = createMockAnthropicResponse([{ type: "tool_use", id: "toolu_abc", name: "get_weather", input: toolInput }]);
      const expectedContent: ContentType[] = [createToolCallContent(0, "toolu_abc", "get_weather", JSON.stringify(toolInput))];
      const expectedMessages: MessageType[] = [{ role: AssistantRoleLiteral, content: expectedContent }];
      const expectedUsage: ChatUsageType = { promptTokens: 10, completionTokens: 20, totalTokens: 30 };

      const result = model.transformCompleteChatResponse(mockResponse);

      expect(result).toEqual<ChatResponseType>({
        messages: expectedMessages,
        usage: expectedUsage,
        logProbs: [],
      });
    });

    it("should transform a response with mixed text and tool_use content", () => {
      const toolInput = { query: "latest news" };
      const mockResponse = createMockAnthropicResponse([
        { type: "text", text: "Okay, I can help with that. Using the search tool." },
        { type: "tool_use", id: "toolu_xyz", name: "search_web", input: toolInput },
        { type: "text", text: "Please wait while I process the search." },
      ]);

      const expectedContent: ContentType[] = [
        createTextContent("Okay, I can help with that. Using the search tool."),
        createToolCallContent(1, "toolu_xyz", "search_web", JSON.stringify(toolInput)), // Index is 1
        createTextContent("Please wait while I process the search."),
      ];
      const expectedMessages: MessageType[] = [{ role: AssistantRoleLiteral, content: expectedContent }];
      const expectedUsage: ChatUsageType = { promptTokens: 10, completionTokens: 20, totalTokens: 30 };

      const result = model.transformCompleteChatResponse(mockResponse);

      expect(result).toEqual<ChatResponseType>({
        messages: expectedMessages,
        usage: expectedUsage,
        logProbs: [],
      });
      // Check specific indices if needed
      expect((result.messages[0].content[1] as any).index).toBe(1);
    });

    it("should transform a response with multiple tool_use calls", () => {
      const toolInput1 = { location: "Paris" };
      const toolInput2 = { ticker: "GOOGL" };
      const mockResponse = createMockAnthropicResponse([
        { type: "tool_use", id: "toolu_111", name: "get_weather", input: toolInput1 },
        { type: "tool_use", id: "toolu_222", name: "get_stock_price", input: toolInput2 },
      ]);

      const expectedContent: ContentType[] = [
        createToolCallContent(0, "toolu_111", "get_weather", JSON.stringify(toolInput1)),
        createToolCallContent(1, "toolu_222", "get_stock_price", JSON.stringify(toolInput2)),
      ];
      const expectedMessages: MessageType[] = [{ role: AssistantRoleLiteral, content: expectedContent }];
      const expectedUsage: ChatUsageType = { promptTokens: 10, completionTokens: 20, totalTokens: 30 };

      const result = model.transformCompleteChatResponse(mockResponse);

      expect(result).toEqual<ChatResponseType>({
        messages: expectedMessages,
        usage: expectedUsage,
        logProbs: [],
      });
    });

    it("should handle complex nested input for tool_use correctly (JSON stringified)", () => {
      const complexInput = {
        user: "John Doe",
        details: { address: "123 Main St", preferences: ["a", "b"] },
        active: true,
      };
      const mockResponse = createMockAnthropicResponse([
        { type: "tool_use", id: "toolu_cmplx", name: "update_user_profile", input: complexInput },
      ]);
      const expectedContent: ContentType[] = [createToolCallContent(0, "toolu_cmplx", "update_user_profile", JSON.stringify(complexInput))];
      const expectedMessages: MessageType[] = [{ role: AssistantRoleLiteral, content: expectedContent }];
      const expectedUsage: ChatUsageType = { promptTokens: 10, completionTokens: 20, totalTokens: 30 };

      const result = model.transformCompleteChatResponse(mockResponse);

      expect(result).toEqual<ChatResponseType>({
        messages: expectedMessages,
        usage: expectedUsage,
        logProbs: [],
      });
      // Verify the arguments part is undefined string
      expect(typeof (result.messages[0].content[0] as any).args).toBe("undefined");
    });

    it("should correctly calculate usage tokens", () => {
      const usageData = { input_tokens: 55, output_tokens: 123 };
      const mockResponse = createMockAnthropicResponse([{ type: "text", text: "Check usage." }], usageData);
      const expectedUsage: ChatUsageType = { promptTokens: 55, completionTokens: 123, totalTokens: 178 };

      const result = model.transformCompleteChatResponse(mockResponse);

      expect(result.usage).toEqual(expectedUsage);
    });

    it("should handle optional cache usage tokens if present (but doesn't use them)", () => {
      const usageData = {
        input_tokens: 10,
        output_tokens: 20,
        cache_creation_input_tokens: 5, // Optional field
        cache_read_input_tokens: 2, // Optional field
      };
      const mockResponse = createMockAnthropicResponse([{ type: "text", text: "Cache test." }], usageData);
      const expectedUsage: ChatUsageType = { promptTokens: 10, completionTokens: 20, totalTokens: 30 };

      const result = model.transformCompleteChatResponse(mockResponse);

      // Only standard tokens are mapped
      expect(result.usage).toEqual(expectedUsage);
    });

    // --- Error Handling ---

    it("should throw ModelResponseError for non-object input", () => {
      const invalidInput = "not an object";
      expect(() => model.transformCompleteChatResponse(invalidInput)).toThrow(ModelResponseError);
      expect(() => model.transformCompleteChatResponse(invalidInput)).toThrow(/Invalid response from model/);
      try {
        model.transformCompleteChatResponse(invalidInput);
      } catch (e: any) {
        expect(e.cause).toBeInstanceOf(ZodError);
      }
    });

    it("should throw ModelResponseError for missing required top-level fields (e.g., content)", () => {
      const invalidResponse = createMockAnthropicResponse([{ type: "text", text: "Test" }]);
      delete invalidResponse.content; // Remove required field

      expect(() => model.transformCompleteChatResponse(invalidResponse)).toThrow(ModelResponseError);
      expect(() => model.transformCompleteChatResponse(invalidResponse)).toThrow(/Invalid response from model/);
      try {
        model.transformCompleteChatResponse(invalidResponse);
      } catch (e: any) {
        expect(e.cause).toBeInstanceOf(ZodError);
        expect(e.cause.errors[0].message).toContain("Required");
        expect(e.cause.errors[0].path).toContain("content");
      }
    });

    it("should throw ModelResponseError for missing required usage fields (e.g., input_tokens)", () => {
      const invalidResponse = createMockAnthropicResponse([{ type: "text", text: "Test" }]);
      delete invalidResponse.usage.input_tokens; // Remove required field

      expect(() => model.transformCompleteChatResponse(invalidResponse)).toThrow(ModelResponseError);
      expect(() => model.transformCompleteChatResponse(invalidResponse)).toThrow(/Invalid response from model/);
      try {
        model.transformCompleteChatResponse(invalidResponse);
      } catch (e: any) {
        expect(e.cause).toBeInstanceOf(ZodError);
        expect(e.cause.errors[0].path).toEqual(["usage", "input_tokens"]);
      }
    });

    it("should throw ModelResponseError for incorrect field types (e.g., usage.output_tokens as string)", () => {
      const invalidResponse = createMockAnthropicResponse([{ type: "text", text: "Test" }]);
      invalidResponse.usage.output_tokens = "not a number"; // Set wrong type

      expect(() => model.transformCompleteChatResponse(invalidResponse)).toThrow(ModelResponseError);
      expect(() => model.transformCompleteChatResponse(invalidResponse)).toThrow(/Invalid response from model/);
      try {
        model.transformCompleteChatResponse(invalidResponse);
      } catch (e: any) {
        expect(e.cause).toBeInstanceOf(ZodError);
        expect(e.cause.errors[0].path).toEqual(["usage", "output_tokens"]);
        expect(e.cause.errors[0].message).toContain("Expected number, received string");
      }
    });

    it("should throw ModelResponseError for invalid content item type", () => {
      const invalidResponse = createMockAnthropicResponse([{ type: "invalid_type", text: "Test" }]);

      expect(() => model.transformCompleteChatResponse(invalidResponse)).toThrow(ModelResponseError);
      expect(() => model.transformCompleteChatResponse(invalidResponse)).toThrow(/Invalid response from model/);
      try {
        model.transformCompleteChatResponse(invalidResponse);
      } catch (e: any) {
        expect(e.cause).toBeInstanceOf(ZodError);
        // Zod error message might mention discriminated union failure
        expect(e.cause.errors[0].message).toMatch(/Invalid discriminator value|Invalid literal value/);
        expect(e.cause.errors[0].path).toEqual(["content", 0, "type"]);
      }
    });

    it("should throw ModelResponseError for missing fields within a content item (e.g., missing 'text' in text block)", () => {
      const invalidResponse = createMockAnthropicResponse([{ type: "text" /* missing text field */ }]);

      expect(() => model.transformCompleteChatResponse(invalidResponse)).toThrow(ModelResponseError);
      expect(() => model.transformCompleteChatResponse(invalidResponse)).toThrow(/Invalid response from model/);
      try {
        model.transformCompleteChatResponse(invalidResponse);
      } catch (e: any) {
        expect(e.cause).toBeInstanceOf(ZodError);
        expect(e.cause.errors[0].path).toEqual(["content", 0, "text"]);
        expect(e.cause.errors[0].message).toContain("Required");
      }
    });

    it("should throw ModelResponseError for missing fields within a tool_use item (e.g., missing 'name')", () => {
      const invalidResponse = createMockAnthropicResponse([{ type: "tool_use", id: "toolu_123", input: {} }]); // Missing name

      expect(() => model.transformCompleteChatResponse(invalidResponse)).toThrow(ModelResponseError);
      expect(() => model.transformCompleteChatResponse(invalidResponse)).toThrow(/Invalid response from model/);
      try {
        model.transformCompleteChatResponse(invalidResponse);
      } catch (e: any) {
        expect(e.cause).toBeInstanceOf(ZodError);
        expect(e.cause.errors[0].path).toEqual(["content", 0, "name"]);
        expect(e.cause.errors[0].message).toContain("Required");
      }
    });
  });
});
