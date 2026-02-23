type ProviderSchemaTarget = "gemini" | "vertex" | "openai" | "azure" | "other";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const removeAdditionalPropertiesRecursively = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => removeAdditionalPropertiesRecursively(item));
  }

  if (!isRecord(value)) {
    return value;
  }

  const result: Record<string, unknown> = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    if (key === "additionalProperties") {
      continue;
    }
    result[key] = removeAdditionalPropertiesRecursively(nestedValue);
  }

  return result;
};

const getResponseFormatType = (payload: Record<string, unknown>): string | undefined => {
  const responseFormat = payload.response_format ?? payload.responseFormat;

  if (typeof responseFormat === "string") {
    return responseFormat;
  }

  if (isRecord(responseFormat) && typeof responseFormat.type === "string") {
    return responseFormat.type;
  }

  return undefined;
};

const removeSchemaFromPayload = (payload: Record<string, unknown>): Record<string, unknown> => {
  const result: Record<string, unknown> = { ...payload };

  delete result.response_schema;
  delete result.responseSchema;

  if (isRecord(result.response_format)) {
    const nextResponseFormat = { ...result.response_format };
    delete nextResponseFormat.json_schema;
    delete nextResponseFormat.jsonSchema;
    result.response_format = nextResponseFormat;
  }

  if (isRecord(result.responseFormat)) {
    const nextResponseFormat = { ...result.responseFormat };
    delete nextResponseFormat.json_schema;
    delete nextResponseFormat.jsonSchema;
    result.responseFormat = nextResponseFormat;
  }

  if (isRecord(result.generation_config)) {
    const nextGenerationConfig = { ...result.generation_config };
    delete nextGenerationConfig.response_schema;
    delete nextGenerationConfig.responseSchema;
    result.generation_config = nextGenerationConfig;
  }

  if (isRecord(result.generationConfig)) {
    const nextGenerationConfig = { ...result.generationConfig };
    delete nextGenerationConfig.response_schema;
    delete nextGenerationConfig.responseSchema;
    result.generationConfig = nextGenerationConfig;
  }

  return result;
};

const sanitizeGeminiResponseSchemaObject = (schemaObject: Record<string, unknown>): Record<string, unknown> => {
  const { strict: _strict, ...rest } = schemaObject;
  if (isRecord(rest.schema)) {
    return {
      ...rest,
      schema: removeAdditionalPropertiesRecursively(rest.schema),
    };
  }

  return removeAdditionalPropertiesRecursively(rest) as Record<string, unknown>;
};

const sanitizeGeminiVertexPayload = (payload: Record<string, unknown>): Record<string, unknown> => {
  const responseFormatType = getResponseFormatType(payload);
  if (responseFormatType !== undefined && responseFormatType !== "json_schema") {
    return removeSchemaFromPayload(payload);
  }

  const result: Record<string, unknown> = { ...payload };

  if (isRecord(result.response_schema)) {
    result.response_schema = sanitizeGeminiResponseSchemaObject(result.response_schema);
  }

  if (isRecord(result.responseSchema)) {
    result.responseSchema = sanitizeGeminiResponseSchemaObject(result.responseSchema);
  }

  if (isRecord(result.response_format)) {
    const nextResponseFormat = { ...result.response_format };
    if (isRecord(nextResponseFormat.json_schema)) {
      nextResponseFormat.json_schema = sanitizeGeminiResponseSchemaObject(nextResponseFormat.json_schema);
    }
    if (isRecord(nextResponseFormat.jsonSchema)) {
      nextResponseFormat.jsonSchema = sanitizeGeminiResponseSchemaObject(nextResponseFormat.jsonSchema);
    }
    result.response_format = nextResponseFormat;
  }

  if (isRecord(result.responseFormat)) {
    const nextResponseFormat = { ...result.responseFormat };
    if (isRecord(nextResponseFormat.json_schema)) {
      nextResponseFormat.json_schema = sanitizeGeminiResponseSchemaObject(nextResponseFormat.json_schema);
    }
    if (isRecord(nextResponseFormat.jsonSchema)) {
      nextResponseFormat.jsonSchema = sanitizeGeminiResponseSchemaObject(nextResponseFormat.jsonSchema);
    }
    result.responseFormat = nextResponseFormat;
  }

  if (isRecord(result.generation_config)) {
    const nextGenerationConfig = { ...result.generation_config };
    if (isRecord(nextGenerationConfig.response_schema)) {
      nextGenerationConfig.response_schema = sanitizeGeminiResponseSchemaObject(nextGenerationConfig.response_schema);
    }
    if (isRecord(nextGenerationConfig.responseSchema)) {
      nextGenerationConfig.responseSchema = sanitizeGeminiResponseSchemaObject(nextGenerationConfig.responseSchema);
    }
    result.generation_config = nextGenerationConfig;
  }

  if (isRecord(result.generationConfig)) {
    const nextGenerationConfig = { ...result.generationConfig };
    if (isRecord(nextGenerationConfig.response_schema)) {
      nextGenerationConfig.response_schema = sanitizeGeminiResponseSchemaObject(nextGenerationConfig.response_schema);
    }
    if (isRecord(nextGenerationConfig.responseSchema)) {
      nextGenerationConfig.responseSchema = sanitizeGeminiResponseSchemaObject(nextGenerationConfig.responseSchema);
    }
    result.generationConfig = nextGenerationConfig;
  }

  return result;
};

