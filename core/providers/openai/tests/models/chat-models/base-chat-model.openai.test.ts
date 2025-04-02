import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";

import { ChatModelSchema, ChatModelSchemaType } from "@adaline/provider";
import { Config, MessageType, ToolType } from "@adaline/types";

import { OpenAIChatModelConfigs } from "../../../src/configs";
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
});
