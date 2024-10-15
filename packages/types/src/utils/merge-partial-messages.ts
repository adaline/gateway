import {
  AssistantRoleLiteral,
  MessageType,
  PartialMessageType,
  PartialTextContentType,
  PartialTextModalityLiteral,
  PartialToolCallContentType,
  PartialToolCallModalityLiteral,
  TextContentType,
  TextModalityLiteral,
  ToolCallContentType,
  ToolCallModalityLiteral,
} from "./../message";

// TODO: add role sense, currently just assumes 'assistant' role
// TODO: method and simplified and minified in implementation
const mergePartialMessages = (messages: MessageType[], partialMessages: PartialMessageType[]): MessageType[] => {
  if (partialMessages.length === 0) {
    return messages;
  }

  const mergedMessages: MessageType[] = messages;

  let lastMessageModality: typeof PartialTextModalityLiteral | typeof PartialToolCallModalityLiteral =
    partialMessages[0].partialContent.modality;

  let lastTextContent: PartialTextContentType = {
    modality: PartialTextModalityLiteral,
    value: "",
  };

  let lastToolCallContent: PartialToolCallContentType = {
    modality: PartialToolCallModalityLiteral,
    index: 0,
    id: "",
    name: "",
    arguments: "",
  };

  partialMessages.forEach((message) => {
    // last message and current message are of the same modality, merge them
    if (message.partialContent.modality === lastMessageModality) {
      // always merge text content
      if (message.partialContent.modality === PartialTextModalityLiteral) {
        lastTextContent.value += message.partialContent.value;
      } else if (message.partialContent.modality === PartialToolCallModalityLiteral) {
        // same tool call index, merge tool call index
        if (lastToolCallContent.index == message.partialContent.index) {
          lastToolCallContent.id += message.partialContent.id || "";
          lastToolCallContent.name += message.partialContent.name || "";
          lastToolCallContent.arguments += message.partialContent.arguments || "";
        } else {
          // different tool call index, push last tool call
          const toolCallContent: ToolCallContentType = {
            modality: ToolCallModalityLiteral,
            index: lastToolCallContent.index,
            id: lastToolCallContent.id as string,
            name: lastToolCallContent.name as string,
            arguments: lastToolCallContent.arguments as string,
          };
          mergedMessages.push({
            role: AssistantRoleLiteral,
            content: [toolCallContent],
          });
          // reset last tool call to current message
          lastToolCallContent = {
            modality: PartialToolCallModalityLiteral,
            index: message.partialContent.index,
            id: message.partialContent.id || "",
            name: message.partialContent.name || "",
            arguments: message.partialContent.arguments || "",
          };
        }
      }
    } else {
      // last message and current message are of different modalities, push last message
      if (lastMessageModality === PartialTextModalityLiteral) {
        const textContent: TextContentType = {
          modality: TextModalityLiteral,
          value: lastTextContent.value,
        };
        mergedMessages.push({
          role: AssistantRoleLiteral,
          content: [textContent],
        } as MessageType);
        // reset last text content to blank message
        lastTextContent = {
          modality: PartialTextModalityLiteral,
          value: "",
        };
      } else if (lastMessageModality === PartialToolCallModalityLiteral) {
        // push last tool call
        const toolCallContent: ToolCallContentType = {
          modality: ToolCallModalityLiteral,
          index: lastToolCallContent.index,
          id: lastToolCallContent.id as string,
          name: lastToolCallContent.name as string,
          arguments: lastToolCallContent.arguments as string,
        };
        mergedMessages.push({
          role: AssistantRoleLiteral,
          content: [toolCallContent],
        });
        // reset last tool call to blank message
        lastToolCallContent = {
          modality: PartialToolCallModalityLiteral,
          index: 0,
          id: "",
          name: "",
          arguments: "",
        };
      }

      // update last message modality and content
      lastMessageModality = message.partialContent.modality;
      if (message.partialContent.modality === PartialTextModalityLiteral) {
        lastTextContent.value += message.partialContent.value;
      } else if (message.partialContent.modality === PartialToolCallModalityLiteral) {
        lastToolCallContent = {
          modality: PartialToolCallModalityLiteral,
          index: message.partialContent.index,
          id: message.partialContent.id || "",
          name: message.partialContent.name || "",
          arguments: message.partialContent.arguments || "",
        };
      }
    }
  });

  if (lastMessageModality === PartialTextModalityLiteral) {
    const textContent: TextContentType = {
      modality: TextModalityLiteral,
      value: lastTextContent.value,
    };
    mergedMessages.push({
      role: AssistantRoleLiteral,
      content: [textContent],
    } as MessageType);
  } else if (lastMessageModality === PartialToolCallModalityLiteral) {
    // push last tool call
    const toolCallContent: ToolCallContentType = {
      modality: ToolCallModalityLiteral,
      index: lastToolCallContent.index,
      id: lastToolCallContent.id as string,
      name: lastToolCallContent.name as string,
      arguments: lastToolCallContent.arguments as string,
    };
    mergedMessages.push({
      role: AssistantRoleLiteral,
      content: [toolCallContent],
    });
  }

  return mergedMessages;
};

export { mergePartialMessages };
