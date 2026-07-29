import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ChatModelSchema, ChatModelSchemaType } from "@adaline/provider";
import { Config, MessageType, SystemRoleLiteral, TextModalityLiteral, UserRoleLiteral } from "@adaline/types";

import { XAIChatModelConfigs } from "../../../src/configs";
import { BaseChatModel, Grok_4_3, Grok_4_5, Grok_4_20_0309_Non_Reasoning, Grok_4_20_Multi_Agent_0309 } from "../../../src/models";

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
    name: "grok-4.3",
    description: "Grok 4.3 model",
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
    modelName: "grok-4.3",
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
        model: "grok-4.3",
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

  describe("reasoning effort per model", () => {
    const modelOptions = { apiKey: "test-api-key" };

    it("should accept low, medium and high on grok-4.5 and reject the values it cannot take", () => {
      const model = new Grok_4_5({ ...modelOptions, modelName: "grok-4.5" });
      expect(model.transformConfig(Config().parse({ reasoningEffort: "medium" }), [], [])).toEqual({
        reasoning_effort: "medium",
      });
      expect(() => model.transformConfig(Config().parse({ reasoningEffort: "none" }), [], [])).toThrow();
      expect(() => model.transformConfig(Config().parse({ reasoningEffort: "xhigh" }), [], [])).toThrow();
    });

    it("should accept low, medium, high and xhigh on grok-4.20-multi-agent-0309", () => {
      const model = new Grok_4_20_Multi_Agent_0309({ ...modelOptions, modelName: "grok-4.20-multi-agent-0309" });
      expect(model.transformConfig(Config().parse({ reasoningEffort: "xhigh" }), [], [])).toEqual({
        reasoning_effort: "xhigh",
      });
      expect(() => model.transformConfig(Config().parse({ reasoningEffort: "none" }), [], [])).toThrow();
    });

    it("should keep grok-4.3 scoped to none and low", () => {
      const model = new Grok_4_3({ ...modelOptions, modelName: "grok-4.3" });
      expect(model.transformConfig(Config().parse({ reasoningEffort: "none" }), [], [])).toEqual({
        reasoning_effort: "none",
      });
      expect(() => model.transformConfig(Config().parse({ reasoningEffort: "high" }), [], [])).toThrow();
    });

    // Effort defaults are documentation for callers, not something the gateway sends on its own.
    it("should not send reasoning_effort when the caller omits it", () => {
      expect(new Grok_4_5({ ...modelOptions, modelName: "grok-4.5" }).transformConfig(Config().parse({}), [], [])).toEqual({});
      expect(
        new Grok_4_20_Multi_Agent_0309({ ...modelOptions, modelName: "grok-4.20-multi-agent-0309" }).transformConfig(
          Config().parse({}),
          [],
          []
        )
      ).toEqual({});
    });

    it("should drop reasoning_effort from requests for models that do not document the control", () => {
      const model = new Grok_4_20_0309_Non_Reasoning({ ...modelOptions, modelName: "grok-4.20-0309-non-reasoning" });
      const request = model.transformModelRequest({
        model: "grok-4.20-0309-non-reasoning",
        messages: [{ role: "user", content: "Hello!" }],
        reasoning_effort: "low",
      });
      expect(request.config.reasoningEffort).toBeUndefined();
    });

    it("should carry reasoning_effort into config for models that do document it", () => {
      const model = new Grok_4_20_Multi_Agent_0309({ ...modelOptions, modelName: "grok-4.20-multi-agent-0309" });
      const request = model.transformModelRequest({
        model: "grok-4.20-multi-agent-0309",
        messages: [{ role: "user", content: "Hello!" }],
        reasoning_effort: "xhigh",
      });
      expect(request.config.reasoningEffort).toBe("xhigh");
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
