import { ChatResponseType, ChatUsageType, PartialChatResponseType } from "./../chat/chat-response";
import {
  AssistantRoleLiteral,
  ContentType,
  MessageType,
  PartialContentType,
  PartialReasoningContentType,
  PartialReasoningModalityLiteral,
  PartialTextContentType,
  PartialTextModalityLiteral,
  PartialToolCallContentType,
  PartialToolCallModalityLiteral,
  ReasoningContentTypeLiteral,
  ReasoningContentValueUnionType,
  ReasoningModalityLiteral,
  RedactedReasoningContentTypeLiteral,
  TextModalityLiteral,
  ToolCallModalityLiteral,
} from "./../message";

const mergePartialMessages = (response: PartialChatResponseType[]): ChatResponseType => {
  let finalizedResponse: ChatResponseType = { messages: [] };

  if (!response || response.length === 0) {
    return finalizedResponse;
  }
  const mergedContents: ContentType[] = [];

  // Accumulators for the content *currently being streamed*
  let lastModality: PartialContentType["modality"] | null = null;
  let lastReasoningType: ReasoningContentValueUnionType["type"] | null = null; // Track 'thinking' vs 'redacted'
  let lastToolCallIndex: number | undefined = undefined;

  let currentTextValue: string | null = null;
  let currentToolCall: { index?: number; id: string; name: string; arguments: string } | null = null;
  let currentReasoning: PartialReasoningContentType["value"] | null = null; // Store the partial value directly

  // --- Helper Function to Finalize and Add the previous block ---
  const finalizePreviousBlock = () => {
    let finalizedContent: ContentType | null = null;

    if (lastModality === PartialTextModalityLiteral && currentTextValue !== null) {
      finalizedContent = {
        modality: TextModalityLiteral,
        value: currentTextValue,
      };
    } else if (lastModality === PartialToolCallModalityLiteral && currentToolCall) {
      // Ensure required fields are present for the final ToolCall
      if (currentToolCall.id && currentToolCall.name && currentToolCall.arguments !== undefined && currentToolCall.index) {
        finalizedContent = {
          modality: ToolCallModalityLiteral,
          index: currentToolCall.index,
          id: currentToolCall.id,
          name: currentToolCall.name,
          arguments: currentToolCall.arguments,
        };
      } else {
        console.warn("Incomplete tool call data encountered during finalization:", currentToolCall);
      }
    } else if (lastModality === PartialReasoningModalityLiteral && currentReasoning) {
      if (currentReasoning.type === ReasoningContentTypeLiteral) {
        if (currentReasoning.thinking !== undefined && currentReasoning.signature !== undefined) {
          finalizedContent = {
            modality: ReasoningModalityLiteral,
            value: {
              type: ReasoningContentTypeLiteral,
              thinking: currentReasoning.thinking,
              signature: currentReasoning.signature,
            },
          };
        } else {
          console.warn("Incomplete 'thinking' reasoning data encountered during finalization:", currentReasoning);
        }
      } else if (currentReasoning.type === RedactedReasoningContentTypeLiteral) {
        if (currentReasoning.data !== undefined) {
          finalizedContent = {
            modality: ReasoningModalityLiteral,
            value: {
              type: RedactedReasoningContentTypeLiteral,
              data: currentReasoning.data,
            },
          };
        } else {
          console.warn("Incomplete 'redacted' reasoning data encountered during finalization:", currentReasoning);
        }
      }
    }

    // If content was successfully finalized, add it as a separate message
    if (finalizedContent) {
      mergedContents.push(finalizedContent);
    }

    // Reset accumulators for the *next* block
    currentTextValue = null;
    currentToolCall = null;
    currentReasoning = null;
    lastModality = null; // Reset modality marker
    lastReasoningType = null; // Reset reasoning type marker
    lastToolCallIndex = undefined; // Reset tool call index marker
  };

  // --- Main Processing Loop ---
  response.forEach((chatChunk) => {
    if (!chatChunk.partialMessages) return;

    chatChunk.partialMessages.forEach((message) => {
      // Basic validation
      if (message.role !== AssistantRoleLiteral) {
        console.warn(`Skipping message with unexpected role: ${message.role}`);
        return;
      }

      const currentContent = message.partialContent;
      const currentModality = currentContent.modality;
      let currentReasoningType: ReasoningContentValueUnionType["type"] | null = null;
      let currentToolCallIndex: number | undefined = undefined;

      if (currentModality === PartialReasoningModalityLiteral) {
        currentReasoningType = (currentContent as PartialReasoningContentType).value.type;
      }
      if (currentModality === PartialToolCallModalityLiteral) {
        currentToolCallIndex = (currentContent as PartialToolCallContentType).index;
      }

      // --- Check for Block Change ---
      // A new block starts if:
      // 1. Modality changes.
      // 2. Modality is Reasoning, and the *type* of reasoning changes.
      // 3. Modality is ToolCall, and the *index* changes.
      const modalityChanged = currentModality !== lastModality;
      const reasoningTypeChanged =
        currentModality === PartialReasoningModalityLiteral &&
        lastModality === PartialReasoningModalityLiteral &&
        currentReasoningType !== lastReasoningType;
      const toolCallIndexChanged =
        currentModality === PartialToolCallModalityLiteral &&
        lastModality === PartialToolCallModalityLiteral &&
        currentToolCallIndex !== lastToolCallIndex;

      // If a boundary is detected and we were accumulating something, finalize the previous block.
      if ((modalityChanged || reasoningTypeChanged || toolCallIndexChanged) && lastModality !== null) {
        finalizePreviousBlock();
      }

      // --- Update State & Accumulate Current Part ---
      // Set the markers for the block *now* being processed
      if (lastModality === null) {
        // Only set if we just finalized or it's the first part
        lastModality = currentModality;
        if (currentModality === PartialReasoningModalityLiteral) {
          lastReasoningType = currentReasoningType;
        }
        if (currentModality === PartialToolCallModalityLiteral) {
          lastToolCallIndex = currentToolCallIndex;
        }
      }

      // Accumulate based on current modality
      if (currentModality === PartialTextModalityLiteral) {
        const textPart = currentContent as PartialTextContentType;
        currentTextValue = (currentTextValue ?? "") + (textPart.value ?? "");
      } else if (currentModality === PartialToolCallModalityLiteral) {
        const toolCallPart = currentContent as PartialToolCallContentType;
        if (!currentToolCall) {
          // Initialize if starting a new tool call block
          currentToolCall = {
            index: toolCallPart.index,
            id: toolCallPart.id ?? "",
            name: toolCallPart.name ?? "",
            arguments: toolCallPart.arguments ?? "",
          };
        } else {
          // Append to existing tool call block (same index)
          currentToolCall.id += toolCallPart.id || "";
          currentToolCall.name += toolCallPart.name || "";
          currentToolCall.arguments += toolCallPart.arguments || "";
        }
      } else if (currentModality === PartialReasoningModalityLiteral) {
        const reasoningPart = currentContent as PartialReasoningContentType;
        const valuePart = reasoningPart.value;

        if (!currentReasoning) {
          // Initialize if starting a new reasoning block
          if (valuePart.type === ReasoningContentTypeLiteral) {
            currentReasoning = {
              type: ReasoningContentTypeLiteral,
              thinking: valuePart.thinking ?? "",
              signature: valuePart.signature ?? "",
            };
          } else if (valuePart.type === RedactedReasoningContentTypeLiteral) {
            currentReasoning = {
              type: RedactedReasoningContentTypeLiteral,
              data: valuePart.data ?? "",
            };
          } else {
            console.warn("Unknown reasoning type encountered during initialization:", valuePart);
            finalizePreviousBlock();
            lastModality = null;
            return;
          }
        } else {
          // For redacted reasoning, do not accumulate subsequent parts;
          // finalize the existing block and start a new one.
          if (currentReasoning.type === RedactedReasoningContentTypeLiteral && valuePart.type === RedactedReasoningContentTypeLiteral) {
            finalizePreviousBlock();
            // Start a new redacted reasoning block immediately
            currentReasoning = {
              type: RedactedReasoningContentTypeLiteral,
              data: valuePart.data ?? "",
            };
            // Since we finalized, update the state markers accordingly
            lastModality = currentModality;
            lastReasoningType = valuePart.type;
          } else if (currentReasoning.type === ReasoningContentTypeLiteral && valuePart.type === ReasoningContentTypeLiteral) {
            // Accumulate for "thinking" type reasoning normally
            currentReasoning.thinking = (currentReasoning.thinking ?? "") + (valuePart.thinking ?? "");
            currentReasoning.signature = (currentReasoning.signature ?? "") + (valuePart.signature ?? "");
          } else {
            // This case shouldn't happen because a different reasoning type should have triggered finalization
            console.error(
              "Logic error: Mismatched reasoning types during accumulation. This should have been finalized.",
              currentReasoning,
              valuePart
            );
            finalizePreviousBlock();
            lastModality = currentModality;
            lastReasoningType = valuePart.type;
            if (valuePart.type === ReasoningContentTypeLiteral) {
              currentReasoning = {
                type: ReasoningContentTypeLiteral,
                thinking: valuePart.thinking ?? "",
                signature: valuePart.signature ?? "",
              };
            } else if (valuePart.type === RedactedReasoningContentTypeLiteral) {
              currentReasoning = { type: RedactedReasoningContentTypeLiteral, data: valuePart.data ?? "" };
            } else {
              currentReasoning = null;
              lastModality = null;
            }
          }
        }
      }
    });
  });

  // Finalize any remaining accumulated content after the loops finish
  finalizePreviousBlock();

  finalizedResponse.messages = [
    {
      role: AssistantRoleLiteral,
      content: mergedContents,
    },
  ] as MessageType[];

  // Usage
  // Initialize accumulators
  let firstPrompt: number | undefined;
  let lastPrompt: number | undefined;
  let totalCompletion = 0;
  let usageFound = false;

  const aggregatedUsage: ChatUsageType = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
  };

  for (const chunk of response) {
    const u = chunk.usage;
    if (!u) continue;

    usageFound = true;

    // Track first & last promptTokens
    if (u.promptTokens != null) {
      if (firstPrompt === undefined) {
        firstPrompt = u.promptTokens;
      }
      lastPrompt = u.promptTokens;
    }

    // Sum completionTokens
    if (u.completionTokens != null) {
      totalCompletion += u.completionTokens;
    }
  }

  if (usageFound) {
    // Use the latest promptTokens if we saw one, otherwise the first
    aggregatedUsage.promptTokens = lastPrompt ?? firstPrompt ?? 0;
    aggregatedUsage.completionTokens = totalCompletion;
    aggregatedUsage.totalTokens = aggregatedUsage.promptTokens + aggregatedUsage.completionTokens;

    finalizedResponse.usage = aggregatedUsage;
  } else {
    finalizedResponse.usage = undefined;
  }
  return finalizedResponse;
};

export { mergePartialMessages };
