import { describe, expect, it, vi } from "vitest";

import { handleProxyCompleteChat } from "../../src/handlers/proxy-complete-chat/proxy-complete-chat.handler";

describe("handleProxyCompleteChat schema normalization", () => {
  it("sanitizes gemini response schema before provider request", async () => {
    let postedData: Record<string, unknown> | undefined;

    const client = {
      post: vi.fn(async (_url: string, data: Record<string, unknown>) => {
        postedData = data;
        return {
          data: { candidates: [] },
          headers: {},
          status: { code: 200, text: "OK" },
        };
      }),
    } as any;

    const model = {
      modelSchema: { name: "gemini-2.5-flash" },
      getProxyCompleteChatUrl: vi
        .fn()
        .mockResolvedValue("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"),
      getProxyCompleteChatHeaders: vi.fn().mockResolvedValue({}),
      transformCompleteChatResponse: vi.fn(() => {
        throw new Error("not needed for this test");
      }),
    } as any;

    await handleProxyCompleteChat(
      {
        model,
        data: {
          generation_config: {
            response_mime_type: "application/json",
            response_schema: {
              strict: true,
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      label: { type: "string" },
                      question: { type: "string" },
                    },
                    additionalProperties: false,
                  },
                },
              },
              additionalProperties: false,
            },
          },
        },
        headers: {},
      },
      client
    );

    expect(postedData).toBeDefined();
    expect(postedData?.["generation_config"]).toBeDefined();
    const responseSchema = (postedData?.["generation_config"] as Record<string, any>).response_schema as Record<string, any>;
    expect(responseSchema.strict).toBeUndefined();
    expect(responseSchema.additionalProperties).toBeUndefined();
    expect(responseSchema.properties.questions.items.additionalProperties).toBeUndefined();
  });
});
