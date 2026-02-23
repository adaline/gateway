import { describe, expect, it, vi } from "vitest";

import { handleProxyStreamChat } from "../../src/handlers/proxy-stream-chat/proxy-stream-chat.handler";

describe("handleProxyStreamChat schema normalization", () => {
  it("sanitizes gemini response schema before provider stream request", async () => {
    let streamedData: Record<string, unknown> | undefined;

    const client = {
      stream: vi.fn(async function* (_url: string, _method: string, data: Record<string, unknown>) {
        streamedData = data;
        yield "data: {}";
      }),
    } as any;

    const model = {
      modelSchema: { name: "gemini-2.5-flash" },
      getProxyStreamChatUrl: vi
        .fn()
        .mockResolvedValue("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent"),
      getProxyStreamChatHeaders: vi.fn().mockResolvedValue({}),
      transformProxyStreamChatResponseChunk: vi.fn(async function* (_chunk: string, buffer: string) {
        yield { partialResponse: { partialMessages: [] }, buffer };
      }),
    } as any;

    const iterator = handleProxyStreamChat(
      {
        model,
        data: {
          generation_config: {
            response_schema: {
              type: "object",
              properties: {
                questions: {
                  type: "array",
                  items: {
                    type: "object",
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

    await iterator.next();

    const responseSchema = (streamedData?.["generation_config"] as Record<string, any>).response_schema as Record<string, any>;
    expect(responseSchema.additionalProperties).toBeUndefined();
    expect(responseSchema.properties.questions.items.additionalProperties).toBeUndefined();
  });
});
