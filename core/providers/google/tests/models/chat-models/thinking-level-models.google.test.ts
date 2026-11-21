import { describe, expect, it } from "vitest";

import { InvalidConfigError, SelectStringConfigItemDefType } from "@adaline/provider";
import { AssistantRoleLiteral, Config, createPartialReasoningMessage, createPartialTextMessage } from "@adaline/types";

import { BaseChatModel } from "../../../src/models";
import { Google } from "../../../src/provider";

async function collectAsyncGenerator<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];
  for await (const value of generator) {
    results.push(value);
  }
  return results;
}

const provider = new Google();
const schemas = provider.chatModelSchemas();
const createModel = (modelName: string) => provider.chatModel({ modelName, apiKey: "test-api-key" }) as BaseChatModel;
const generationConfig = (modelName: string, config: Record<string, unknown>) =>
  createModel(modelName).transformConfig(Config().parse(config)).generation_config as Record<string, unknown>;

// Allowed thinking levels and UI default per model using the thinking-level config builder.
const THINKING_LEVEL_MODELS: Record<string, { levels: string[]; default: string }> = {
  "gemini-4-carbon": { levels: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },
  "gemini-4-argon": { levels: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },
  "gemini-4-neon": { levels: ["LOW", "MEDIUM", "HIGH", "XHIGH"], default: "HIGH" },
  "gemini-4-hydrogen": { levels: ["LOW", "MEDIUM", "HIGH", "XHIGH"], default: "HIGH" },
  "gemini-3.8-flash": { levels: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },
  "gemini-3.6-flash": { levels: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },
  "gemini-3.5-flash-lite": { levels: ["MINIMAL", "LOW", "MEDIUM", "HIGH"], default: "MINIMAL" },
};
const GEMINI_4_AND_3_8 = ["gemini-4-carbon", "gemini-4-argon", "gemini-4-neon", "gemini-4-hydrogen", "gemini-3.8-flash"];
const ALL_LEVELS = ["MINIMAL", "LOW", "MEDIUM", "HIGH", "XHIGH"];

describe("thinking-level config builder (Gemini 3.6+ models)", () => {
  describe.each(Object.entries(THINKING_LEVEL_MODELS))("%s", (modelName, expected) => {
    const schema = schemas[modelName];

    it("exposes the per-model thinking levels and UI default", () => {
      const def = schema.config.def.reasoningEffort as SelectStringConfigItemDefType;
      expect(def.param).toBe("thinkingLevel");
      expect(def.choices).toEqual(expected.levels);
      expect(def.default).toBe(expected.default);
    });

    it("has no sampling or thinking-budget config items", () => {
      const keys = Object.keys(schema.config.def);
      for (const removed of ["temperature", "topP", "topK", "maxReasoningTokens"]) {
        expect(keys).not.toContain(removed);
      }
      expect(keys).toEqual(
        expect.arrayContaining(["maxTokens", "stop", "toolChoice", "safetySettings", "responseFormat", "responseSchema", "reasoningEffort"])
      );
    });

    it.each(["temperature", "topP", "topK", "maxReasoningTokens", "thinkingBudget"])("never sends the '%s' key", (key) => {
      const transformed = JSON.stringify(createModel(modelName).transformConfig(Config().parse({ [key]: 1 })));
      for (const param of ["temperature", "topP", "topK", "thinkingBudget"]) {
        expect(transformed).not.toContain(param);
      }
    });

    it.each(ALL_LEVELS)("accepts or rejects thinking level %s per model", (level) => {
      const result = schema.config.schema.safeParse({ reasoningEffort: level });
      expect(result.success).toBe(expected.levels.includes(level));
    });

    it("transformConfig maps the selected level to thinkingConfig.thinkingLevel and never sends thinkingBudget", () => {
      for (const level of expected.levels) {
        const transformed = generationConfig(modelName, { reasoningEffort: level, reasoningEnabled: true, maxTokens: 1024 });
        expect(transformed.thinkingConfig).toEqual({ thinkingLevel: level, includeThoughts: true });
        expect(transformed.maxOutputTokens).toBe(1024);
        expect(JSON.stringify(transformed)).not.toContain("thinkingBudget");
        expect(transformed).not.toHaveProperty("temperature");
        expect(transformed).not.toHaveProperty("topP");
      }
    });

    it("does not send a thinking level unless one is selected (default is UI-only)", () => {
      const transformed = generationConfig(modelName, { maxTokens: 10 });
      const thinkingConfig = transformed.thinkingConfig as Record<string, unknown> | undefined;
      expect(thinkingConfig?.thinkingLevel).toBeUndefined();
      expect(JSON.stringify(transformed)).not.toContain("thinkingBudget");
    });
  });

  it("rejects MINIMAL on every Gemini 4 model and gemini-3.8-flash", () => {
    for (const modelName of GEMINI_4_AND_3_8) {
      expect(schemas[modelName].config.schema.safeParse({ reasoningEffort: "MINIMAL" }).success).toBe(false);
      expect(() => createModel(modelName).transformConfig(Config().parse({ reasoningEffort: "MINIMAL" }))).toThrow(InvalidConfigError);
    }
  });

  it("accepts XHIGH only on gemini-4-neon and gemini-4-hydrogen", () => {
    // Only models exposing a thinking-level control are relevant (gemini-2.5-flash-lite has none).
    const withThinkingLevel = Object.keys(schemas).filter((name) => "reasoningEffort" in schemas[name].config.def);
    const accepted = withThinkingLevel.filter((name) => schemas[name].config.schema.safeParse({ reasoningEffort: "XHIGH" }).success);
    expect(accepted.sort()).toEqual(["gemini-4-hydrogen", "gemini-4-neon"]);
  });
});

