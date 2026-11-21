import { z } from "zod";

import { Message, PartialMessage } from "./../message";

const ChatUsage = z.object({
  promptTokens: z.number().nonnegative(),
  completionTokens: z.number().nonnegative(),
  totalTokens: z.number().nonnegative(),
});
type ChatUsageType = z.infer<typeof ChatUsage>;

const ChatBaseLogProb = z.object({
  token: z.string(),
  logProb: z.number(),
  bytes: z.array(z.number().int()).nullable(),
});
type ChatBaseLogProbType = z.infer<typeof ChatBaseLogProb>;

const ChatLogProb = ChatBaseLogProb.extend({
  topLogProbs: z.array(ChatBaseLogProb),
});
type ChatLogProbType = z.infer<typeof ChatLogProb>;

const ChatLogProbs = z.array(ChatLogProb);
type ChatLogProbsType = z.infer<typeof ChatLogProbs>;

// Provider-reported reason the model stopped (e.g. Anthropic "end_turn", "max_tokens", "refusal").
// Lets callers tell a refusal apart from an ordinary completion.
const ChatStopReason = z.string();
type ChatStopReasonType = z.infer<typeof ChatStopReason>;

const ChatResponse = z.object({
  messages: z.array(Message()),
  usage: ChatUsage.optional(),
  logProbs: ChatLogProbs.optional(),
  stopReason: ChatStopReason.optional(),
});
type ChatResponseType = z.infer<typeof ChatResponse>;

const PartialChatUsage = z.object({
  promptTokens: z.number().nonnegative().optional(),
  completionTokens: z.number().nonnegative().optional(),
  totalTokens: z.number().nonnegative().optional(),
});

type PartialChatUsageType = z.infer<typeof PartialChatUsage>;

const PartialChatResponse = z.object({
  partialMessages: z.array(PartialMessage()),
  usage: PartialChatUsage.optional(),
  logProbs: ChatLogProbs.optional(),
  stopReason: ChatStopReason.optional(),
});
type PartialChatResponseType = z.infer<typeof PartialChatResponse>;

export {
  ChatBaseLogProb,
  ChatLogProb,
  ChatLogProbs,
  ChatResponse,
  ChatStopReason,
  ChatUsage,
  PartialChatResponse,
  PartialChatUsage,
  type ChatBaseLogProbType,
  type ChatLogProbsType,
  type ChatLogProbType,
  type ChatResponseType,
  type ChatStopReasonType,
  type ChatUsageType,
  type PartialChatResponseType,
  type PartialChatUsageType,
};
