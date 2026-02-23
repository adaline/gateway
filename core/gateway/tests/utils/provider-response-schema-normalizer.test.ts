import { describe, expect, it } from "vitest";

import {
  inferProviderSchemaTargetFromUrl,
  normalizeProviderResponseSchemaPayload,
} from "../../src/utils/provider-response-schema-normalizer";

const hasKeyRecursively = (value: unknown, key: string): boolean => {
  if (Array.isArray(value)) {
    return value.some((item) => hasKeyRecursively(item, key));
  }

  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  if (key in record) {
    return true;
  }

  return Object.values(record).some((nested) => hasKeyRecursively(nested, key));
};

describe("provider response schema normalizer", () => {
  it("strips strict and nested additionalProperties for gemini", () => {
    const payload = {
      generation_config: {
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
    };

    const result = normalizeProviderResponseSchemaPayload(payload, "gemini") as Record<string, unknown>;

    expect(hasKeyRecursively(result, "additionalProperties")).toBe(false);
    expect(hasKeyRecursively(result, "strict")).toBe(false);
    expect((payload.generation_config.response_schema as Record<string, unknown>).additionalProperties).toBe(false);
  });

  it("strips strict and nested additionalProperties for vertex", () => {
    const payload = {
      generationConfig: {
        responseSchema: {
          strict: true,
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  label: { type: "string" },
                },
                additionalProperties: false,
              },
            },
          },
          additionalProperties: false,
        },
      },
    };

    const result = normalizeProviderResponseSchemaPayload(payload, "vertex");
    expect(hasKeyRecursively(result, "additionalProperties")).toBe(false);
    expect(hasKeyRecursively(result, "strict")).toBe(false);
  });

  it("preserves and enforces strict for openai/azure json_schema format", () => {
    const openaiPayload = {
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "qa",
          schema: { type: "object" },
        },
      },
    };
    const azurePayload = {
      responseFormat: {
        type: "json_schema",
        jsonSchema: {
          name: "qa",
          strict: false,
          schema: { type: "object" },
        },
      },
    };

    const openaiResult = normalizeProviderResponseSchemaPayload(openaiPayload, "openai") as Record<string, any>;
    const azureResult = normalizeProviderResponseSchemaPayload(azurePayload, "azure") as Record<string, any>;

    expect(openaiResult.response_format.json_schema.strict).toBe(true);
    expect(azureResult.responseFormat.jsonSchema.strict).toBe(true);
  });

  it("removes response schema when response format is not json_schema", () => {
    const payload = {
      response_format: {
        type: "text",
        json_schema: {
          name: "qa",
          strict: true,
          schema: { type: "object" },
        },
      },
      response_schema: {
        name: "qa",
        schema: { type: "object" },
      },
    };

    const result = normalizeProviderResponseSchemaPayload(payload, "openai") as Record<string, any>;
    expect(result.response_schema).toBeUndefined();
    expect(result.response_format.json_schema).toBeUndefined();
    expect(result.response_format.type).toBe("text");
  });

  it("is a no-op for unsupported providers", () => {
    const payload = {
      response_format: {
        type: "text",
      },
      randomSetting: {
        keep: true,
      },
    };

    const result = normalizeProviderResponseSchemaPayload(payload, "other");
    expect(result).toEqual(payload);
  });

  it("infers provider target from URL", () => {
    expect(inferProviderSchemaTargetFromUrl("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent")).toBe(
      "gemini"
    );
    expect(
      inferProviderSchemaTargetFromUrl(
        "https://us-central1-aiplatform.googleapis.com/v1/projects/p/locations/us-central1/publishers/google/models/gemini-2.5-pro:generateContent"
      )
    ).toBe("vertex");
    expect(inferProviderSchemaTargetFromUrl("https://api.openai.com/v1/chat/completions")).toBe("openai");
    expect(inferProviderSchemaTargetFromUrl("https://foo.openai.azure.com/openai/deployments/x/chat/completions")).toBe("azure");
  });
});
