import {
  Base64ImageContentTypeLiteral,
  ContentType,
  ImageContent,
  ImageContentDetailsLiteralType,
  ImageModalityLiteral,
  Message,
  MessageType,
  PartialMessage,
  PartialMessageType,
  PartialReasoningContent,
  PartialReasoningModalityLiteral,
  PartialTextContent,
  PartialTextModalityLiteral,
  PartialToolCallContent,
  PartialToolCallModalityLiteral,
  ReasoningContent,
  ReasoningContentTypeLiteral,
  ReasoningModalityLiteral,
  RedactedReasoningContentTypeLiteral,
  RoleEnumType,
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

const createToolCallContent = (index: number, id: string, name: string, args: string): ContentType => {
  return ToolCallContent().parse({
    modality: ToolCallModalityLiteral,
    index: index,
    id: id,
    name: name,
    arguments: args,
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

const createToolCallMessage = (role: RoleEnumType, index: number, id: string, name: string, args: string): MessageType => {
  return Message().parse({
    role: role,
    content: [
      ToolCallContent().parse({
        modality: ToolCallModalityLiteral,
        index: index,
        id: id,
        name: name,
        arguments: args,
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

const createPartialToolCallMessage = (role: RoleEnumType, index: number, id?: string, name?: string, args?: string): PartialMessageType => {
  return PartialMessage().parse({
    role: role,
    partialContent: PartialToolCallContent().parse({
      modality: PartialToolCallModalityLiteral,
      index: index,
      id: id,
      name: name,
      arguments: args,
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

export {
  createBase64ImageMessage,
  createPartialReasoningMessage,
  createPartialRedactedReasoningMessage,
  createPartialTextMessage,
  createPartialToolCallMessage,
  createReasoningContent,
  createReasoningMessage,
  createRedactedReasoningContent,
  createRedactedReasoningMessage,
  createTextContent,
  createTextMessage,
  createToolCallContent,
  createToolCallMessage,
  createToolResponseMessage,
  createUrlImageMessage,
};
