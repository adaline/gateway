import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";

import { ChatModelSchema, ChatModelSchemaType, InvalidMessagesError, ModelResponseError } from "@adaline/provider";
import {
  AssistantRoleLiteral,
  Config,
  createPartialTextMessage,
  createPartialToolCallMessage,
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

import { OpenAIChatModelConfigs } from "../../../src/configs";
import { BaseChatModel } from "../../../src/models";
import { OpenAIChatRequestType } from "../../../src/models/chat-models/types";

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
    maxInputTokens: 128000,
    maxOutputTokens: 128000,
    roles: mockRolesMap,
    modalities: mockModalities,
    config: {
      def: OpenAIChatModelConfigs.base(128000, 4).def,
      schema: OpenAIChatModelConfigs.base(128000, 4).schema,
    },
  });

  const mockOptions = {
    apiKey: "test-api-key",
    baseUrl: "https://api.openai.com/v1",
    modelName: "test-model",
  };

  describe("constructor", () => {
    it("should initialize properties correctly", () => {
      const baseChatModel = new BaseChatModel(mockModelSchema, mockOptions);
      expect(baseChatModel.modelSchema).toBe(mockModelSchema);
      expect(baseChatModel.getDefaultBaseUrl()).toBe("https://api.openai.com/v1");
    });
  });

  describe("getDefaultBaseUrl", () => {
    it("should return the baseUrl without trailing slash", () => {
      const model = new BaseChatModel(mockModelSchema, mockOptions);
      expect(model.getDefaultBaseUrl()).toBe("https://api.openai.com/v1");
    });

    it("should return the baseUrl without trailing slash when provided with one", () => {
      const modelWithTrailingSlash = new BaseChatModel(mockModelSchema, {
        ...mockOptions,
        baseUrl: "https://api.openai.com/v1/",
      });
      expect(modelWithTrailingSlash.getDefaultBaseUrl()).toBe("https://api.openai.com/v1");
    });

    it("should return a custom baseUrl if provided", () => {
      const modelWithUrlPath = new BaseChatModel(mockModelSchema, {
        ...mockOptions,
        baseUrl: "https://api.example.com/openai/v1",
      });
      expect(modelWithUrlPath.getDefaultBaseUrl()).toBe("https://api.example.com/openai/v1");
    });
  });

  describe("getDefaultHeaders", () => {
    it("should return the default headers with API key", () => {
      const model = new BaseChatModel(mockModelSchema, mockOptions);
      expect(model.getDefaultHeaders()).toEqual({
        Authorization: "Bearer test-api-key",
        "Content-Type": "application/json",
      });
    });

    it("should return the default headers with organization", () => {
      const model = new BaseChatModel(mockModelSchema, {
        ...mockOptions,
        organization: "test-organization",
      });
      expect(model.getDefaultHeaders()).toEqual({
        Authorization: "Bearer test-api-key",
        "Content-Type": "application/json",
        "OpenAI-Organization": "test-organization",
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
        frequencyPenalty: 0.5,
        presencePenalty: 0.5,
        seed: 1,
        logProbs: true,
        topLogProbs: 0,
      });
      expect(model.transformConfig(config, messages, tools)).toEqual({
        max_completion_tokens: 2000,
        temperature: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
        top_p: 1,
        stop: ["test"],
        seed: 1,
        logprobs: true,
        top_logprobs: 0,
      });
    });

    // Seed tests
    it("should throw an error when seed is less than 0", () => {
      const config = Config().parse({
        temperature: 1,
        maxTokens: 2000,
        stop: ["test"],
        topP: 1,
        frequencyPenalty: 0.5,
        presencePenalty: 0.5,
        seed: -1, // invalid seed: below 0
        logProbs: true,
        topLogProbs: 0,
      });
      expect(() => model.transformConfig(config, messages, tools)).toThrowError();
    });

    it("should throw an error when seed is greater than 1000000", () => {
      const config = Config().parse({
        temperature: 1,
        maxTokens: 2000,
        stop: ["test"],
        topP: 1,
        frequencyPenalty: 0.5,
        presencePenalty: 0.5,
        seed: 1000001, // invalid seed: above maximum
        logProbs: true,
        topLogProbs: 0,
      });
      expect(() => model.transformConfig(config, messages, tools)).toThrowError();
    });

    // LogProbs test: when false, should be interpreted as 0 (or false as per your mapping)
    it("should correctly transform logProbs false to 0", () => {
      const config = Config().parse({
        temperature: 1,
        maxTokens: 2000,
        stop: ["test"],
        topP: 1,
        frequencyPenalty: 0.5,
        presencePenalty: 0.5,
        seed: 1,
        logProbs: false,
        topLogProbs: 0,
      });
      const transformed = model.transformConfig(config, messages, tools);
      expect(transformed.logprobs).toEqual(false);
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

    // topLogProbs tests
    it("should throw an error when topLogProbs is below 0", () => {
      const config = Config().parse({
        temperature: 1,
        maxTokens: 2000,
        stop: ["test"],
        topP: 1,
        frequencyPenalty: 0.5,
        presencePenalty: 0.5,
        seed: 1,
        logProbs: true,
        topLogProbs: -1, // invalid
      });
      expect(() => model.transformConfig(config, messages, tools)).toThrowError();
    });

    it("should throw an error when topLogProbs is above 20", () => {
      const config = Config().parse({
        temperature: 1,
        maxTokens: 2000,
        stop: ["test"],
        topP: 1,
        frequencyPenalty: 0.5,
        presencePenalty: 0.5,
        seed: 1,
        logProbs: true,
        topLogProbs: 21, // invalid
      });
      expect(() => model.transformConfig(config, messages, tools)).toThrowError();
    });

    // presencePenalty tests
    it("should throw an error when presencePenalty is below -2", () => {
      const config = Config().parse({
        temperature: 1,
        maxTokens: 2000,
        stop: ["test"],
        topP: 1,
        frequencyPenalty: 0.5,
        presencePenalty: -2.01, // invalid: below -2
        seed: 1,
        logProbs: true,
        topLogProbs: 0,
      });
      expect(() => model.transformConfig(config, messages, tools)).toThrowError();
    });

    it("should throw an error when presencePenalty is above 2", () => {
      const config = Config().parse({
        temperature: 1,
        maxTokens: 2000,
        stop: ["test"],
        topP: 1,
        frequencyPenalty: 0.5,
        presencePenalty: 2.01, // invalid: above 2
        seed: 1,
        logProbs: true,
        topLogProbs: 0,
      });
      expect(() => model.transformConfig(config, messages, tools)).toThrowError();
    });

    // frequencyPenalty tests
    it("should throw an error when frequencyPenalty is below -2", () => {
      const config = Config().parse({
        temperature: 1,
        maxTokens: 2000,
        stop: ["test"],
        topP: 1,
        frequencyPenalty: -2.01, // invalid: below -2
        presencePenalty: 0.5,
        seed: 1,
        logProbs: true,
        topLogProbs: 0,
      });
      expect(() => model.transformConfig(config, messages, tools)).toThrowError();
    });

    it("should throw an error when frequencyPenalty is above 2", () => {
      const config = Config().parse({
        temperature: 1,
        maxTokens: 2000,
        stop: ["test"],
        topP: 1,
        frequencyPenalty: 2.01, // invalid: above 2
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
        max_completion_tokens: 1500,
        temperature: 0,
        frequency_penalty: -2,
        presence_penalty: 2,
        top_p: 0,
        stop: ["s1", "s2", "s3", "s4"],
        seed: undefined, // seed 0 should be transformed to undefined
        logprobs: true,
        top_logprobs: 20,
      });
    });

    it("should throw error if topLogProbs is defined", () => {
      expect(() => {
        const config = Config().parse({
          logProbs: false, // should be false in transformed config
          topLogProbs: 20, // upper boundary
        });
        model.transformConfig(config, messages, tools);
      }).toThrowError();
    });

    it("should throw error if tool is defined", () => {
      expect(() => {
        const config = Config().parse({
          toolChoice: "auto",
        });
        model.transformConfig(config, messages, tools);
      }).toThrowError();
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
        expect(e.cause?.message).toContain(
          `role : '${ToolRoleLiteral}' must have content with modality : '${ToolResponseModalityLiteral}'`
        );
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
        expect(e.info).toContain(`Invalid message for role : '${ToolRoleLiteral}'`);
        expect(e.cause?.message).toContain(`role : '${ToolRoleLiteral}' must have exactly one content item`);
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

    it("should correctly transform a simple System message", () => {
      const messages: MessageType[] = [
        {
          role: SystemRoleLiteral,
          content: [{ modality: TextModalityLiteral, value: "Be concise." }],
        },
      ];
      const expected: OpenAIChatRequestType = {
        messages: [
          {
            role: "system", // "system role"
            content: [{ type: "text", text: "Be concise." }],
          },
        ],
      };
      expect(model.transformMessages(messages)).toEqual(expected);
    });

    it("should correctly transform a simple User message with text", () => {
      const messages: MessageType[] = [
        {
          role: UserRoleLiteral,
          content: [{ modality: TextModalityLiteral, value: "Hello there!" }],
        },
      ];

      const expected: OpenAIChatRequestType = {
        messages: [
          {
            role: "user", // "user role"
            content: [{ type: "text", text: "Hello there!" }],
          },
        ],
      };
      expect(model.transformMessages(messages)).toEqual(expected);
    });

    it("should correctly transform a User message with image URL", () => {
      const messages: MessageType[] = [
        {
          role: UserRoleLiteral,
          content: [{ modality: ImageModalityLiteral, value: { type: "url", url: "http://example.com/image.jpg" }, detail: "high" }],
        },
      ];

      const expected: OpenAIChatRequestType = {
        messages: [
          {
            role: "user", // "user role"
            content: [{ type: "image_url", image_url: { url: "http://example.com/image.jpg", detail: "high" } }],
          },
        ],
      };
      expect(model.transformMessages(messages)).toEqual(expected);
    });

    it("should correctly transform a User message with image Base64", () => {
      const messages: MessageType[] = [
        {
          role: UserRoleLiteral,
          content: [
            {
              modality: ImageModalityLiteral,
              value: { type: "base64", base64: "data:image/png;base64,iVBORw0KG...", media_type: "png" },
              detail: "low",
            },
          ],
        },
      ];

      const expected: OpenAIChatRequestType = {
        messages: [
          {
            role: "user", // "user role"
            content: [{ type: "image_url", image_url: { url: "data:image/png;base64,iVBORw0KG...", detail: "low" } }],
          },
        ],
      };
      expect(model.transformMessages(messages)).toEqual(expected);
    });

    it("should correctly transform a User message with mixed text and image content", () => {
      const messages: MessageType[] = [
        {
          role: UserRoleLiteral,
          content: [
            { modality: TextModalityLiteral, value: "Look at this:" },
            { modality: ImageModalityLiteral, value: { type: "url", url: "http://example.com/image.jpg" }, detail: "auto" },
            { modality: TextModalityLiteral, value: "What do you see?" },
          ],
        },
      ];

      const expected: OpenAIChatRequestType = {
        messages: [
          {
            role: "user", // "user role"
            content: [
              { type: "text", text: "Look at this:" },
              { type: "text", text: "What do you see?" },
              { type: "image_url", image_url: { url: "http://example.com/image.jpg", detail: "auto" } },
            ],
          },
        ],
      };

      const result = model.transformMessages(messages);
      expect((result as any).messages[0].role).toEqual("user");
      expect((result as any).messages[0].content).toEqual(
        expect.arrayContaining([
          { type: "text", text: "Look at this:" },
          { type: "text", text: "What do you see?" },
          { type: "image_url", image_url: { url: "http://example.com/image.jpg", detail: "auto" } },
        ])
      );
      expect((result as any).messages[0].content.length).toBe(3);
    });

    it("should correctly transform an Assistant message with text", () => {
      const messages: MessageType[] = [
        {
          role: AssistantRoleLiteral,
          content: [{ modality: TextModalityLiteral, value: "The answer is 4." }],
        },
      ];

      const expected: OpenAIChatRequestType = {
        messages: [
          {
            role: "assistant", // "assistant role"
            content: [{ type: "text", text: "The answer is 4." }],
            // No tool_calls key expected
          },
        ],
      };
      expect(model.transformMessages(messages)).toEqual(expected);
    });

    it("should correctly transform an Assistant message with tool calls", () => {
      const messages: MessageType[] = [
        {
          role: AssistantRoleLiteral,
          content: [
            { modality: ToolCallModalityLiteral, id: "call_123", name: "get_weather", arguments: '{"location": "London"}', index: 1 },
            { modality: ToolCallModalityLiteral, id: "call_456", name: "get_stock", arguments: '{"ticker": "ACME"}', index: 2 },
          ],
        },
      ];

      const expected: OpenAIChatRequestType = {
        messages: [
          {
            role: "assistant", // "assistant role"
            content: [], // No text content
            tool_calls: [
              { id: "call_123", type: "function", function: { name: "get_weather", arguments: '{"location": "London"}' } },
              { id: "call_456", type: "function", function: { name: "get_stock", arguments: '{"ticker": "ACME"}' } },
            ],
          },
        ],
      };
      expect(model.transformMessages(messages)).toEqual(expected);
    });

    it("should correctly transform an Assistant message with mixed text and tool calls", () => {
      const messages: MessageType[] = [
        {
          role: AssistantRoleLiteral,
          content: [
            { modality: TextModalityLiteral, value: "Okay, I will call those tools." },
            { modality: ToolCallModalityLiteral, id: "call_abc", name: "send_email", arguments: '{"to": "test@example.com"}', index: 1 },
          ],
        },
      ];

      const expected: OpenAIChatRequestType = {
        messages: [
          {
            role: "assistant", // "assistant role"
            content: [{ type: "text", text: "Okay, I will call those tools." }],
            tool_calls: [{ id: "call_abc", type: "function", function: { name: "send_email", arguments: '{"to": "test@example.com"}' } }],
          },
        ],
      };
      expect(model.transformMessages(messages)).toEqual(expected);
    });

    it("should correctly transform a Tool message (tool response)", () => {
      const messages: MessageType[] = [
        {
          role: ToolRoleLiteral,
          content: [{ modality: ToolResponseModalityLiteral, id: "call_123", data: '{"temperature": 15}', index: 1, name: "func" }],
        },
      ];

      const expected: OpenAIChatRequestType = {
        messages: [
          {
            role: "tool", // "tool role"
            tool_call_id: "call_123",
            content: '{"temperature": 15}',
          },
        ],
      };
      expect(model.transformMessages(messages)).toEqual(expected);
    });

    it("should correctly transform a sequence of various valid messages", () => {
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
        { role: UserRoleLiteral, content: [{ modality: ImageModalityLiteral, value: { type: "url", url: "img.png" }, detail: "auto" }] },
      ];

      const expected: OpenAIChatRequestType = {
        messages: [
          { role: "system", content: [{ type: "text", text: "System prompt." }] },
          { role: "user", content: [{ type: "text", text: "User query?" }] },
          {
            role: "assistant",
            content: [{ type: "text", text: "Assistant response." }],
            tool_calls: [{ id: "t1", type: "function", function: { name: "func", arguments: "{}" } }],
          },
          { role: "tool", tool_call_id: "t1", content: "result" },
          { role: "user", content: [{ type: "image_url", image_url: { url: "img.png", detail: "auto" } }] },
        ],
      };
      expect(model.transformMessages(messages)).toEqual(expected);
    });
  });

  describe("transformStreamChatResponseChunk", () => {
    let model: BaseChatModel;

    beforeEach(() => {
      model = new BaseChatModel(mockModelSchema, mockOptions);
    });

    // --- Happy Paths ---

    it("should process a chunk with only role (first chunk)", async () => {
      const chunk =
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o","system_fingerprint": "fp_44709d6fcb","choices":[{"index":0,"delta":{"role":"assistant"},"logprobs":null,"finish_reason":null}]}\n';
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      expect(results).toHaveLength(2);
      expect(results[0].buffer).toBe("");
      // Role delta usually doesn't create a message object on its own, it sets up context for subsequent chunks
      expect(results[0].partialResponse.partialMessages).toEqual([]);
      expect(results[0].partialResponse.usage).toBeUndefined();
    });

    it("should process a single complete text chunk (after role)", async () => {
      // Assumes role was set in a previous chunk
      const chunk =
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o","system_fingerprint": "fp_44709d6fcb","choices":[{"index":0,"delta":{"content":"Hello"},"logprobs":null,"finish_reason":null}]}\n';
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      expect(results).toHaveLength(2);
      expect(results[0].buffer).toBe("");
      expect(results[0].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, "Hello")]);
      expect(results[0].partialResponse.usage).toBeUndefined();
    });

    it("should process a chunk containing only refusal", async () => {
      // Refusal might come with or without a preceding role chunk. Assume standalone here.
      const chunk =
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o","system_fingerprint": "fp_44709d6fcb","choices":[{"index":0,"delta":{"refusal":"Sorry, I cannot fulfill that request."},"logprobs":null,"finish_reason":"refusal"}]}\n';
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      expect(results).toHaveLength(2);
      expect(results[0].buffer).toBe("");
      // Expect refusal content to be treated like regular content for the partial message
      expect(results[0].partialResponse.partialMessages).toEqual([
        createPartialTextMessage(AssistantRoleLiteral, "Sorry, I cannot fulfill that request."),
      ]);
      expect(results[0].partialResponse.usage).toBeUndefined();
    });

    it("should process a single complete tool call chunk (name/id)", async () => {
      // Often, the first tool chunk establishes the call structure
      const chunk =
        'data: {"id":"chatcmpl-90q2mkANz92k7hnN47vUR3KzdcPAI","object":"chat.completion.chunk","created":1712329636,"model":"gpt-4-turbo-2024-04-09","system_fingerprint":"fp_ea6eb70049","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"call_abc123","type":"function","function":{"name":"get_current_weather","arguments":""}}]},"logprobs":null,"finish_reason":null}]}\n';
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      expect(results).toHaveLength(2);
      expect(results[0].buffer).toBe("");
      expect(results[0].partialResponse.partialMessages).toEqual([
        createPartialToolCallMessage(AssistantRoleLiteral, 0, "call_abc123", "get_current_weather", ""),
      ]);
      expect(results[0].partialResponse.usage).toBeUndefined();
    });

    it("should process a single complete tool call chunk (arguments)", async () => {
      // Subsequent chunk adding arguments
      const chunk =
        'data: {"id":"chatcmpl-90q2mkANz92k7hnN47vUR3KzdcPAI","object":"chat.completion.chunk","created":1712329636,"model":"gpt-4-turbo-2024-04-09","system_fingerprint":"fp_ea6eb70049","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"{\\"location\\": \\"Boston\\"}"}}]},"logprobs":null,"finish_reason":null}]}\n';
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      expect(results).toHaveLength(2);
      expect(results[0].buffer).toBe("");
      // Expect arguments to append. Assumes previous chunk set id/name.
      // The partial message creation needs to handle accumulating args.
      expect(results[0].partialResponse.partialMessages).toEqual([
        // The createPartialToolCallMessage needs context, or the reducer combining these partials handles accumulation.
        // Testing transform in isolation shows the delta content.
        createPartialToolCallMessage(AssistantRoleLiteral, 0, undefined, undefined, '{"location": "Boston"}'),
      ]);
      expect(results[0].partialResponse.usage).toBeUndefined();
    });

    it("should process a chunk with usage information", async () => {
      // Typically the last chunk with finish_reason and usage
      const chunk =
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o","choices":[{"index":0,"delta":{},"logprobs":null,"finish_reason":"stop"}],"usage":{"prompt_tokens":10,"completion_tokens":20,"total_tokens":30}}\n';
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      expect(results).toHaveLength(2);
      expect(results[0].buffer).toBe("");
      expect(results[0].partialResponse.partialMessages).toEqual([]); // Empty delta
      expect(results[0].partialResponse.usage).toEqual({
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      });
      // We might also want to check for finishReason if the function extracts it
      // expect(results[0].partialResponse.finishReason).toBe("stop");
    });

    it("should process a chunk with both content and usage", async () => {
      // Less common, but possible: final content + usage in one chunk
      const chunk =
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":" final part."},"logprobs":null,"finish_reason":"stop"}],"usage":{"prompt_tokens":10,"completion_tokens":20,"total_tokens":30}}\n';
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      expect(results).toHaveLength(2);
      expect(results[0].buffer).toBe("");
      expect(results[0].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, " final part.")]);
      expect(results[0].partialResponse.usage).toEqual({
        promptTokens: 10,
        completionTokens: 20,
        totalTokens: 30,
      });
      // We might also want to check for finishReason
      // expect(results[0].partialResponse.finishReason).toBe("stop");
    });

    it("should process multiple complete lines in a single chunk", async () => {
      const chunk =
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":"Part 1."},"logprobs":null,"finish_reason":null}]}\n' +
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":" Part 2."},"logprobs":null,"finish_reason":null}]}\n';
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      expect(results).toHaveLength(3); // Yields per processed line

      expect(results[0].buffer).toBe(""); // Buffer state after processing the *first* complete line within the chunk
      expect(results[0].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, "Part 1.")]);
      expect(results[0].partialResponse.usage).toBeUndefined();

      expect(results[1].buffer).toBe(""); // Buffer state after processing the *second* complete line
      expect(results[1].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, " Part 2.")]);
      expect(results[1].partialResponse.usage).toBeUndefined();
    });

    it("should terminate processing when 'data: [DONE]' is received", async () => {
      const chunk =
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":"Final bit."},"logprobs":null,"finish_reason":null}]}\n' +
        "data: [DONE]\n" +
        'data: {"id":"chatcmpl-456","object":"chat.completion.chunk","created":1694268199,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":"Should be ignored."},"logprobs":null,"finish_reason":null}]}\n'; // Data after [DONE]
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      // Only yields for the line before [DONE]
      expect(results).toHaveLength(1);
      expect(results[0].buffer).toBe(""); // Buffer is empty because [DONE] caused loop termination after processing previous line
      expect(results[0].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, "Final bit.")]);
      expect(results[0].partialResponse.usage).toBeUndefined();
    });

    it("should handle empty delta objects", async () => {
      const chunk =
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o","choices":[{"index":0,"delta":{},"logprobs":null,"finish_reason":null}]}\n';
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      expect(results).toHaveLength(2);
      expect(results[0].buffer).toBe("");
      expect(results[0].partialResponse.partialMessages).toEqual([]); // No message generated for empty delta
      expect(results[0].partialResponse.usage).toBeUndefined();
    });

    // --- Buffering Scenarios ---

    it("should handle an empty chunk", async () => {
      const chunk = "";
      const buffer = "previous incomplete data";
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, buffer));

      // Yields once with the current state of the buffer if no lines processed
      expect(results).toHaveLength(1);
      expect(results[0].buffer).toBe(buffer);
      expect(results[0].partialResponse.partialMessages).toEqual([]);
    });

    it("should handle a chunk with only whitespace/newlines", async () => {
      const chunk = "\n \n";
      // Buffer contains a *complete* line ending with \n
      const buffer =
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":"Buffered."},"logprobs":null,"finish_reason":null}]}\n';
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, buffer));

      // Should process the buffered line, then process the newlines (which do nothing), yielding once.
      expect(results).toHaveLength(2);
      expect(results[0].buffer).toBe(""); // Buffer processed, new buffer empty after whitespace
      expect(results[0].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, "Buffered.")]);
    });

    it("should buffer an incomplete chunk (start of line)", async () => {
      const chunk = 'data: {"id":"chatc';
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      expect(results).toHaveLength(1); // Yields once with the buffer update
      expect(results[0].buffer).toBe(chunk);
      expect(results[0].partialResponse.partialMessages).toEqual([]);
    });

    it("should buffer an incomplete chunk (middle of line)", async () => {
      const chunk = 'mpl-123","object":"ch';
      const buffer = 'data: {"id":"chatc';
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, buffer));

      expect(results).toHaveLength(1); // Yields once with the buffer update
      expect(results[0].buffer).toBe(buffer + chunk);
      expect(results[0].partialResponse.partialMessages).toEqual([]);
    });

    it("should process a complete line from buffer and new chunk", async () => {
      const buffer =
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o","choices":[{"index":0,"delta":';
      const chunk = '{"content":"Complete!"},"logprobs":null,"finish_reason":null}]}\n'; // Completes the JSON and adds newline
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, buffer));

      expect(results).toHaveLength(2);
      expect(results[0].buffer).toBe(""); // Line was completed and processed
      expect(results[0].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, "Complete!")]);
    });

    it("should process complete line and buffer the rest", async () => {
      const chunk =
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":"First."},"logprobs":null,"finish_reason":null}]}\n' + // Complete line
        'data: {"id":"chatcmpl-456","object":"chat.completion.chunk","created":1694268199,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":"Second part...'; // Incomplete line
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      // Yields for the first complete line, second yield updates buffer
      expect(results).toHaveLength(2);

      const bufferedPart =
        'data: {"id":"chatcmpl-456","object":"chat.completion.chunk","created":1694268199,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":"Second part...';

      // First yield corresponds to processing the first line
      expect(results[0].buffer).toBe(bufferedPart); // Buffer contains the start of the second line
      expect(results[0].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, "First.")]);

      // The final yield reflects the state *after* the loop finishes processing the chunk
      expect(results[1].buffer).toBe(bufferedPart);
      expect(results[1].partialResponse.partialMessages).toEqual([]); // No new message *fully processed* in this yield step
    });

    it("should handle chunk ending exactly at newline", async () => {
      const chunk =
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":"Exact."},"logprobs":null,"finish_reason":null}]}\n';
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      expect(results).toHaveLength(2);
      expect(results[0].buffer).toBe(""); // Newline consumed, buffer empty
      expect(results[0].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, "Exact.")]);
    });

    it("should combine buffer and chunk correctly when buffer has partial data", async () => {
      const buffer = 'data: {"id":"chatc';
      const chunk =
        'mpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":"Joined!"},"logprobs":null,"finish_reason":null}]}\n';
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, buffer));

      expect(results).toHaveLength(2);
      expect(results[0].buffer).toBe("");
      expect(results[0].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, "Joined!")]);
    });

    // --- Error Handling ---

    it("should throw ModelResponseError for malformed JSON", async () => {
      const chunk = 'data: {"id":"chatcmpl-123", "object":chat.completion.chunk"}\n'; // Invalid JSON (missing quotes)
      const generator = model.transformStreamChatResponseChunk(chunk, "");

      try {
        await collectAsyncGenerator(generator);
      } catch (e: any) {
        expect(e).toBeInstanceOf(ModelResponseError);
        expect(e.message).toContain("Malformed JSON received in stream"); //
        expect(e.cause).toBeInstanceOf(Error); // Assuming the cause is an Error instance
        expect(e.cause?.message).toContain("Unexpected token 'c'"); // Updated to match actual error message
      }
    });

    it("should throw ModelResponseError for invalid data structure (Zod schema fail)", async () => {
      // Valid JSON, but doesn't match OpenAIStreamChatResponse schema (missing required fields)
      const chunk = 'data: {"id":"chatcmpl-123", "foo": "bar"}\n';
      const generator = model.transformStreamChatResponseChunk(chunk, "");

      try {
        await collectAsyncGenerator(generator);
      } catch (e: any) {
        expect(e).toBeInstanceOf(ModelResponseError);
        expect(e.message).toContain("Malformed JSON received in stream"); //
        expect(e.cause).toBeInstanceOf(Error); // Assuming the cause is an Error instance
      }
    });

    it("should ignore lines not starting with 'data: ' after trimming", async () => {
      const chunk =
        "event: message\n" + // Ignored line
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":"Valid"},"logprobs":null,"finish_reason":null}]}\n' + // Valid line
        "ignore this line\n" + // Ignored line (ends up in buffer if no more data)
        ":heartbeat\n"; // Ignored line (SSE comment)
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      // Only yields for the valid 'data:' line
      expect(results).toHaveLength(2);
      // The final state of the buffer depends on how trailing ignored lines are handled.
      expect(results[0].buffer).toBe("");
      expect(results[0].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, "Valid")]);
    });

    it("should throw parsing error if JSON parsing throws an unexpected error", async () => {
      // Use JSON that would be syntactically valid but triggers the mock error
      const chunk =
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":"abc"},"logprobs":null,"finish_reason":null}]}\n';
      try {
        const generator = model.transformStreamChatResponseChunk(chunk, "");
        await collectAsyncGenerator(generator);
      } catch (e: any) {
        expect(e).toBeInstanceOf(ModelResponseError);
        expect(e.message).toContain("Unexpected error while parsing JSON");
        expect(e.cause).toBeInstanceOf(Error); // Assuming the cause is an Error instance
        expect(e.cause?.message).toContain("Mock error");
      }
    });

    it("should handle [DONE] correctly even with preceding valid data", async () => {
      const chunk =
        'data: {"id":"chatcmpl-123","object":"chat.completion.chunk","created":1694268190,"model":"gpt-4o","choices":[{"index":0,"delta":{"content":"Final bit."},"logprobs":null,"finish_reason":null}]}\ndata: [DONE]\n';
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunk, ""));

      expect(results).toHaveLength(1); // Yields for the data before [DONE]
      expect(results[0].buffer).toBe(""); // Buffer empty as [DONE] terminated processing
      expect(results[0].partialResponse.partialMessages).toEqual([createPartialTextMessage(AssistantRoleLiteral, "Final bit.")]);
    });

    it("should yield nothing if chunk only contains [DONE]", async () => {
      const doneChunk = "data: [DONE]\n";
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(doneChunk, ""));
      expect(results).toHaveLength(0); // Generator returns immediately, yields nothing.
    });

    it("should yield nothing if chunk has data *after* [DONE]", async () => {
      const chunkWithDoneFirst =
        'data: [DONE]\ndata: {"id":"chatcmpl-789", "object":"chat.completion.chunk","created":1694268199,"model":"gpt-4o", "choices":[{"index":0, "delta": {"content":"ignored"}, "logprobs":null, "finish_reason":null}]}\n';
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(chunkWithDoneFirst, ""));
      expect(results).toHaveLength(0); // Returns on [DONE], ignores subsequent lines in the same chunk processing loop.
    });
  });
});
