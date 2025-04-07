// simple-queue.test.ts
import { context } from "@opentelemetry/api"; // Assuming these are needed for context propagation if not mocked
import { beforeEach, describe, expect, it, vi } from "vitest";

import { QueueTaskTimeoutError } from "../../../src/plugins/queue/queue.error";
import { QueueOptionsType, QueueTask } from "../../../src/plugins/queue/queue.interface";
import { SimpleQueue } from "../../../src/plugins/queue/simple.queue";
import { delay } from "../../../src/utils"; // Assuming path

const mockLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
const mockTracer = {
  startActiveSpan: vi.fn((name, fn) => {
    // Simulate span execution - call the function immediately
    const span = {
      setAttribute: vi.fn(),
      setStatus: vi.fn(),
      end: vi.fn(),
    };
    // @ts-ignore // Allow calling fn with span
    return fn(span);
  }),
};

vi.mock("./../logger", () => ({
  LoggerManager: {
    getLogger: () => mockLogger,
  },
}));

vi.mock("./../telemetry", () => ({
  TelemetryManager: {
    getTracer: () => mockTracer,
  },
}));

// We need a minimal definition for types used in the retry logic if not mocking it.
// These are placeholders. Replace with actual imports/definitions if needed for complex retry logic tests.
class MockHttpRequestError extends Error {
  cause: { status: number; headers?: any };
  constructor(message: string, status: number, headers?: any) {
    super(message);
    this.name = "HttpRequestError";
    this.cause = { status, headers };
  }
  static isHttpRequestError(error: any): error is MockHttpRequestError {
    return error instanceof MockHttpRequestError;
  }
}
const mockModel = {
  getRetryDelay: (headers: any) => ({ shouldRetry: true, delayMs: -1 }), // Default retry behavior
};
const MockGatewayCompleteChatRequest = {
  safeParse: (data: any) => ({ success: true, data: { ...data, model: mockModel } }),
};
vi.mock("./../http-client", () => ({ HttpRequestError: MockHttpRequestError })); // Assuming path
vi.mock("../../gateway.types", () => ({ GatewayCompleteChatRequest: MockGatewayCompleteChatRequest })); // Assuming path

// --- Test Suite ---