describe("legacy reasoning config per-model thinking levels", () => {
  it.each(["gemini-3.1-pro-preview", "gemini-3.1-pro-preview-customtools"])("%s rejects MINIMAL and defaults to HIGH", (modelName) => {
    const schema = schemas[modelName];
    const def = schema.config.def.reasoningEffort as SelectStringConfigItemDefType;
    expect(def.choices).toEqual(["LOW", "MEDIUM", "HIGH"]);
    expect(def.default).toBe("HIGH");
    expect(schema.config.schema.safeParse({ reasoningEffort: "MINIMAL" }).success).toBe(false);
    expect(() => createModel(modelName).transformConfig(Config().parse({ reasoningEffort: "MINIMAL" }))).toThrow(InvalidConfigError);
    expect(generationConfig(modelName, { reasoningEffort: "HIGH" }).thinkingConfig).toEqual({
      thinkingLevel: "HIGH",
    });
  });

  it.each([
    ["gemini-3.1-flash-lite", "MINIMAL"],
    ["gemini-3-flash-preview", "HIGH"],
    ["gemini-3.5-flash", "LOW"],
  ])("%s defaults the thinking level to %s", (modelName, expectedDefault) => {
    const def = schemas[modelName].config.def.reasoningEffort as SelectStringConfigItemDefType;
    expect(def.choices).toEqual(["MINIMAL", "LOW", "MEDIUM", "HIGH"]);
    expect(def.default).toBe(expectedDefault);
  });

  it("legacy models still accept temperature and thinkingBudget", () => {
    const transformed = generationConfig("gemini-3.1-flash-lite", { temperature: 0.5, maxReasoningTokens: 512 });
    expect(transformed.temperature).toBe(0.5);
    expect(transformed.thinkingConfig).toEqual({ thinkingBudget: 512 });
  });
});

// Realistic generateContent response from a Gemini 4 model with includeThoughts enabled.
const gemini4CompleteResponse = {
  candidates: [
    {
      content: {
        role: "model",
        parts: [
          { text: "**Evaluating the request**\n\nThe user wants the capital of France. This is a simple factual lookup.", thought: true },
          { text: "The capital of France is Paris.", thoughtSignature: "CiQB0e2Kb7f3sigBase64==" },
        ],
      },
      finishReason: "STOP",
      index: 0,
    },
  ],
  usageMetadata: {
    promptTokenCount: 9,
    candidatesTokenCount: 8,
    thoughtsTokenCount: 117,
    totalTokenCount: 134,
    promptTokensDetails: [{ modality: "TEXT", tokenCount: 9 }],
  },
  modelVersion: "gemini-4-neon",
  responseId: "mock-response-id",
};

