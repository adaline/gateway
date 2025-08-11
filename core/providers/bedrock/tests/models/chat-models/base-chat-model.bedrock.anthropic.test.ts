import { beforeEach, describe, expect, it } from "vitest";
import { z, ZodError } from "zod";

import { AnthropicRequestType } from "@adaline/anthropic";
import { ChatModelSchema, ChatModelSchemaType } from "@adaline/provider";
import {
  AssistantRoleLiteral,
  ChatResponseType,
  ChatUsageType,
  Config,
  ContentType,
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

import { BedrockAnthropicChatModelConfigs } from "../../../src/configs";
import { BaseChatModelAnthropic } from "../../../src/models";

// Helper function to collect results from the async generator
async function collectAsyncGenerator<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];
  for await (const value of generator) {
    results.push(value);
  }
  return results;
}
describe("BaseChatModelAnthropic", () => {
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
      def: BedrockAnthropicChatModelConfigs.base(200000, 4).def,
      schema: BedrockAnthropicChatModelConfigs.base(200000, 4).schema,
    },
  });

  const mockOptions = {
    awsAccessKeyId: "test-access-key",
    awsSecretAccessKey: "test-secret-key",
    modelName: "test-model",
  };

  describe("constructor", () => {
    it("should initialize properties correctly", () => {
      const baseChatModel = new BaseChatModelAnthropic(mockModelSchema, mockOptions);
      expect(baseChatModel.modelSchema).toBe(mockModelSchema);
      expect(baseChatModel.getDefaultBaseUrl()).toBe("https://bedrock-runtime.us-east-1.amazonaws.com");
    });
  });

  describe("getDefaultBaseUrl", () => {
    it("should return the baseUrl without trailing slash", () => {
      const model = new BaseChatModelAnthropic(mockModelSchema, mockOptions);
      expect(model.getDefaultBaseUrl()).toBe("https://bedrock-runtime.us-east-1.amazonaws.com");
    });
  });

  describe("getDefaultHeaders", () => {
    it("should return the default headers with API key", () => {
      const model = new BaseChatModelAnthropic(mockModelSchema, mockOptions);
      expect(model.getDefaultHeaders()).toEqual({
        Accept: "application/json",
        "Content-Type": "application/json",
      });
    });
  });

  describe("getDefaultParams", () => {
    it("should return the default params with model name", () => {
      const model = new BaseChatModelAnthropic(mockModelSchema, mockOptions);
      expect(model.getDefaultParams()).toEqual({
        anthropic_version: "bedrock-2023-05-31",
      });
    });
  });

  describe("transformConfig", () => {
    let model: BaseChatModelAnthropic;
    let tools: ToolType[];
    let messages: MessageType[];

    beforeEach(() => {
      model = new BaseChatModelAnthropic(mockModelSchema, mockOptions);
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
  });
  describe("BaseChatModel transformMessages", () => {
    let model: BaseChatModelAnthropic;

    beforeEach(() => {
      model = new BaseChatModelAnthropic(mockModelSchema, mockOptions);
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

      try {
        model.transformMessages(invalidInput as any);
      } catch (e: any) {
        expect(e).toBeInstanceOf(Error);
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

      try {
        model.transformMessages(messages);
      } catch (e: any) {
        expect(e).toBeInstanceOf(Error);
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

      try {
        model.transformMessages(messages);
      } catch (e: any) {
        expect(e).toBeInstanceOf(Error);
        expect(e.info).toBe("Invalid messages");
      }
    });

    it("should throw InvalidMessagesError for PDF modality (not supported by Bedrock)", () => {
      const messages: MessageType[] = [
        {
          role: UserRoleLiteral,
          content: [
            {
              modality: "pdf" as const,
              value: { type: "base64", base64: "JVBERi0xLjQK..." },
              file: {
                name: "some_pdf.pdf",
                id: "some_pdf.pdf",
              },
            },
          ],
        },
      ];

      try {
        model.transformMessages(messages);
      } catch (e: any) {
        expect(e).toBeInstanceOf(Error);
        expect(e.info).toBe("Invalid message content for model : 'test-model'");
      }
    });

    it("should throw InvalidMessagesError for unsupported role", () => {
      const messages: MessageType[] = [
        {
          role: "guest" as any, // guest is not in roles
          content: [{ modality: TextModalityLiteral, value: "Hello" }],
        },
      ];

      try {
        model.transformMessages(messages);
      } catch (e: any) {
        expect(e).toBeInstanceOf(Error);
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

      try {
        model.transformMessages(messages);
      } catch (e: any) {
        expect(e).toBeInstanceOf(Error);
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

      try {
        model.transformMessages(messages);
      } catch (e: any) {
        expect(e).toBeInstanceOf(Error);
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

      try {
        model.transformMessages(messages);
      } catch (e: any) {
        expect(e).toBeInstanceOf(Error);
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
      try {
        model.transformMessages(messages);
      } catch (e: any) {
        expect(e).toBeInstanceOf(Error);
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

      try {
        model.transformMessages(messages);
      } catch (e: any) {
        expect(e).toBeInstanceOf(Error);
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

      try {
        model.transformMessages(messages);
      } catch (e: any) {
        expect(e).toBeInstanceOf(Error);
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
        expect(error).toBeInstanceOf(Error);
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
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  const anthropicData = (payload: object): string => `data: ${JSON.stringify(payload)}\n`;

  describe("transformTools", () => {
    let modelWithTools: BaseChatModelAnthropic;
    let modelWithoutTools: BaseChatModelAnthropic;

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
      modelWithTools = new BaseChatModelAnthropic(mockModelSchema, mockOptions);

      // Model that *does not* support tools
      const schemaWithoutTools = { ...mockModelSchema, modalities: [TextModalityLiteral] as const }; // Only text
      modelWithoutTools = new BaseChatModelAnthropic(schemaWithoutTools as any, mockOptions); // Cast as any if type complains
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
      expect(() => modelWithoutTools.transformTools([validTool1])).toThrow(
        // Match specific part of the error message
        /does not support tool modality : 'tool-call'/
      );
      try {
        modelWithoutTools.transformTools([validTool1]);
      } catch (e: any) {
        expect(e).toBeInstanceOf(Error);
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

      try {
        modelWithTools.transformTools(tools);
      } catch (e: any) {
        expect(e).toBeInstanceOf(Error);
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

      try {
        modelWithTools.transformTools(tools);
      } catch (e: any) {
        expect(e).toBeInstanceOf(Error);
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
    let model: BaseChatModelAnthropic;

    beforeEach(() => {
      model = new BaseChatModelAnthropic(mockModelSchema, mockOptions);
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
      try {
        model.transformCompleteChatResponse(invalidInput);
      } catch (e: any) {
        expect(e.cause).toBeInstanceOf(ZodError);
      }
    });

    it("should throw ModelResponseError for missing required top-level fields (e.g., content)", () => {
      const invalidResponse = createMockAnthropicResponse([{ type: "text", text: "Test" }]);
      delete invalidResponse.content; // Remove required field

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
