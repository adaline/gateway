import { describe, expect, it } from "vitest";

import { InvalidConfigError, SelectStringConfigItemDefType } from "@adaline/provider";
import { AssistantRoleLiteral, Config, createPartialReasoningMessage, createPartialTextMessage } from "@adaline/types";

import { BaseChatModelVertex } from "../../../src/models";
import { Vertex } from "../../../src/provider";

async function collectAsyncGenerator<T>(generator: AsyncGenerator<T>): Promise<T[]> {
  const results: T[] = [];
  for await (const value of generator) {
    results.push(value);
  }
  return results;
}

const provider = new Vertex();
const schemas = provider.chatModelSchemas();
const createModel = (modelName: string) =>
  provider.chatModel({
    modelName,
    authType: "accessToken",
    accessToken: "test-access-token",
    location: "global",
    projectId: "test-project",
  }) as BaseChatModelVertex;
const generationConfig = (modelName: string, config: Record<string, unknown>) =>
  createModel(modelName).transformConfig(Config().parse(config)).generation_config as Record<string, unknown>;

const NEW_MODELS: Record<string, string[]> = {
  "gemini-4-argon": ["LOW", "MEDIUM", "HIGH"],
  "gemini-4-carbon": ["LOW", "MEDIUM", "HIGH"],
  "gemini-4-hydrogen": ["LOW", "MEDIUM", "HIGH", "XHIGH"],
  "gemini-4-neon": ["LOW", "MEDIUM", "HIGH", "XHIGH"],
  "gemini-3.8-flash": ["LOW", "MEDIUM", "HIGH"],
};

describe("Vertex Gemini 4 / 3.8 configs", () => {
  describe.each(Object.entries(NEW_MODELS))("%s", (modelName, levels) => {
    it("targets the Vertex generateContent endpoint", async () => {
      expect(await createModel(modelName).getCompleteChatUrl()).toBe(
        `https://global-aiplatform.googleapis.com/v1/projects/test-project/locations/global/publishers/google/models/${modelName}:generateContent`
      );
    });

    it.each(["temperature", "topP", "topK", "maxReasoningTokens", "thinkingBudget"])("never sends the '%s' key", (key) => {
      const transformed = JSON.stringify(createModel(modelName).transformConfig(Config().parse({ [key]: 1 })));
      for (const param of ["temperature", "topP", "topK", "thinkingBudget"]) {
        expect(transformed).not.toContain(param);
      }
    });

    it.each(["MINIMAL", "LOW", "MEDIUM", "HIGH", "XHIGH"])("accepts or rejects thinking level %s per model", (level) => {
      expect(schemas[modelName].config.schema.safeParse({ reasoningEffort: level }).success).toBe(levels.includes(level));
    });

    it("transformConfig emits thinkingConfig.thinkingLevel and never thinkingBudget", () => {
      const def = schemas[modelName].config.def.reasoningEffort as SelectStringConfigItemDefType;
      expect(def.choices).toEqual(levels);
      for (const level of levels) {
        const transformed = generationConfig(modelName, { reasoningEffort: level });
        expect(transformed.thinkingConfig).toEqual({ thinkingLevel: level });
        expect(JSON.stringify(transformed)).not.toContain("thinkingBudget");
      }
    });
  });

  it.each(["gemini-3.1-pro-preview", "gemini-3.1-pro-preview-customtools"])("%s rejects MINIMAL and defaults to HIGH", (modelName) => {
    const def = schemas[modelName].config.def.reasoningEffort as SelectStringConfigItemDefType;
    expect(def.choices).toEqual(["LOW", "MEDIUM", "HIGH"]);
    expect(def.default).toBe("HIGH");
    expect(() => createModel(modelName).transformConfig(Config().parse({ reasoningEffort: "MINIMAL" }))).toThrow(InvalidConfigError);
  });

  it("gemini-3.5-flash-lite inherits the Google thinking-level config (MINIMAL default)", () => {
    const def = schemas["gemini-3.5-flash-lite"].config.def.reasoningEffort as SelectStringConfigItemDefType;
    expect(def.choices).toEqual(["MINIMAL", "LOW", "MEDIUM", "HIGH"]);
    expect(def.default).toBe("MINIMAL");
    expect(schemas["gemini-3.5-flash-lite"].config.def).not.toHaveProperty("temperature");
  });
});

describe("Vertex gemini-4 text generation (mocked generateContent)", () => {
  it("transformCompleteChatResponse returns text, reasoning and usage including thinking tokens", () => {
    const response = createModel("gemini-4-argon").transformCompleteChatResponse({
      candidates: [
        {
          content: {
            role: "model",
            parts: [
              { text: "**Planning the answer**\n\nNeed to add 17 and 25.", thought: true },
              { text: "17 + 25 = 42.", thoughtSignature: "EpQCCpECAdHtim9sig==" },
            ],
          },
          finishReason: "STOP",
          avgLogprobs: -0.12,
        },
      ],
      usageMetadata: {
        promptTokenCount: 14,
        candidatesTokenCount: 9,
        thoughtsTokenCount: 211,
        totalTokenCount: 234,
        trafficType: "ON_DEMAND",
      },
      modelVersion: "gemini-4-argon",
      createTime: "2026-11-20T12:00:00.000000Z",
      responseId: "mock-vertex-response",
    });

    expect(response.messages).toHaveLength(1);
    expect(response.messages[0].content).toEqual([
      { modality: "reasoning", value: { type: "thinking", thinking: "**Planning the answer**\n\nNeed to add 17 and 25.", signature: "" } },
      { modality: "text", value: "17 + 25 = 42." },
    ]);
    expect(response.usage).toEqual({ promptTokens: 14, completionTokens: 220, totalTokens: 234 });
  });
});

describe("Vertex gemini-4 streaming (mocked streamGenerateContent)", () => {
  it("transformStreamChatResponseChunk yields partial text, reasoning and final usage", async () => {
    const model = createModel("gemini-4-neon");
    const chunks = [
      { candidates: [{ content: { role: "model", parts: [{ text: "Thinking it through.", thought: true }] } }] },
      { candidates: [{ content: { role: "model", parts: [{ text: "Hello " }] } }] },
      {
        candidates: [{ content: { role: "model", parts: [{ text: "world!" }] }, finishReason: "STOP" }],
        usageMetadata: { promptTokenCount: 5, candidatesTokenCount: 3, thoughtsTokenCount: 30, totalTokenCount: 38 },
      },
    ];
    const wire = [`[${JSON.stringify(chunks[0])}`, `,\r\n${JSON.stringify(chunks[1])}`, `,\r\n${JSON.stringify(chunks[2])}`, "]"];

    let buffer = "";
    const partials = [];
    for (const piece of wire) {
      for (const result of await collectAsyncGenerator(model.transformStreamChatResponseChunk(piece, buffer))) {
        partials.push(result.partialResponse);
        buffer = result.buffer;
      }
    }

    const messages = partials.flatMap((partial) => partial.partialMessages);
    expect(messages).toEqual([
      createPartialReasoningMessage(AssistantRoleLiteral, "Thinking it through.", ""),
      createPartialTextMessage(AssistantRoleLiteral, "Hello "),
      createPartialTextMessage(AssistantRoleLiteral, "world!"),
    ]);
    const usages = partials.map((partial) => partial.usage).filter((usage) => usage !== undefined);
    expect(usages).toEqual([{ promptTokens: 5, completionTokens: 33, totalTokens: 38 }]);
  });
});