describe("gemini-4 text generation (mocked generateContent)", () => {
  it("transformCompleteChatResponse returns text, reasoning and usage including thinking tokens", () => {
    const response = createModel("gemini-4-neon").transformCompleteChatResponse(gemini4CompleteResponse);

    expect(response.messages).toHaveLength(1);
    expect(response.messages[0].role).toBe(AssistantRoleLiteral);
    const [reasoning, text] = response.messages[0].content;
    expect(reasoning).toEqual({
      modality: "reasoning",
      value: {
        type: "thinking",
        thinking: "**Evaluating the request**\n\nThe user wants the capital of France. This is a simple factual lookup.",
        signature: "",
      },
    });
    expect(text).toEqual({ modality: "text", value: "The capital of France is Paris." });
    expect(response.usage).toEqual({ promptTokens: 9, completionTokens: 8 + 117, totalTokens: 134 });
  });

  it("builds a request whose generationConfig carries only thinkingLevel", async () => {
    const model = createModel("gemini-4-carbon");
    const data = await model.getCompleteChatData(Config().parse({ reasoningEffort: "HIGH", reasoningEnabled: true }), [
      { role: "user", content: [{ modality: "text", value: "Hi" }] },
    ]);
    expect(data.generation_config).toEqual({ thinkingConfig: { thinkingLevel: "HIGH", includeThoughts: true } });
    expect(JSON.stringify(data)).not.toContain("thinkingBudget");
    expect(JSON.stringify(data)).not.toContain("temperature");
  });
});

describe("gemini-4 streaming (mocked streamGenerateContent)", () => {
  // streamGenerateContent (no alt=sse) streams a JSON array: "[{...}" then ",\r\n{...}" ... then "]".
  const thoughtChunk = {
    candidates: [{ content: { role: "model", parts: [{ text: "Considering the question.", thought: true }] }, index: 0 }],
    usageMetadata: { promptTokenCount: 9, totalTokenCount: 49, thoughtsTokenCount: 40 },
    modelVersion: "gemini-4-hydrogen",
  };
  const textChunk1 = {
    candidates: [{ content: { role: "model", parts: [{ text: "The capital of " }] }, index: 0 }],
    usageMetadata: { promptTokenCount: 9, totalTokenCount: 49, thoughtsTokenCount: 40 },
    modelVersion: "gemini-4-hydrogen",
  };
  const finalChunk = {
    candidates: [{ content: { role: "model", parts: [{ text: "France is Paris." }] }, finishReason: "STOP", index: 0 }],
    usageMetadata: { promptTokenCount: 9, candidatesTokenCount: 8, thoughtsTokenCount: 40, totalTokenCount: 57 },
    modelVersion: "gemini-4-hydrogen",
  };

  it("transformStreamChatResponseChunk yields reasoning, partial text and final usage", async () => {
    const model = createModel("gemini-4-hydrogen");
    const wireChunks = [
      `[${JSON.stringify(thoughtChunk)}`,
      `,\r\n${JSON.stringify(textChunk1)}`,
      `,\r\n${JSON.stringify(finalChunk)}`,
      "]",
    ];

    let buffer = "";
    const partials = [];
    for (const wireChunk of wireChunks) {
      const results = await collectAsyncGenerator(model.transformStreamChatResponseChunk(wireChunk, buffer));
      for (const result of results) {
        partials.push(result.partialResponse);
        buffer = result.buffer;
      }
    }

    const messages = partials.flatMap((partial) => partial.partialMessages);
    expect(messages).toContainEqual(createPartialReasoningMessage(AssistantRoleLiteral, "Considering the question.", ""));
    const text = messages
      .filter((message) => message.partialContent.modality === "partial-text")
      .map((message) => (message.partialContent as { value: string }).value)
      .join("");
    expect(text).toBe("The capital of France is Paris.");
    expect(messages).toContainEqual(createPartialTextMessage(AssistantRoleLiteral, "The capital of "));

    const usages = partials.map((partial) => partial.usage).filter((usage) => usage !== undefined);
    expect(usages[usages.length - 1]).toEqual({ promptTokens: 9, completionTokens: 48, totalTokens: 57 });
  });

  it("transformProxyStreamChatResponseChunk handles alt=sse chunks", async () => {
    const model = createModel("gemini-4-hydrogen");
    const sse = `data: ${JSON.stringify(textChunk1)}\r\n\r\ndata: ${JSON.stringify(finalChunk)}\r\n\r\n`;
    const results = await collectAsyncGenerator(model.transformProxyStreamChatResponseChunk(sse, "", undefined, undefined, { alt: "sse" }));
    const messages = results.flatMap((result) => result.partialResponse.partialMessages);
    expect(messages).toEqual([
      createPartialTextMessage(AssistantRoleLiteral, "The capital of "),
      createPartialTextMessage(AssistantRoleLiteral, "France is Paris."),
    ]);
    const usage = results.map((result) => result.partialResponse.usage).filter((value) => value !== undefined);
    expect(usage[usage.length - 1]).toEqual({ promptTokens: 9, completionTokens: 48, totalTokens: 57 });
  });
});
