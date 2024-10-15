# Adaline Gateway

![npm bundle size](https://img.shields.io/bundlephobia/minzip/@adaline/gateway)
![npm type definitions](https://img.shields.io/npm/types/@adaline/gateway)
![ESLint](https://img.shields.io/badge/ESLint-passing-brightgreen.svg)
![NPM](https://img.shields.io/npm/l/@adaline/gateway)
[![NPM version](https://img.shields.io/npm/v/@adaline/gateway.svg)](https://npmjs.org/package/@adaline/gateway)

The only fully local production-grade Super SDK that provides a simple, unified, and powerful interface for calling more than 200+ LLMs.

- Production-ready and used by enterprises.
- Fully local and _NOT_ a proxy. You can deploy it anywhere.
- Comes with batching, retries, caching, callbacks, and OpenTelemetry support.
- Supports custom plugins for caching, logging, HTTP client, and more. You can use it like LEGOs and make it work with your infrastructure.
- Supports plug-and-play providers. You can run fully custom providers and still leverage all the benefits of Adaline Gateway.

## Features

- 🔧 Strongly typed in TypeScript
- 📦 Isomorphic - works everywhere
- 🔒 100% local and private and _NOT_ a proxy
- 🛠️ Tool calling support across all compatible LLMs
- 📊 Batching for all requests with custom queue support
- 🔄 Automatic retries with exponential backoff
- ⏳ Caching with custom cache plug-in support
- 📞 Callbacks for full custom instrumentation and hooks
- 🔍 OpenTelemetry to plug tracing into your existing infrastructure
- 🔌 Plug-and-play custom providers for local and custom models

## Quickstart

### Install packages

```bash
npm install @adaline/gateway @adaline/types @adaline/openai @adaline/anthropic
```

### Create a Gateway object

Gateway object maintains the queue, cache, callbacks, implements OpenTelemetry, etc. You should use the same Gateway object everywhere to get the benefits of all the features.

```typescript
import { Gateway } from "@adaline/gateway";

const gateway = new Gateway();
```

### Create a provider object

Provider object stores the types/information about all the models within that provider. It exposes the list of all the chat `openai.chatModelLiterals()` and embedding `openai.embeddingModelLiterals()` models.

```typescript
import { Anthropic } from "@adaline/anthropic";
import { OpenAI } from "@adaline/openai";

const openai = new OpenAI();
const anthropic = new Anthropic();
```

### Create a model object

Model object enforces the types from roles, to config, to different modalities that are supported by that model. You can also provide other keys like `baseUrl`, `organization`, etc.

Model object also exposes functions:

- `transformModelRequest` that takes a request formatted for the provider and converts it into the Adaline super-types.
- `getStreamChatData` that is then used to compose other provider calls. For example, calling an Anthropic model from Bedrock.
- and many more to enable deep composability and provide runtime validations.

```typescript
const gpt4o = openai.chatModel({
  modelName: "gpt-4o",
  apiKey: "your-api-key",
});

const haiku = anthropic.chatModel({
  modelName: "claude-3-haiku-20240307",
  apiKey: "your-api-key",
});
```

### Create the config object

Config object provides type checks and also accepts generics that can be used to add max, min, and other validation checks per model.

```typescript
import { Config } from "@adaline/types";

const config = Config().parse({
  maxTokens: 200,
  temperature: 0.9,
});
```

### Create the messages object

Message object is the Adaline super-type that supports all the roles and modalities across 200+ LLMs.

```typescript
import { MessageType } from "@adaline/types";

const messages: MessageType[] = [
  {
    role: "system",
    content: [{
      modality: "text",
      value: "You are a helpful assistant. You are extremely concise.
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
```

### Stream chat using Gateway

```typescript
await gateway.streamChat({
  model: gpt4o,
  config: config,
  messages: messages,
});
```

### Complete chat using Gateway

```typescript
await gateway.completeChat({
  model: haiku,
  config: config,
  messages: messages,
});
```
