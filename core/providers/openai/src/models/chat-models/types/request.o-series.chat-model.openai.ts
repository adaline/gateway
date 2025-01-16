import { z } from "zod";

import { OpenAIChatRequest } from "./request.chat-model.openai";

const OpenAIChatOSeriesRequest = OpenAIChatRequest;

type OpenAIChatOSeriesRequestType = z.infer<typeof OpenAIChatOSeriesRequest>;

export { OpenAIChatOSeriesRequest, type OpenAIChatOSeriesRequestType };
