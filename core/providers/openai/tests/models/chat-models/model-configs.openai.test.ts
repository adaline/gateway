import { describe, expect, it } from "vitest";

import { OpenAI } from "../../../src";

describe("OpenAI model config definitions", () => {
  const provider = new OpenAI();
  const schemas = provider.chatModelSchemas();

  it("allows decimal temperatures for o4-mini", () => {
    const o4MiniSchema = schemas["o4-mini"];
    const temperatureDef = o4MiniSchema.config.def.temperature;

    expect(temperatureDef.min).toBe(0);
    expect(temperatureDef.max).toBe(2);
    expect(temperatureDef.step).toBe(0.01);
    expect(o4MiniSchema.config.schema.safeParse({ temperature: 0.7 }).success).toBe(true);
  });

  it("keeps o1 temperature fixed at 1.0", () => {
    const o1Schema = schemas.o1;
    const temperatureDef = o1Schema.config.def.temperature;

    expect(temperatureDef.min).toBe(1);
    expect(temperatureDef.max).toBe(1);
    expect(o1Schema.config.schema.safeParse({ temperature: 0.7 }).success).toBe(false);
  });

  it("exposes response format controls for chatgpt-5.2", () => {
    const chatgpt52Schema = schemas["chatgpt-5.2"];
    const responseFormatDef = chatgpt52Schema.config.def.responseFormat;

    expect(chatgpt52Schema.name).toBe("chatgpt-5.2");
    expect(responseFormatDef.type).toBe("select-string");
    expect(responseFormatDef.choices).toEqual(expect.arrayContaining(["text", "json_object", "json_schema"]));
  });

  it("does not expose function-calling or structured output controls for gpt-5-chat-latest", () => {
    const chatLatestSchema = schemas["gpt-5-chat-latest"];
    const parsed = chatLatestSchema.config.schema.parse({
      toolChoice: "auto",
      responseFormat: "json_schema",
    });

    expect(chatLatestSchema.config.def.toolChoice).toBeUndefined();
    expect(chatLatestSchema.config.def.responseFormat).toBeUndefined();
    expect(chatLatestSchema.config.def.responseSchema).toBeUndefined();
    expect((parsed as any).toolChoice).toBeUndefined();
    expect((parsed as any).responseFormat).toBeUndefined();
  });
});