describe("SimpleQueue", () => {
  let defaultOptions: QueueOptionsType;

  beforeEach(() => {
    defaultOptions = {
      maxConcurrentTasks: 2,
      retryCount: 2,
      timeout: 500, // ms
      retry: {
        initialDelay: 50, // ms
        exponentialFactor: 2,
      },
    };
    // Reset mocks before each test if needed
    vi.clearAllMocks();
  });

  // Helper to create a task promise
  const createTaskPromise = <Req, Res>(
    queue: SimpleQueue<Req, Res>,
    taskDetails: Omit<QueueTask<Req, Res>, "resolve" | "reject" | "telemetryContext">
  ): Promise<Res> => {
    return new Promise<Res>((resolve, reject) => {
      const task: QueueTask<Req, Res> = {
        ...taskDetails,
        resolve,
        reject,
        telemetryContext: context.active(), // Get current context
      };
      queue.enqueue(task);
    });
  };

  it("should process a single task successfully", async () => {
    const queue = new SimpleQueue<string, string>(defaultOptions);
    const taskPayload = "task1_payload";
    const expectedResult = "task1_payload_result";

    const taskPromise = createTaskPromise(queue, {
      id: "task1",
      request: taskPayload,
      execute: async (req) => {
        await delay(10); // Simulate work
        return `${req}_result`;
      },
    });

    await expect(taskPromise).resolves.toBe(expectedResult);
  });

  it("should process tasks sequentially if maxConcurrentTasks is 1", async () => {
    const options = { ...defaultOptions, maxConcurrentTasks: 1 };
    const queue = new SimpleQueue<string, number>(options);
    const taskDurations = [50, 50]; // ms
    const startTime = Date.now();
    let task1EndTime = 0;
    let task2StartTime = 0;

    const task1Promise = createTaskPromise(queue, {
      id: "taskSeq1",
      request: "req1",
      execute: async () => {
        await delay(taskDurations[0]);
        task1EndTime = Date.now();
        return 1;
      },
    });

    const task2Promise = createTaskPromise(queue, {
      id: "taskSeq2",
      request: "req2",
      execute: async () => {
        task2StartTime = Date.now();
        await delay(taskDurations[1]);
        return 2;
      },
    });

    const results = await Promise.all([task1Promise, task2Promise]);

    expect(results).toEqual([1, 2]);
    // Task 2 should start only after Task 1 finishes (or very close to it)
    expect(task2StartTime).toBeGreaterThanOrEqual(task1EndTime);
    // Total time should be roughly sum of durations + overhead
    expect(Date.now() - startTime).toBeGreaterThanOrEqual(taskDurations[0] + taskDurations[1]);
  });

  it("should respect maxConcurrentTasks limit", async () => {
    const options = { ...defaultOptions, maxConcurrentTasks: 2 };
    const queue = new SimpleQueue<string, number>(options);
    const taskDuration = 100; // ms
    let runningTasks = 0;
    let maxRunningTasks = 0;

    const createTask = (id: string) =>
      createTaskPromise(queue, {
        id,
        request: id,
        execute: async () => {
          runningTasks++;
          maxRunningTasks = Math.max(maxRunningTasks, runningTasks);
          await delay(taskDuration);
          runningTasks--;
          return parseInt(id.slice(-1));
        },
      });

    const promises = [createTask("conc1"), createTask("conc2"), createTask("conc3"), createTask("conc4")];

    await Promise.all(promises);

    expect(maxRunningTasks).toBe(options.maxConcurrentTasks);
  });

  it("should reject a task if it times out", async () => {
    const options = { ...defaultOptions, timeout: 50 }; // Short timeout
    const queue = new SimpleQueue<string, string>(options);

    const taskPromise = createTaskPromise(queue, {
      id: "timeoutTask",
      request: "reqTimeout",
      execute: async () => {
        await delay(options.timeout + 50); // Ensure it exceeds timeout
        return "should_not_resolve";
      },
    });

    await expect(taskPromise).rejects.toThrow(QueueTaskTimeoutError);
    await expect(taskPromise).rejects.toThrow("Queue task timeout");
  });

  it("should retry a task on failure and succeed on retry", async () => {
    const options = { ...defaultOptions, retryCount: 1, retry: { initialDelay: 20, exponentialFactor: 2 } };
    const queue = new SimpleQueue<string, string>(options);
    let attempt = 0;
    const expectedResult = "success_on_retry";

    const taskPromise = createTaskPromise(queue, {
      id: "retrySuccessTask",
      request: "reqRetrySuccess",
      execute: async () => {
        attempt++;
        if (attempt === 1) {
          await delay(10); // Simulate work before failing
          throw new Error("Temporary failure");
        }
        await delay(10);
        return expectedResult;
      },
    });

    await expect(taskPromise).resolves.toBe(expectedResult);
    expect(attempt).toBe(2); // Initial attempt + 1 retry
  });

  it("should retry with exponential backoff delay", async () => {
    const options = {
      ...defaultOptions,
      retryCount: 2, // Allows for 2 retries (3 attempts total)
      retry: { initialDelay: 50, exponentialFactor: 2 }, // 50ms, then 100ms delay
    };
    const queue = new SimpleQueue<string, string>(options);
    let attempt = 0;
    const failureTimestamps: number[] = [];
    const successTimestamp = 0;

    const taskPromise = createTaskPromise(queue, {
      id: "retryDelayTask",
      request: "reqRetryDelay",
      execute: async () => {
        attempt++;
        if (attempt <= 2) {
          failureTimestamps.push(Date.now());
          await delay(10); // Simulate work before failing
          throw new Error(`Temporary failure ${attempt}`);
        }
        await delay(10);
        return "success_finally";
      },
    });

    const startTime = Date.now();
    await expect(taskPromise).resolves.toBe("success_finally");
    const endTime = Date.now();

    expect(attempt).toBe(3); // Initial + 2 retries
    expect(failureTimestamps.length).toBe(2);

    // Check approximate delays (allow for processing overhead)
    // Delay after 1st failure should be ~50ms
    const firstRetryStartTime = failureTimestamps[1];
    const firstRetryDelay = firstRetryStartTime - failureTimestamps[0];
    expect(firstRetryDelay).toBeGreaterThanOrEqual(options.retry.initialDelay);
    expect(firstRetryDelay).toBeLessThan(options.retry.initialDelay * 1.5 + 50); // Allow generous overhead

    // Delay after 2nd failure should be ~100ms (50 * 2^1)
    // Approximate start time of 3rd attempt is endTime - execution time (~10ms)
    const secondRetryDelay = endTime - 10 - failureTimestamps[1];
    const expectedSecondDelay = options.retry.initialDelay * Math.pow(options.retry.exponentialFactor, 1);
    expect(secondRetryDelay).toBeGreaterThanOrEqual(expectedSecondDelay);
    expect(secondRetryDelay).toBeLessThan(expectedSecondDelay * 1.5 + 50); // Allow generous overhead
  });

  it("should reject a task after exhausting retries", async () => {
    const options = { ...defaultOptions, retryCount: 1 }; // 1 retry (2 attempts total)
    const queue = new SimpleQueue<string, string>(options);
    let attempt = 0;
    const failError = new Error("Permanent failure");

    const taskPromise = createTaskPromise(queue, {
      id: "retryFailTask",
      request: "reqRetryFail",
      execute: async () => {
        attempt++;
        await delay(10);
        throw failError;
      },
    });

    await expect(taskPromise).rejects.toThrow(failError);
    expect(attempt).toBe(2); // Initial attempt + 1 retry
  });

  // Example testing specific error retry logic (minimal mock needed here)
  it("should handle simulated 429 error retry delay (if logic exists)", async () => {
    // This test assumes your actual `GatewayCompleteChatRequest` and `model.getRetryDelay`
    // work as mocked above for 429 errors.

    const options = { ...defaultOptions, retryCount: 1 };
    const queue = new SimpleQueue<string, string>(options); // Recreate queue to pick up the new mock

    let attempt = 0;
    let failureTimestamp = 0;
    let successTimestamp = 0;

    const taskPromise = createTaskPromise(queue, {
      id: "429Task",
      request: "req429", // Needs to be parsable by the mocked safeParse
      execute: async () => {
        attempt++;
        if (attempt === 1) {
          failureTimestamp = Date.now();
          await delay(10);
          // Throw the error type the queue checks
          throw new MockHttpRequestError("Rate Limited", 429);
        }
        successTimestamp = Date.now();
        await delay(10);
        return "success_after_429";
      },
    });

    await expect(taskPromise).resolves.toBe("success_after_429");
    expect(attempt).toBe(2);
    expect(successTimestamp - failureTimestamp).toBeGreaterThanOrEqual(60);
    expect(successTimestamp - failureTimestamp).toBeLessThan(60 * 1.5 + 50); // Allow overhead

    // Restore original mock if needed (or let Vitest handle it with vi.doMock scope)
    vi.doUnmock("../../gateway.types");
  });

  it("should handle tasks added while processing others", async () => {
    const options = { ...defaultOptions, maxConcurrentTasks: 1, timeout: 200 };
    const queue = new SimpleQueue<string, number>(options);

    const results: number[] = [];

    // Task 1 takes time
    const task1Promise = createTaskPromise(queue, {
      id: "addLater1",
      request: "req1",
      execute: async () => {
        await delay(100);
        results.push(1);
        return 1;
      },
    });

    // While task 1 is running (or queued), add task 2
    await delay(20); // Ensure task 1 has started processing
    const task2Promise = createTaskPromise(queue, {
      id: "addLater2",
      request: "req2",
      execute: async () => {
        await delay(50);
        results.push(2);
        return 2;
      },
    });

    await expect(task1Promise).resolves.toBe(1);
    await expect(task2Promise).resolves.toBe(2);
    expect(results).toEqual([1, 2]); // Ensure they finished in the correct order due to concurrency 1
  });
});
