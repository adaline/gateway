import {
  Base64ImageContentTypeLiteral,
  ContentType,
  ErrorContent,
  ErrorModalityLiteral,
  ImageContent,
  ImageContentDetailsLiteralType,
  ImageModalityLiteral,
  Message,
  MessageType,
  PartialContentType,
  PartialErrorContent,
  PartialErrorModalityLiteral,
  PartialMessage,
  PartialMessageType,
  PartialReasoningContent,
  PartialReasoningModalityLiteral,
  PartialSearchResultContent,
  PartialSearchResultModalityLiteral,
  PartialTextContent,
  PartialTextModalityLiteral,
  PartialToolCallContent,
  PartialToolCallModalityLiteral,
  PartialToolResponseContent,
  PartialToolResponseModalityLiteral,
  ReasoningContent,
  ReasoningContentTypeLiteral,
  ReasoningModalityLiteral,
  RedactedReasoningContentTypeLiteral,
  RoleEnumType,
  SafetyErrorTypeLiteral,
  SearchResultContent,
  SearchResultGoogleContentValueType,
  SearchResultGoogleTypeLiteral,
  SearchResultModalityLiteral,
  TextContent,
  TextModalityLiteral,
  ToolCallContent,
  ToolCallModalityLiteral,
  ToolResponseContent,
  ToolResponseModalityLiteral,
  UrlImageContentTypeLiteral,
} from "./../message";

const createTextContent = (content: string): ContentType => {
  return TextContent().parse({
    modality: TextModalityLiteral,
    value: content,
  });
};

const createToolCallContent = (index: number, id: string, name: string, args: string, serverName?: string, thoughtSignature?: string): ContentType => {
  return ToolCallContent().parse({
    modality: ToolCallModalityLiteral,
    index: index,
    id: id,
    name: name,
    arguments: args,
    serverName: serverName,
    thoughtSignature: thoughtSignature,
  });
};

const createToolResponseContent = (
  index: number,
  id: string,
  name: string,
  data: string,
  apiResponse?: { statusCode: number },
  metadata?: any
): ContentType => {
  return ToolResponseContent().parse({
    modality: ToolResponseModalityLiteral,
    index: index,
    id: id,
    name: name,
    data: data,
    apiResponse: apiResponse,
    metadata: metadata,
  });
};

const createTextMessage = (role: RoleEnumType, content: string): MessageType => {
  return Message().parse({
    role: role,
    content: [
      TextContent().parse({
        modality: TextModalityLiteral,
        value: content,
      }),
    ],
  });
};

const createUrlImageMessage = (role: RoleEnumType, url: string, detail: ImageContentDetailsLiteralType): MessageType => {
  return Message().parse({
    role: role,
    content: [
      ImageContent().parse({
        modality: ImageModalityLiteral,
        detail: detail,
        value: {
          type: UrlImageContentTypeLiteral,
          url: url,
        },
      }),
    ],
  });
};

const createBase64ImageMessage = (role: RoleEnumType, base64: string, detail: ImageContentDetailsLiteralType): MessageType => {
  return Message().parse({
    role: role,
    content: [
      ImageContent().parse({
        modality: ImageModalityLiteral,
        detail: detail,
        value: {
          type: Base64ImageContentTypeLiteral,
          base64: base64,
        },
      }),
    ],
  });
};

const createToolCallMessage = (role: RoleEnumType, index: number, id: string, name: string, args: string, thoughtSignature?: string): MessageType => {
  return Message().parse({
    role: role,
    content: [
      ToolCallContent().parse({
        modality: ToolCallModalityLiteral,
        index: index,
        id: id,
        name: name,
        arguments: args,
        thoughtSignature: thoughtSignature,
      }),
    ],
  });
};

const createToolResponseMessage = (role: RoleEnumType, index: number, id: string, name: string, data: string): MessageType => {
  return Message().parse({
    role: role,
    content: [
      ToolResponseContent().parse({
        modality: ToolResponseModalityLiteral,
        index: index,
        id: id,
        name: name,
        data: data,
      }),
    ],
  });
};

const createPartialTextMessage = (role: RoleEnumType, content: string): PartialMessageType => {
  return PartialMessage().parse({
    role: role,
    partialContent: PartialTextContent().parse({
      modality: PartialTextModalityLiteral,
      value: content,
    }),
  });
};

const createPartialToolCallMessage = (
  role: RoleEnumType,
  index: number,
  id?: string,
  name?: string,
  args?: string,
  serverName?: string,
  thoughtSignature?: string
): PartialMessageType => {
  return PartialMessage().parse({
    role: role,
    partialContent: PartialToolCallContent().parse({
      modality: PartialToolCallModalityLiteral,
      index: index,
      id: id,
      name: name,
      arguments: args,
      serverName: serverName,
      thoughtSignature: thoughtSignature,
    }),
  });
};

const createPartialToolResponseMessage = (
  role: RoleEnumType,
  index: number,
  id: string,
  name: string,
  data: string
): PartialMessageType => {
  return PartialMessage().parse({
    role: role,
    partialContent: PartialToolResponseContent().parse({
      modality: PartialToolResponseModalityLiteral,
      index: index,
      id: id,
      name: name,
      data: data,
    }),
  });
};
const createReasoningContent = (thinking: string, signature: string): ContentType => {
  return ReasoningContent().parse({
    modality: ReasoningModalityLiteral,
    value: {
      type: ReasoningContentTypeLiteral,
      thinking,
      signature,
    },
  });
};

