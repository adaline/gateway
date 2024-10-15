import { z } from "zod";

import { OpenAIChatRequest } from "./request.chat-model.openai";

const OpenAIChatOSeriesRequest = OpenAIChatRequest.omit({ max_tokens: true }).extend({
  max_completion_tokens: z.number().min(0).nullable().optional(),
});
type OpenAIChatOSeriesRequestType = z.infer<typeof OpenAIChatOSeriesRequest>;

export { OpenAIChatOSeriesRequest, type OpenAIChatOSeriesRequestType };
