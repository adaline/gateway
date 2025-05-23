# Adaline Gateway

[![npm](https://img.shields.io/npm/v/@adaline/gateway)](https://npmjs.com/package/@adaline/gateway)
[![npm](https://img.shields.io/npm/dm/@adaline/gateway)](https://npmjs.com/package/@adaline/gateway)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/@adaline/gateway)
[![License](https://img.shields.io/github/license/Ileriayo/markdown-badges)](./LICENSE)

The only fully local, production-grade Super SDK that provides a simple, unified, and powerful interface for calling more than 300+ LLMs.

- Production-ready and trusted by enterprises
- Fully local and _NOT_ a proxy - deploy it anywhere
- Built-in batching, retries, caching, callbacks, and OpenTelemetry support
- Extensible with custom plugins for caching, logging, HTTP clients, and more - use it like building blocks to integrate with your infrastructure
- Supports plug-and-play providers - run fully custom providers while leveraging all the benefits of Adaline Gateway

### Features

- 🔧 Strongly typed in TypeScript
- 📦 Isomorphic - works everywhere
- 🔒 100% local, private, and _NOT_ a proxy
- 🛠️ Tool calling support across all compatible LLMs
- 📊 Batching for all requests with custom queue support
- 🔄 Automatic retries with exponential backoff
- ⏳ Caching with custom cache plug-in support
- 📞 Callbacks for comprehensive instrumentation and hooks
- 🔍 OpenTelemetry integration for existing infrastructure
- 🔌 Plug-and-play custom providers for local and custom models

### Providers

| Provider              | Chat Models     | Embedding Models  |
| --------------------- | --------------- | ------------------|
| OpenAI                | ✅              | ✅                |
| Anthropic             | ✅              | ❌                |
| Google AI Studio      | ✅              | ❌                |
| Google Vertex         | ✅              | ✅                |
| AWS Bedrock           | ✅              | ❌                |
| Azure OpenAI          | ✅              | ✅                |
| Groq                  | ✅              | ❌                |
| Together AI           | ✅              | ❌                |
| Open Router           | ✅              | ❌                |
| Custom (OpenAI-like)  | ✅              | ❌                |
| Voyage                | ❌              | ✅                |


## Installation

### Core packages

```bash
npm install @adaline/gateway @adaline/types
```

### Provider packages

Dependencies for providers are optional. You can install them as needed. For example:

```bash
npm install @adaline/openai @adaline/anthropic @adaline/google @adaline/open-router @adaline/bedrock
```

## Quickstart

### Chat

This example demonstrates how to invoke an LLM with a simple text prompt in both non-streaming and streaming modes.

```typescript
import { Gateway } from "@adaline/gateway";
import { OpenAI } from "@adaline/openai";
import { Config, ConfigType, MessageType } from "@adaline/types";

const OPENAI_API_KEY = "your-api-key"; // Replace with your OpenAI API key

const gateway = new Gateway();
const openai = new OpenAI();

const gpt4o = openai.chatModel({
  modelName: "gpt-4o",
  apiKey: OPENAI_API_KEY,
});

const config: ConfigType = Config().parse({
  temperature: 0.7,
  maxTokens: 300,
});

const messages: MessageType[] = [
  {
    role: "system",
    content: [{
      modality: "text",
      value: "You are a helpful assistant. You are extremely concise.",
    }],
  },
  {
    role: "user",
    content: [{
      modality: "text",
      value: `What is ${Math.floor(Math.random() * 100) + 1} + ${Math.floor(Math.random() * 100) + 1}?`,
    }],
  },
];

// * Complete chat
async function runCompleteChat() {
  const completeChat = await gateway.completeChat({
    model: gpt4o,
    config,
    messages,
    tools: [],
  });
  console.log(completeChat.provider.request); // HTTP Request sent to Provider
  console.log(completeChat.provider.response); // HTTP Response from Provider
  console.log(completeChat.cached); // Whether the response was cached
  console.log(completeChat.latencyInMs); // Latency in milliseconds
  console.log(completeChat.request); // Request in Gateway types
  console.log(completeChat.response); // Response in Gateway types, E.g.:
  // {
  //   "messages": [
  //     {
  //       "role": "assistant",
  //       "content": [
  //         {
  //           "modality": "text",
  //           "value": "<some-text-returned-by-LLM>"
  //         }
  //       ]
  //     }
  //   ],
  //   "usage": {
  //     "promptTokens": 138,
  //     "completionTokens": 573,
  //     "totalTokens": 711
  //   },
  //   "logProbs": []
  // }
  //
}

runCompleteChat();

// * Stream chat
async function runStreamChat() {
  const streamChat = await gateway.streamChat({
    model: gpt4o,
    config,
    messages,
    tools: [],
  });

  for await (const chunk of streamChat) {
    console.log(chunk.response);
  }
}

runStreamChat();
```

### Word Embedding

This example demonstrates how to invoke an embedding model with text samples to generate word embeddings.

```typescript
import { Gateway } from "@adaline/gateway";
import { OpenAI } from "@adaline/openai";
import { Config, ConfigType, EmbeddingRequestsType } from "@adaline/types";

const OPENAI_API_KEY = "your-api-key"; // Replace with your OpenAI API key

const gateway = new Gateway();
const openai = new OpenAI();

const textEmbedding3Large = openai.embeddingModel({
  modelName: "text-embedding-3-large",
  apiKey: OPENAI_API_KEY,
});

const config: ConfigType = Config().parse({
  encodingFormat: "float",
  dimensions: 255,
});

  const embeddingRequests: EmbeddingRequestsType = {
    modality: "text",
    requests: [
      "Hello world",
      "When the going gets tough, the tough get going. Or the tough pivots",
    ],
  };

async function runWordEmbedding() {
  const wordEmbedding = await gateway.getEmbeddings({
    model: textEmbedding3Large,
    config,
    embeddingRequests,
  });
  console.log(wordEmbedding.response);
}

runWordEmbedding();
```

### List Supported Models

```typescript
import { OpenAI } from "@adaline/openai";

const openai = new OpenAI();

const openaiChatModels = openai.chatModelLiterals();
console.log(openaiChatModels); // Array of chat model names

const openaiEmbeddingModels = openai.embeddingModelLiterals();
console.log(openaiEmbeddingModels); // Array of embedding model names

const o4MiniSchema = openai.chatModelSchemas()["o4-mini"]; // Schema for the o4-mini chat model
console.log(o4MiniSchema.name);
console.log(o4MiniSchema.description);
console.log(o4MiniSchema.maxInputTokens);
console.log(o4MiniSchema.maxOutputTokens);
console.log(o4MiniSchema.roles);
console.log(o4MiniSchema.modalities);
console.log(o4MiniSchema.config); 
```

## Prompt Types

[@adaline/types](https://github.com/adaline/gateway/tree/main/packages/types) contains the core types used to build prompts and process LLM responses.

### Config

A `ConfigType` is used to configure parameters of an LLM for a request. The valid fields for `ConfigType` depend on the specific LLM being used. Refer to the documentation of the LLM provider for details. Gateway internally transforms the `ConfigType` to and from the LLM provider's schema.

**Note: `ConfigType` is a lenient and forgiving type; any unknown fields will be ignored during transformation.**

```typescript
// Example of a config
const config: ConfigType = Config().parse({
  temperature: 0.7,
  maxTokens: 1000,
  // Any unknown fields will be ignored
  unknownField: "This will be ignored"
});
```

The exact schema for `ConfigType` for each LLM can be found programmatically using the provider's SDK:

```typescript
import { OpenAI } from "@adaline/openai";

const openai = new OpenAI();

const o4MiniSchema = openai.chatModelSchemas()["o4-mini"];
console.log(o4MiniSchema.config.def); // Verbose description of the Config for this LLM
console.log(o4MiniSchema.config.schema); // Zod type to validate Config for this LLM
```

### Message

A `MessageType` is the core component of a prompt sent to the LLM provider and the response received from it. Gateway internally transforms the `MessageType` to and from the LLM provider's schema.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| role | RoleEnumType | The role of the message sender | Must be one of the defined roles |
| content | Array<ContentType> | Array of content items | Must contain at least one content item |

```typescript
// Example of a message
const message: MessageType = {
  role: "system",
  content: [
    {
      modality: "text",
      value: "Hello, how can I help you today?",
    }
  ]
};
```

```typescript
// Example of a message
const completeMessage: MessageType = {
  role: "assistant",
  content: [
    {
      modality: "text",
      value: "I've analyzed the image you sent and found the following information:",
    },
    {
      modality: "reasoning",
      value: {
        type: "thinking",
        thinking: "The image appears to contain a chart with quarterly sales data. I should point out the key trends.",
        signature: "reasoning-signature-456"
      },
    },
    {
      modality: "tool-call",
      index: 0,
      id: "call_987654321",
      name: "analyze_chart",
      arguments: '{"chart_type": "bar", "data_points": ["Q1", "Q2", "Q3", "Q4"]}',
    }
  ],
};
```

#### Role

A `RoleEnumType` is an enumeration of possible message roles. Gateway internally transforms these roles to and from the LLM provider's accepted roles. For example, the "assistant" role in Gateway will be transformed to the "model" role for Google's Gemini models.

| Value | Description |
|-------|-------------|
| system | Messages from the system |
| user | Messages from the user |
| assistant | Messages from the assistant |
| tool | Messages from a tool |

```typescript
// Example of a role
const role: RoleEnumType = "assistant";
```

#### Content

A `ContentType` is the core part of a message that contains the actual content (text, images, etc.) being sent to or received from the LLM provider.

#### Text Content

A `TextContentType` represents text content in a message being sent to or received from the LLM provider.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| modality | "text" | Indicates this is text content | Must be "text" |
| value | string | The text content | Any valid string |

```typescript
// Example of text content
const textContent: TextContentType = {
  modality: "text",
  value: "Hello, how can I help you today?"
};
```

#### Image Content

An `ImageContentType` represents image content in a message being sent to or received from the LLM provider.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| modality | "image" | Indicates this is image content | Must be "image" |
| detail | ImageContentDetailsLiteralType | The level of detail for processing the image | Must be "low", "medium", "high", or "auto" |
| value | ImageContentValueType | The image data | Must be either Base64 or URL type |

```typescript
// Example of base64 image content
const base64ImageContent: ImageContentType = {
  modality: "image",
  detail: "high",
  value: {
    type: "base64",
    base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    mediaType: "png"
  },
};

// Example of URL image content
const urlImageContent: ImageContentType = {
  modality: "image",
  detail: "medium",
  value: {
    type: "url",
    url: "https://example.com/image.jpg"
  },
};
```

The value field can be one of two types:

`Base64ImageContentValueType`:

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| type | "base64" | Indicates base64 encoding | Must be "base64" |
| base64 | string | Base64-encoded image data | Valid base64 string |
| mediaType | "png" \| "jpeg" \| "webp" \| "gif" | The image format | Must be one of the specified formats |

```typescript
// Example of base64 image content value
const base64ImageContent: Base64ImageContentValueType = {
  type: "base64",
  base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=",
  mediaType: "png"
};
```

`UrlImageContentValueType`:

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| type | "url" | Indicates URL reference | Must be "url" |
| url | string | URL pointing to the image | Valid URL string |

```typescript
// Example of URL image content value
const urlImageContent: UrlImageContentValueType = {
  type: "url",
  url: "https://example.com/image.png"
};
```

#### Tool Call Content

A `ToolCallContentType` represents a tool call in a message being sent to or received from the LLM provider.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| modality | "tool-call" | Indicates this is a tool call | Must be "tool-call" |
| index | number | The index of the tool call | Non-negative integer |
| id | string | Unique identifier for the tool call | Non-empty string |
| name | string | Name of the tool being called | Non-empty string |
| arguments | string | Arguments passed to the tool | Any valid string |

```typescript
// Example of tool call content
const toolCallContent: ToolCallContentType = {
  modality: "tool-call",
  index: 0,
  id: "call_123456789",
  name: "search_database",
  arguments: '{"query": "user information", "limit": 10}',
};
```

#### Tool Response Content

A `ToolResponseContentType` represents a tool response in a message being sent to or received from the LLM provider.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| modality | "tool-response" | Indicates this is a tool response | Must be "tool-response" |
| index | number | The index of the tool response | Non-negative integer |
| id | string | Unique identifier for the tool call | Non-empty string |
| name | string | Name of the tool that was called | Non-empty string |
| data | string | Response data from the tool | Any valid string |

```typescript
// Example of tool response content
const toolResponseContent: ToolResponseContentType = {
  modality: "tool-response",
  index: 0,
  id: "call_123456789",
  name: "search_database",
  data: '{"results": [{"id": 1, "name": "John Doe"}, {"id": 2, "name": "Jane Smith"}]}',
};
```

#### Reasoning Content

A `ReasoningContentType` represents reasoning content in a message being sent to or received from the LLM provider.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| modality | "reasoning" | Indicates this is reasoning content | Must be "reasoning" |
| value | ReasoningContentValueUnionType | The reasoning content | Must be a valid reasoning value type |

```typescript
// Example of reasoning content
const reasoningContent: ReasoningContentType = {
  modality: "reasoning",
  value: {
    type: "thinking",
    thinking: "I need to consider the user's request carefully...",
    signature: "reasoning-signature-123"
  },
  metadata: undefined
};

// Example of redacted reasoning content
const redactedReasoningContent: ReasoningContentType = {
  modality: "reasoning",
  value: {
    type: "redacted",
    data: "This reasoning has been redacted"
  },
  metadata: undefined
};
```

The `value` field can be one of two types:

`ReasoningContentValueType`:

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| type | "thinking" | Indicates thinking content | Must be "thinking" |
| thinking | string | The thinking/reasoning text | Any valid string |
| signature | string | A signature for the reasoning | Any valid string |

`RedactedReasoningContentValueType`:

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| type | "redacted" | Indicates redacted content | Must be "redacted" |
| data | string | The redacted data | Any valid string |


### Tool

A `ToolType` represents a tool being sent to the LLM provider.

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| type | "function" | Indicates this is a function tool | Must be "function" |
| definition | Object | Contains the schema of the function | Must contain a valid function schema |
| definition.schema | FunctionType | The function schema | Must be a valid function schema |

For a valid function schema, refer to [OpenAI Function Calling documentation](https://platform.openai.com/docs/guides/function-calling?api-mode=responses).

```typescript
// Example of a tool
const getWeatherTool: ToolType = {
  type: "function",
  definition: {
    schema: {
      name: "get_weather",
      description: "Get the current weather in a given location",
      parameters: {
        type: "object",
        properties: {
          location: {
            type: "string",
            description: "The city and state, e.g. San Francisco, CA"
          }
        },
        required: ["location"]
      }
    }
  }
};
```

```typescript
// Example of a tool
const searchDatabaseTool: ToolType = {
  type: "function",
  definition: {
    schema: {
      name: "search_database",
      description: "Search for records in the database",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query"
          },
          limit: {
            type: "number",
            description: "Maximum number of results to return",
            default: 10
          }
        },
        required: ["query"]
      }
    }
  }
};
```
----