const createReasoningMessage = (role: RoleEnumType, thinking: string, signature: string): MessageType => {
  return Message().parse({
    role: role,
    content: [
      ReasoningContent().parse({
        modality: ReasoningModalityLiteral,
        value: {
          type: ReasoningContentTypeLiteral,
          thinking,
          signature,
        },
      }),
    ],
  });
};
// Redacted Reasoning Content
const createRedactedReasoningContent = (data: string): ContentType => {
  return ReasoningContent().parse({
    modality: ReasoningModalityLiteral,
    value: {
      type: RedactedReasoningContentTypeLiteral,
      data,
    },
  });
};

const createRedactedReasoningMessage = (role: RoleEnumType, data: string): MessageType => {
  return Message().parse({
    role: role,
    content: [
      ReasoningContent().parse({
        modality: ReasoningModalityLiteral,
        value: {
          type: RedactedReasoningContentTypeLiteral,
          data,
        },
      }),
    ],
  });
};

const createPartialReasoningMessage = (role: RoleEnumType, thinking?: string, signature?: string): PartialMessageType => {
  return PartialMessage().parse({
    role: role,
    partialContent: PartialReasoningContent().parse({
      modality: PartialReasoningModalityLiteral,
      value: {
        type: ReasoningContentTypeLiteral,
        thinking,
        signature,
      },
      // metadata is optional; omit or provide if needed
    }),
  });
};

// Create a partial redacted reasoning message
const createPartialRedactedReasoningMessage = (role: RoleEnumType, data: string): PartialMessageType => {
  return PartialMessage().parse({
    role: role,
    partialContent: PartialReasoningContent().parse({
      modality: PartialReasoningModalityLiteral,
      value: {
        type: RedactedReasoningContentTypeLiteral,
        data,
      },
      // metadata is optional; omit or provide if needed
    }),
  });
};

const createSafetyErrorContent = (category: string, probability: string, blocked: boolean, message: string): ContentType => {
  return ErrorContent().parse({
    modality: ErrorModalityLiteral,
    value: {
      type: SafetyErrorTypeLiteral,
      value: {
        category,
        probability,
        blocked,
        message,
      },
    },
  });
};

const createPartialSafetyErrorContent = (category?: string, probability?: string, blocked?: boolean, message?: string): PartialContentType => {
  return PartialErrorContent().parse({
    modality: PartialErrorModalityLiteral,
    value: {
      type: SafetyErrorTypeLiteral,
      category: category,
      probability: probability,
      blocked: blocked,
      message: message,
    },
  });
};

const createPartialSafetyErrorMessage = (
  role: RoleEnumType,
  category?: string,
  probability?: string,
  blocked?: boolean,
  message?: string
): PartialMessageType => {
  return PartialMessage().parse({
    role: role,
    partialContent: PartialErrorContent().parse({
      modality: PartialErrorModalityLiteral,
      value: {
        type: SafetyErrorTypeLiteral,
        category: category,
        probability: probability,
        blocked: blocked,
        message: message,
      },
    }),
  });
};

const createSearchResultGoogleContent = (query: string, responses: SearchResultGoogleContentValueType["responses"], references: SearchResultGoogleContentValueType["references"]): ContentType => {
  return SearchResultContent().parse({
    modality: SearchResultModalityLiteral,
    value: {
      type: SearchResultGoogleTypeLiteral,
      query,
      responses,
      references,
    },
  });
};

const createPartialSearchResultGoogleContent = (query?: string, responses?: SearchResultGoogleContentValueType["responses"], references?: SearchResultGoogleContentValueType["references"]): PartialContentType => {
  return PartialSearchResultContent().parse({
    modality: PartialSearchResultModalityLiteral,
    value: {
      type: SearchResultGoogleTypeLiteral,
      query: query,
      responses: responses,
      references: references,
    },
  });
};

const createPartialSearchResultGoogleMessage = (
  role: RoleEnumType,
  query?: string,
  responses?: SearchResultGoogleContentValueType["responses"],
  references?: SearchResultGoogleContentValueType["references"]
): PartialMessageType => {
  return PartialMessage().parse({
    role: role,
    partialContent: PartialSearchResultContent().parse({
      modality: PartialSearchResultModalityLiteral,
      value: {
        type: SearchResultGoogleTypeLiteral,
        query: query,
        responses: responses,
        references: references,
      },
    }),
  });
};

export {
  createBase64ImageMessage,
  createPartialReasoningMessage,
  createPartialRedactedReasoningMessage,
  createPartialSafetyErrorContent,
  createPartialSafetyErrorMessage,
  createPartialSearchResultGoogleContent,
  createPartialSearchResultGoogleMessage,
  createPartialTextMessage,
  createPartialToolCallMessage,
  createPartialToolResponseMessage,
  createReasoningContent,
  createReasoningMessage,
  createRedactedReasoningContent,
  createRedactedReasoningMessage,
  createSafetyErrorContent,
  createSearchResultGoogleContent,
  createTextContent,
  createTextMessage,
  createToolCallContent,
  createToolCallMessage,
  createToolResponseContent,
  createToolResponseMessage,
  createUrlImageMessage,
};