const enforceOpenAIStrictJsonSchema = (payload: Record<string, unknown>): Record<string, unknown> => {
  const responseFormatType = getResponseFormatType(payload);
  if (responseFormatType !== "json_schema") {
    return removeSchemaFromPayload(payload);
  }

  const result: Record<string, unknown> = { ...payload };

  if (isRecord(result.response_schema)) {
    result.response_schema = { ...result.response_schema, strict: true };
  }

  if (isRecord(result.responseSchema)) {
    result.responseSchema = { ...result.responseSchema, strict: true };
  }

  if (isRecord(result.response_format)) {
    const nextResponseFormat = { ...result.response_format };
    if (isRecord(nextResponseFormat.json_schema)) {
      nextResponseFormat.json_schema = { ...nextResponseFormat.json_schema, strict: true };
    }
    if (isRecord(nextResponseFormat.jsonSchema)) {
      nextResponseFormat.jsonSchema = { ...nextResponseFormat.jsonSchema, strict: true };
    }
    result.response_format = nextResponseFormat;
  }

  if (isRecord(result.responseFormat)) {
    const nextResponseFormat = { ...result.responseFormat };
    if (isRecord(nextResponseFormat.json_schema)) {
      nextResponseFormat.json_schema = { ...nextResponseFormat.json_schema, strict: true };
    }
    if (isRecord(nextResponseFormat.jsonSchema)) {
      nextResponseFormat.jsonSchema = { ...nextResponseFormat.jsonSchema, strict: true };
    }
    result.responseFormat = nextResponseFormat;
  }

  return result;
};

const normalizeProviderResponseSchemaPayload = (payload: unknown, target: ProviderSchemaTarget): unknown => {
  if (!isRecord(payload)) {
    return payload;
  }

  if (target === "gemini" || target === "vertex") {
    return sanitizeGeminiVertexPayload(payload);
  }

  if (target === "openai" || target === "azure") {
    return enforceOpenAIStrictJsonSchema(payload);
  }

  return payload;
};

const inferProviderSchemaTargetFromUrl = (url: string): ProviderSchemaTarget => {
  try {
    const parsedUrl = new URL(url);
    const host = parsedUrl.hostname.toLowerCase();
    const path = parsedUrl.pathname.toLowerCase();

    if (host.includes("aiplatform.googleapis.com")) {
      return "vertex";
    }

    if (host.includes("generativelanguage.googleapis.com")) {
      return "gemini";
    }

    if (host.includes("azure.com") && path.includes("/openai/")) {
      return "azure";
    }

    if (host.includes("openai.com")) {
      return "openai";
    }
  } catch {
    return "other";
  }

  return "other";
};

const normalizeProviderResponseSchemaByUrl = (payload: unknown, url: string): unknown => {
  const target = inferProviderSchemaTargetFromUrl(url);
  return normalizeProviderResponseSchemaPayload(payload, target);
};

export {
  inferProviderSchemaTargetFromUrl,
  normalizeProviderResponseSchemaByUrl,
  normalizeProviderResponseSchemaPayload,
  type ProviderSchemaTarget,
};
