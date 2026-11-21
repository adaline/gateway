import { describe, expect, it } from "vitest";

import {
  GPT_6_1_SolSchema as OpenAI_GPT_6_1_SolSchema,
  GPT_6_1_TerraSchema as OpenAI_GPT_6_1_TerraSchema,
  GPT_6_AstraSchema as OpenAI_GPT_6_AstraSchema,
  GPT_6_LunaSchema as OpenAI_GPT_6_LunaSchema,
  GPT_6_SolSchema as OpenAI_GPT_6_SolSchema,
} from "@adaline/openai";
import { ChatModelSchemaType } from "@adaline/provider";

import * as AzureModels from "../../../src/models";

const options = { apiKey: "test-api-key", deploymentId: "my-deployment", resourceName: "test-resource" };

type WrapperCase = [
  literal: string,
  ctor: new (opts: typeof options) => AzureModels.BaseChatModelOpenAI,
  schema: ChatModelSchemaType,
  azureLiteral: string,
  openaiSchema: ChatModelSchemaType,
];

const gpt6Wrappers: WrapperCase[] = [
  ["gpt-6-astra", AzureModels.GPT_6_Astra, AzureModels.GPT_6_AstraSchema, AzureModels.GPT_6_AstraLiteral, OpenAI_GPT_6_AstraSchema],
  ["gpt-6-sol", AzureModels.GPT_6_Sol, AzureModels.GPT_6_SolSchema, AzureModels.GPT_6_SolLiteral, OpenAI_GPT_6_SolSchema],
  ["gpt-6-luna", AzureModels.GPT_6_Luna, AzureModels.GPT_6_LunaSchema, AzureModels.GPT_6_LunaLiteral, OpenAI_GPT_6_LunaSchema],
  ["gpt-6.1-sol", AzureModels.GPT_6_1_Sol, AzureModels.GPT_6_1_SolSchema, AzureModels.GPT_6_1_SolLiteral, OpenAI_GPT_6_1_SolSchema],
  [
    "gpt-6.1-terra",
    AzureModels.GPT_6_1_Terra,
    AzureModels.GPT_6_1_TerraSchema,
    AzureModels.GPT_6_1_TerraLiteral,
    OpenAI_GPT_6_1_TerraSchema,
  ],
];

describe("Azure GPT-6 wrappers", () => {
  it.each(gpt6Wrappers)("%s constructs and exposes the @adaline/openai schema", (literal, Ctor, schema, azureLiteral, openaiSchema) => {
    expect(azureLiteral).toBe(literal);
    expect(schema).toBe(openaiSchema);
    expect(schema.name).toBe(literal);
    expect(schema.maxInputTokens).toBe(922000);
    expect(schema.maxOutputTokens).toBe(128000);

    const model = new Ctor(options);
    expect(model).toBeInstanceOf(AzureModels.BaseChatModelOpenAI);
    expect(model.modelSchema).toBe(openaiSchema);
    expect(model.deploymentId).toBe("my-deployment");
    expect(model.getDefaultBaseUrl()).toBe("https://test-resource.openai.azure.com/openai/deployments/my-deployment");
  });

  // Mirrors the existing gpt-5.4-pro / gpt-5-pro wrappers: no forceResponsesApi, so requests go to the
  // deployment's chat/completions URL (see PR "Known issues / follow-up" for the Azure transport gap).
  it.each(gpt6Wrappers)("%s routes to the deployment chat/completions URL like the other Azure wrappers", async (_literal, Ctor) => {
    const model = new Ctor(options);
    const expected = "https://test-resource.openai.azure.com/openai/deployments/my-deployment/chat/completions?api-version=2024-06-01";
    expect(await model.getCompleteChatUrl({})).toBe(expected);
    expect(await model.getStreamChatUrl({})).toBe(expected);
    const existing = new AzureModels.GPT_5_4_Pro(options);
    expect(await existing.getCompleteChatUrl({})).toBe(expected);
  });

  it("does not wrap gpt-6.2-astra or gpt-6.2-sol (no Azure price meters yet)", () => {
    const exported = AzureModels as Record<string, unknown>;
    expect(exported.GPT_6_2_Astra).toBeUndefined();
    expect(exported.GPT_6_2_Sol).toBeUndefined();
  });
});

describe("Azure removed wrappers", () => {
  const removedExports = [
    "O1",
    "O1_2024_12_17",
    "O3",
    "O3_2025_04_16",
    "O3Mini",
    "O3Mini2025_01_31",
    "O3Pro",
    "O4_Mini",
    "O4_Mini_2025_04_16",
    "GPT_4_Turbo_2024_04_09",
  ];

  it.each(removedExports)("%s is no longer exported (class, schema, literal)", (name) => {
    const exported = AzureModels as Record<string, unknown>;
    expect(exported[name]).toBeUndefined();
    expect(exported[`${name}Schema`]).toBeUndefined();
    expect(exported[`${name}Literal`]).toBeUndefined();
  });

  it("keeps the wrappers for schemas retired on OpenAI but still served by Azure", () => {
    expect(AzureModels.GPT_4_1_NanoSchema.name).toBe("gpt-4.1-nano");
    expect(AzureModels.GPT_4o_2024_05_13Schema.name).toBe("gpt-4o-2024-05-13");
    expect(AzureModels.GPT_5_2_CodexSchema.name).toBe("gpt-5.2-codex");
    expect(new AzureModels.GPT_4_1_Nano(options)).toBeInstanceOf(AzureModels.BaseChatModelOpenAI);
  });
});
