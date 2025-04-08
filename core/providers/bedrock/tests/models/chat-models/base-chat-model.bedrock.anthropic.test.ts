import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";

import { ChatModelSchema, ChatModelSchemaType } from "@adaline/provider";
import { Config, MessageType, ToolType } from "@adaline/types";

import { BedrockAnthropicChatModelConfigs } from "../../../src/configs";
import { BaseChatModelAnthropic } from "../../../src/models";

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
});
