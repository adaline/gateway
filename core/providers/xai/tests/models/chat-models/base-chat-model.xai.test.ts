import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ChatModelSchema, ChatModelSchemaType } from "@adaline/provider";
import { Config, MessageType, SystemRoleLiteral, TextModalityLiteral, UserRoleLiteral } from "@adaline/types";

import { XAIChatModelConfigs } from "../../../src/configs";
import { BaseChatModel } from "../../../src/models";

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
    name: "grok-2",
    description: "Grok 2 model",
    maxInputTokens: 131072,
    maxOutputTokens: 131072,
    roles: mockRolesMap,
    modalities: mockModalities,
    config: {
      def: XAIChatModelConfigs.ChatModelBaseConfigDef(131072, 4),
      schema: XAIChatModelConfigs.ChatModelBaseConfigSchema(131072, 4),
    },
  });

  const mockOptions = {
    apiKey: "test-api-key",
    baseUrl: "https://api.x.ai/v1",
    modelName: "grok-2",
  };

  describe("constructor", () => {
    it("should initialize properties correctly", () => {
      const baseChatModel = new BaseChatModel(mockModelSchema, mockOptions);
      expect(baseChatModel.modelSchema).toBe(mockModelSchema);
      expect(baseChatModel.getDefaultBaseUrl()).toBe("https://api.x.ai/v1");
    });
  });

  describe("getDefaultBaseUrl", () => {
    it("should return the baseUrl without trailing slash", () => {
      const model = new BaseChatModel(mockModelSchema, mockOptions);
      expect(model.getDefaultBaseUrl()).toBe("https://api.x.ai/v1");
    });

    it("should return the baseUrl without trailing slash when provided with one", () => {
      const modelWithTrailingSlash = new BaseChatModel(mockModelSchema, {
        ...mockOptions,
        baseUrl: "https://api.x.ai/v1/",
      });
      expect(modelWithTrailingSlash.getDefaultBaseUrl()).toBe("https://api.x.ai/v1");
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
  });

  describe("getDefaultParams", () => {
    it("should return the default params with model name", () => {
      const model = new BaseChatModel(mockModelSchema, mockOptions);
      expect(model.getDefaultParams()).toEqual({
        model: "grok-2",
      });
    });
  });

  describe("transformConfig", () => {
    it("should transform and return every config", () => {
      const model = new BaseChatModel(mockModelSchema, mockOptions);
      const messages: MessageType[] = [];
      const config = Config().parse({
        temperature: 1,
        maxTokens: 2000,
        stop: ["test"],
        topP: 1,
        frequencyPenalty: 0.5,
        presencePenalty: 0.5,
        seed: 1,
        logProbs: true,
        topLogProbs: 5,
      });
      expect(model.transformConfig(config, messages, [])).toEqual({
        max_tokens: 2000,
        temperature: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0.5,
        top_p: 1,
        stop: ["test"],
        seed: 1,
        logprobs: true,
        top_logprobs: 5,
      });
    });
  });

  describe("transformMessages", () => {
    it("should transform system message correctly", () => {
      const model = new BaseChatModel(mockModelSchema, mockOptions);
      const messages: MessageType[] = [
        {
          role: SystemRoleLiteral,
          content: [{ modality: TextModalityLiteral, value: "You are a helpful assistant." }],
        },
      ];
      const result = model.transformMessages(messages);
      expect(result.messages).toEqual([
        {
          role: "system",
          content: [{ type: "text", text: "You are a helpful assistant." }],
        },
      ]);
    });

    it("should transform user message correctly", () => {
      const model = new BaseChatModel(mockModelSchema, mockOptions);
      const messages: MessageType[] = [
        {
          role: UserRoleLiteral,
          content: [{ modality: TextModalityLiteral, value: "Hello!" }],
        },
      ];
      const result = model.transformMessages(messages);
      expect(result.messages).toEqual([
        {
          role: "user",
          content: [{ type: "text", text: "Hello!" }],
        },
      ]);
    });
  });

  describe("getCompleteChatUrl", () => {
    it("should return the complete chat URL", async () => {
      const model = new BaseChatModel(mockModelSchema, mockOptions);
      const url = await model.getCompleteChatUrl();
      expect(url).toBe("https://api.x.ai/v1/chat/completions");
    });
  });

  describe("getStreamChatUrl", () => {
    it("should return the stream chat URL", async () => {
      const model = new BaseChatModel(mockModelSchema, mockOptions);
      const url = await model.getStreamChatUrl();
      expect(url).toBe("https://api.x.ai/v1/chat/completions");
    });
  });
});
