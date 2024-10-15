import { Context } from "@opentelemetry/api";
import { z } from "zod";

import { type Cache } from "../cache";

type QueueTask<Request, Response> = {
  id: string;
  request: Request;
  cache: Cache<Response>;
  resolve: (value: Response) => void;
  reject: (error: any) => void;
  execute: (request: Request, context: Context) => Promise<Response>;
  telemetryContext: Context;
};

interface Queue<Request, Response> {
  enqueue(task: QueueTask<Request, Response>): void;
}

const QueueOptions = z.object({
  maxConcurrentTasks: z.number().int().positive(),
  retryCount: z.number().int().positive(),
  timeout: z.number().int().positive(),
  retry: z.object({
    initialDelay: z.number().int().positive(),
    exponentialFactor: z.number().int().positive(),
  }),
});
type QueueOptionsType = z.infer<typeof QueueOptions>;

export { QueueOptions, type Queue, type QueueOptionsType, type QueueTask };
