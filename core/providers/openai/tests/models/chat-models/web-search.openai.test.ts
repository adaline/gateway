import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";

import { ChatModelSchema, ChatModelSchemaType } from "@adaline/provider";
import { AssistantRoleLiteral, SearchResultContentValue, SearchResultModalityLiteral } from "@adaline/types";

import { OpenAI } from "../../../src";
import { OpenAIChatModelConfigs } from "../../../src/configs";
import { BaseChatModel } from "../../../src/models";

describe("OpenAI Web Search", () => {
  const mockRoles = ["system", "user", "assistant", "tool"] as const;
  const mockWebSearchModalities = ["text", "image", "tool-call", "tool-response", "search-result"] as const;

  const mockRolesMap = {
    system: "system",
    user: "user",
    assistant: "assistant",
    tool: "tool",
  };

  const mockModelSchema: ChatModelSchemaType = ChatModelSchema(z.enum(mockRoles), z.enum(mockWebSearchModalities)).parse({
    name: "test-web-search-model",
    description: "test web search model",
    maxInputTokens: 128000,
    maxOutputTokens: 16384,
    roles: mockRolesMap,
    modalities: mockWebSearchModalities,
    config: {
      def: OpenAIChatModelConfigs.webSearch(16384, 4).def,
      schema: OpenAIChatModelConfigs.webSearch(16384, 4).schema,
    },
  });

  const mockOptions = {
    apiKey: "test-api-key",
    baseUrl: "https://api.openai.com/v1",
    modelName: "test-web-search-model",
  };

  // --- Config Tests ---
  describe("web search config", () => {
    it("should have webSearchTool and webSearchContextSize config keys", () => {
      const configDef = OpenAIChatModelConfigs.webSearch(16384, 4).def;
      expect(configDef.webSearchTool).toBeDefined();
      expect(configDef.webSearchTool.type).toBe("select-boolean");
      expect(configDef.webSearchTool.param).toBe("webSearch");

      expect(configDef.webSearchContextSize).toBeDefined();
      expect(configDef.webSearchContextSize.type).toBe("select-string");
      expect(configDef.webSearchContextSize.param).toBe("webSearchContextSize");
      expect(configDef.webSearchContextSize.choices).toEqual(["low", "medium", "high"]);
    });

    it("should validate valid web search config", () => {
      const schema = OpenAIChatModelConfigs.webSearch(16384, 4).schema;
      const result = schema.safeParse({
        webSearchTool: true,
        webSearchContextSize: "high",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid search_context_size", () => {
      const schema = OpenAIChatModelConfigs.webSearch(16384, 4).schema;
      const result = schema.safeParse({
        webSearchTool: true,
        webSearchContextSize: "extreme",
      });
      expect(result.success).toBe(false);
    });
  });

  // --- transformConfig Tests ---
  describe("transformConfig", () => {
    let model: BaseChatModel;

    beforeEach(() => {
      model = new BaseChatModel(mockModelSchema, mockOptions);
    });

    it("should transform webSearch config into web_search_options", () => {
      const result = model.transformConfig({
        webSearchTool: true,
        webSearchContextSize: "high",
      });

      expect(result.web_search_options).toBeDefined();
      expect(result.web_search_options).toEqual({
        search_context_size: "high",
      });
      expect(result.webSearch).toBeUndefined();
      expect(result.webSearchContextSize).toBeUndefined();
    });

    it("should not include web_search_options when webSearchTool is false", () => {
      const result = model.transformConfig({
        webSearchTool: false,
      });

      expect(result.web_search_options).toBeUndefined();
      expect(result.webSearch).toBeUndefined();
      expect(result.webSearchContextSize).toBeUndefined();
    });

    it("should not leak webSearchContextSize when webSearchTool is omitted", () => {
      const result = model.transformConfig({
        webSearchContextSize: "high",
      });

      expect(result.web_search_options).toBeUndefined();
      expect(result.webSearch).toBeUndefined();
      expect(result.webSearchContextSize).toBeUndefined();
      expect(result.search_context_size).toBeUndefined();
    });

    it("should not leak webSearchContextSize when webSearchTool is false", () => {
      const result = model.transformConfig({
        webSearchTool: false,
        webSearchContextSize: "high",
      });

      expect(result.web_search_options).toBeUndefined();
      expect(result.webSearch).toBeUndefined();
      expect(result.webSearchContextSize).toBeUndefined();
      expect(result.search_context_size).toBeUndefined();
    });
  });

  // --- transformCompleteChatResponse Tests ---
  describe("transformCompleteChatResponse", () => {
    let model: BaseChatModel;

    beforeEach(() => {
      model = new BaseChatModel(mockModelSchema, mockOptions);
    });

    const createResponseWithAnnotations = (annotations: any[]) => ({
      id: "chatcmpl-search-123",
      object: "chat.completion" as const,
      created: 1677652288,
      model: "gpt-4o-search-preview",
      system_fingerprint: "fp_search",
      choices: [
        {
          index: 0,
          message: {
            role: "assistant",
            content: "Paris is the capital of France [1]. It has a population of 2.1 million [2].",
            annotations,
          },
          logprobs: null,
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: 15,
        completion_tokens: 20,
        total_tokens: 35,
      },
    });

    it("should transform annotations into search-result content", () => {
      const response = createResponseWithAnnotations([
        {
          type: "url_citation",
          url_citation: {
            start_index: 31,
            end_index: 34,
            title: "Paris - Wikipedia",
            url: "https://en.wikipedia.org/wiki/Paris",
          },
        },
        {
          type: "url_citation",
          url_citation: {
            start_index: 71,
            end_index: 74,
            title: "Paris Population",
            url: "https://worldpopulationreview.com/cities/paris",
          },
        },
      ]);

      const result = model.transformCompleteChatResponse(response);

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].role).toBe(AssistantRoleLiteral);
      // Should have text content + search-result content
      expect(result.messages[0].content).toHaveLength(2);

      // First content is text
      expect(result.messages[0].content[0].modality).toBe("text");

      // Second content is search-result
      const searchResult = result.messages[0].content[1];
      expect(searchResult.modality).toBe(SearchResultModalityLiteral);
      expect(searchResult.value.type).toBe("openai");
      expect(searchResult.value.query).toBe("");
      expect(searchResult.value.responses).toHaveLength(2);
      expect(searchResult.value.responses[0]).toEqual({
        source: "web",
        url: "https://en.wikipedia.org/wiki/Paris",
        title: "Paris - Wikipedia",
      });
      expect(searchResult.value.responses[1]).toEqual({
        source: "web",
        url: "https://worldpopulationreview.com/cities/paris",
        title: "Paris Population",
      });
      expect(searchResult.value.references).toHaveLength(2);
      expect(searchResult.value.references[0]).toMatchObject({
        responseIndices: [0],
        startIndex: 31,
        endIndex: 34,
      });
      // prefixStart = max(0, 31-40) = 0, so no "..." prefix
      expect(searchResult.value.references[0].text).toBe("Paris is the capital of France [1]");

      expect(searchResult.value.references[1]).toMatchObject({
        responseIndices: [1],
        startIndex: 71,
        endIndex: 74,
      });
      // prefixStart = max(0, 71-40) = 31, so has "..." prefix
      expect(searchResult.value.references[1].text).toMatch(/^\.\.\..*\[2\]$/);
    });

    it("should deduplicate URLs in responses", () => {
      const response = createResponseWithAnnotations([
        {
          type: "url_citation",
          url_citation: {
            start_index: 10,
            end_index: 13,
            title: "Paris - Wikipedia",
            url: "https://en.wikipedia.org/wiki/Paris",
          },
        },
        {
          type: "url_citation",
          url_citation: {
            start_index: 50,
            end_index: 53,
            title: "Paris - Wikipedia",
            url: "https://en.wikipedia.org/wiki/Paris",
          },
        },
      ]);

      const result = model.transformCompleteChatResponse(response);
      const searchResult = result.messages[0].content[1];

      // Same URL should be deduplicated to one response
      expect(searchResult.value.responses).toHaveLength(1);
      expect(searchResult.value.responses[0].url).toBe("https://en.wikipedia.org/wiki/Paris");

      // Both references should point to the same response index
      expect(searchResult.value.references).toHaveLength(2);
      expect(searchResult.value.references[0].responseIndices).toEqual([0]);
      expect(searchResult.value.references[1].responseIndices).toEqual([0]);
      expect(searchResult.value.references[0].startIndex).toBe(10);
      expect(searchResult.value.references[1].startIndex).toBe(50);
    });

    it("should handle response without annotations", () => {
      const response = createResponseWithAnnotations([]);

      const result = model.transformCompleteChatResponse(response);

      expect(result.messages).toHaveLength(1);
      // Only text content, no search-result
      expect(result.messages[0].content).toHaveLength(1);
      expect(result.messages[0].content[0].modality).toBe("text");
    });

    it("should skip annotations when content is null", () => {
      const response = {
        id: "chatcmpl-null",
        object: "chat.completion" as const,
        created: 1677652288,
        model: "gpt-4o-search-preview",
        system_fingerprint: "fp_search",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: null,
              annotations: [
                {
                  type: "url_citation" as const,
                  url_citation: {
                    start_index: 0,
                    end_index: 5,
                    title: "Example",
                    url: "https://example.com",
                  },
                },
              ],
            },
            logprobs: null,
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 9,
          completion_tokens: 0,
          total_tokens: 9,
        },
      };

      const result = model.transformCompleteChatResponse(response);

      expect(result.messages).toHaveLength(1);
      // No text content (null), no search-result (skipped due to null content)
      expect(result.messages[0].content).toHaveLength(0);
    });

    it("should handle response with no annotations field", () => {
      const response = {
        id: "chatcmpl-123",
        object: "chat.completion" as const,
        created: 1677652288,
        model: "gpt-4o-search-preview",
        system_fingerprint: "fp_search",
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: "Hello there!",
            },
            logprobs: null,
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 9,
          completion_tokens: 12,
          total_tokens: 21,
        },
      };

      const result = model.transformCompleteChatResponse(response);

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0].content).toHaveLength(1);
      expect(result.messages[0].content[0].modality).toBe("text");
    });
  });

  // --- Model Schema Tests ---
  describe("search-preview model schemas", () => {
    const provider = new OpenAI();
    const schemas = provider.chatModelSchemas();

    it("should register gpt-4o-search-preview model", () => {
      expect(schemas["gpt-4o-search-preview"]).toBeDefined();
      expect(schemas["gpt-4o-search-preview"].name).toBe("gpt-4o-search-preview");
    });

    it("should register gpt-4o-mini-search-preview model", () => {
      expect(schemas["gpt-4o-mini-search-preview"]).toBeDefined();
      expect(schemas["gpt-4o-mini-search-preview"].name).toBe("gpt-4o-mini-search-preview");
    });

    it("should register dated variants", () => {
      expect(schemas["gpt-4o-search-preview-2025-03-11"]).toBeDefined();
      expect(schemas["gpt-4o-mini-search-preview-2025-03-11"]).toBeDefined();
    });

    it("should register gpt-5-search-api model", () => {
      expect(schemas["gpt-5-search-api"]).toBeDefined();
      expect(schemas["gpt-5-search-api"].name).toBe("gpt-5-search-api");
      expect(schemas["gpt-5-search-api"].modalities).toContain(SearchResultModalityLiteral);
      expect(schemas["gpt-5-search-api"].config.def.webSearchTool).toBeDefined();
    });

    it("should include search-result modality in search-preview models", () => {
      const modalities = schemas["gpt-4o-search-preview"].modalities;
      expect(modalities).toContain(SearchResultModalityLiteral);
    });

    it("should not include search-result modality in non-search models", () => {
      const modalities = schemas["gpt-4o"].modalities;
      expect(modalities).not.toContain(SearchResultModalityLiteral);
    });

    it("should have webSearchTool config in search-preview models", () => {
      const configDef = schemas["gpt-4o-search-preview"].config.def;
      expect(configDef.webSearchTool).toBeDefined();
      expect(configDef.webSearchTool.type).toBe("select-boolean");
    });
  });

  // --- Zod Schema Tests ---
  describe("SearchResultContentValue schema", () => {
    it("should validate a valid OpenAI search result", () => {
      const result = SearchResultContentValue.safeParse({
        type: "openai",
        query: "",
        responses: [{ source: "web", url: "https://example.com", title: "Example" }],
        references: [{ text: "", responseIndices: [0], startIndex: 0, endIndex: 10 }],
      });
      expect(result.success).toBe(true);
    });

    it("should accept any type string or no type", () => {
      const withType = SearchResultContentValue.safeParse({
        type: "google",
        query: "",
        responses: [],
        references: [],
      });
      expect(withType.success).toBe(true);

      const withoutType = SearchResultContentValue.safeParse({
        query: "",
        responses: [],
        references: [],
      });
      expect(withoutType.success).toBe(true);
    });

    it("should require responses and references arrays", () => {
      const result = SearchResultContentValue.safeParse({
        type: "openai",
        query: "",
      });
      expect(result.success).toBe(false);
    });
  });
});
