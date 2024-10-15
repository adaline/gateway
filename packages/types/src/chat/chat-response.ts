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

const ChatResponse = z.object({
  messages: z.array(Message()),
  usage: ChatUsage.optional(),
  logProbs: ChatLogProbs.optional(),
});
type ChatResponseType = z.infer<typeof ChatResponse>;

const PartialChatResponse = z.object({
  partialMessages: z.array(PartialMessage()),
  usage: ChatUsage.optional(),
  logProbs: ChatLogProbs.optional(),
});
type PartialChatResponseType = z.infer<typeof PartialChatResponse>;

export {
  ChatUsage,
  ChatBaseLogProb,
  ChatLogProb,
  ChatLogProbs,
  ChatResponse,
  PartialChatResponse,
  type ChatUsageType,
  type ChatBaseLogProbType,
  type ChatLogProbType,
  type ChatLogProbsType,
  type ChatResponseType,
  type PartialChatResponseType,
};
