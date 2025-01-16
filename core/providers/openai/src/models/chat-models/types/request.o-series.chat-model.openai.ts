import { z } from "zod";

import { OpenAIChatRequest } from "./request.chat-model.openai";

const OpenAIChatRequestReasoningEffortEnum = z.enum(["low", "medium", "high"]);

const OpenAIChatOSeriesRequest = OpenAIChatRequest.extend({
  reasoning_effort: OpenAIChatRequestReasoningEffortEnum.optional(),
});

type OpenAIChatOSeriesRequestType = z.infer<typeof OpenAIChatOSeriesRequest>;

export { OpenAIChatOSeriesRequest, type OpenAIChatOSeriesRequestType };
