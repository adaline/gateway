// simple-queue.test.ts
import { context, Context } from "@opentelemetry/api"; // Added ROOT_CONTEXT, Context
import { beforeEach, describe, expect, it, vi } from "vitest";

import { QueueTaskTimeoutError } from "../../../src/plugins/queue/queue.error";
import { QueueOptionsType, QueueTask } from "../../../src/plugins/queue/queue.interface";
import { SimpleQueue } from "../../../src/plugins/queue/simple.queue";
import { delay } from "../../../src/utils"; // Assuming path

// --- Mocks Setup ---

const mockLogger = {
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
const mockTracer = {
  startActiveSpan: vi.fn((name, options, contextMaybe, fnMaybe) => {
    // Handle optional context argument
    const fn = fnMaybe ?? contextMaybe;
    const span = {
      setAttribute: vi.fn(),
      setStatus: vi.fn(),
      recordException: vi.fn(), // Added for error recording
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

// Mock for HttpRequestError and related logic (adjust status/headers as needed per test)
class MockHttpRequestError extends Error {
  cause: { status: number; headers?: Record<string, string> }; // Adjusted type
  response?: any; // Added optional response property if queue checks it
  constructor(message: string, status: number, headers?: Record<string, string>, response?: any) {
    super(message);
    this.name = "HttpRequestError";
    this.cause = { status, headers };
    this.response = response; // Store response if provided
  }
  static isHttpRequestError(error: any): error is MockHttpRequestError {
    return error instanceof MockHttpRequestError;
  }
}

// Default mock model behavior - gets overridden in specific tests if needed
const mockModelDefault = {
  // Default: retry immediately unless overridden
  getRetryDelay: (_headers: any, _responseData: any) => ({ shouldRetry: true, delayMs: 1 }),
};

// Mock for Gateway Request Parsing (used in 429 test)
const MockGatewayCompleteChatRequest = {
  // Ensure the parsed data includes a model object for getRetryDelay
  safeParse: (data: any) => ({ success: true, data: { ...data, model: data?.model ?? mockModelDefault } }),
};

vi.mock("./../http-client", () => ({ HttpRequestError: MockHttpRequestError }));
vi.mock("../../gateway.types", () => ({ GatewayCompleteChatRequest: MockGatewayCompleteChatRequest }));

// --- Test Suite ---

describe("SimpleQueue", () => {
  let defaultOptions: QueueOptionsType;
  let queue: SimpleQueue<any, any>; // Use 'any' for broader testability or define specific types per test block

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();

    defaultOptions = {
      maxConcurrentTasks: 2, // Default, can be overridden
      retryCount: 2, // Default: 2 retries (3 attempts total)
      timeout: 500, // ms
      retry: {
        initialDelay: 50, // ms
        exponentialFactor: 2,
      },
    };

    // Initialize queue with default options - tests can override options if needed
    queue = new SimpleQueue<any, any>(defaultOptions);
  });

  // Helper to create a task promise (same as before)
  const createTaskPromise = <Req, Res>(
    q: SimpleQueue<Req, Res>, // Pass queue instance
    taskDetails: Omit<QueueTask<Req, Res>, "resolve" | "reject" | "telemetryContext">,
    taskContext: Context = context.active() // Allow overriding context
  ): Promise<Res> => {
    return new Promise<Res>((resolve, reject) => {
      const task: QueueTask<Req, Res> = {
        ...taskDetails,
        resolve,
        reject,
        telemetryContext: taskContext,
      };
      q.enqueue(task);
    });
  };

  // --- Existing Tests (Keep them) ---

  it("should process a single task successfully", async () => {
    const taskPayload = "task1_payload";
    const expectedResult = "task1_payload_result";

    const taskPromise = createTaskPromise(queue, {
      id: "task1",
      request: taskPayload,
      execute: async (req) => {
        await delay(10);
        return `${req}_result`;
      },
    });

    await expect(taskPromise).resolves.toBe(expectedResult);
  });

  it("should process tasks sequentially if maxConcurrentTasks is 1", async () => {
    const options = { ...defaultOptions, maxConcurrentTasks: 1 };
    const seqQueue = new SimpleQueue<string, number>(options); // Use a dedicated queue for this test
    const taskDurations = [50, 50]; // ms
    const startTime = Date.now();
    let task1EndTime = 0;
    let task2StartTime = 0;

    const task1Promise = createTaskPromise(seqQueue, {
      id: "taskSeq1",
      request: "req1",
      execute: async () => {
        await delay(taskDurations[0]);
        task1EndTime = Date.now();
        return 1;
      },
    });

    const task2Promise = createTaskPromise(seqQueue, {
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
    expect(task2StartTime).toBeGreaterThanOrEqual(task1EndTime);
    expect(Date.now() - startTime).toBeGreaterThanOrEqual(taskDurations[0] + taskDurations[1]);
  });

  it("should respect maxConcurrentTasks limit", async () => {
    // This test already covers part of the concurrency scenario
    const options = { ...defaultOptions, maxConcurrentTasks: 2 };
    const concQueue = new SimpleQueue<string, number>(options);
    const taskDuration = 100; // ms
    let runningTasks = 0;
    let maxRunningTasks = 0;

    const createTask = (id: string) =>
      createTaskPromise(concQueue, {
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
    const timeoutQueue = new SimpleQueue<string, string>(options);

    const taskPromise = createTaskPromise(timeoutQueue, {
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
    const retryQueue = new SimpleQueue<string, string>(options);
    let attempt = 0;
    const expectedResult = "success_on_retry";
    const mockExecute = vi.fn(async () => {
      attempt++;
      if (attempt === 1) {
        await delay(10); // Simulate work before failing
        throw new Error("Temporary failure");
      }
      await delay(10);
      return expectedResult;
    });

    const taskPromise = createTaskPromise(retryQueue, {
      id: "retrySuccessTask",
      request: "reqRetrySuccess",
      execute: mockExecute,
    });

    await expect(taskPromise).resolves.toBe(expectedResult);
    expect(attempt).toBe(2); // Initial attempt + 1 retry
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });

  it("should retry with exponential backoff delay", async () => {
    const options = {
      ...defaultOptions,
      maxConcurrentTasks: 1, // Make timing easier to predict
      retryCount: 2,
      retry: { initialDelay: 50, exponentialFactor: 2 },
    };
    const backoffQueue = new SimpleQueue<string, string>(options);
    let attempt = 0;
    const failureTimestamps: number[] = [];
    let successTimestamp = 0;
    const mockExecute = vi.fn(async () => {
      const now = Date.now();
      attempt++;
      if (attempt <= 2) {
        failureTimestamps.push(now);
        await delay(10); // Simulate work before failing
        throw new Error(`Temporary failure ${attempt}`);
      }
      await delay(10);
      successTimestamp = Date.now();
      return "success_finally";
    });

    const taskPromise = createTaskPromise(backoffQueue, {
      id: "retryDelayTask",
      request: "reqRetryDelay",
      execute: mockExecute,
    });

    await expect(taskPromise).resolves.toBe("success_finally");

    expect(attempt).toBe(3); // Initial + 2 retries
    expect(mockExecute).toHaveBeenCalledTimes(3);
    expect(failureTimestamps.length).toBe(2);

    // Check approximate delays (allow for processing overhead + execution time)
    const firstRetryAttemptStart = failureTimestamps[1];
    const firstFailureEnd = failureTimestamps[0] + 10; // Approx end time of first attempt work
    const firstRetryDelay = firstRetryAttemptStart - firstFailureEnd;
    expect(firstRetryDelay).toBeGreaterThanOrEqual(options.retry.initialDelay);
    // Looser upper bound for CI/timing variations
    expect(firstRetryDelay).toBeLessThan(options.retry.initialDelay * 1.5 + 50);

    const secondRetryAttemptStart = successTimestamp - 10; // Approx start time of final attempt work
    const secondFailureEnd = failureTimestamps[1] + 10; // Approx end time of second attempt work
    const secondRetryDelay = secondRetryAttemptStart - secondFailureEnd;
    const expectedSecondDelay = options.retry.initialDelay * Math.pow(options.retry.exponentialFactor, 1);
    expect(secondRetryDelay).toBeGreaterThanOrEqual(expectedSecondDelay);
    expect(secondRetryDelay).toBeLessThan(expectedSecondDelay * 1.5 + 50);
  });

  it("should reject a task after exhausting retries", async () => {
    const options = { ...defaultOptions, retryCount: 1 }; // 1 retry (2 attempts total)
    const failQueue = new SimpleQueue<string, string>(options);
    let attempt = 0;
    const failError = new Error("Permanent failure");
    const mockExecute = vi.fn(async () => {
      attempt++;
      await delay(5);
      throw failError;
    });

    const taskPromise = createTaskPromise(failQueue, {
      id: "retryFailTask",
      request: "reqRetryFail",
      execute: mockExecute,
    });

    await expect(taskPromise).rejects.toThrow(failError);
    expect(attempt).toBe(2); // Initial attempt + 1 retry
    expect(mockExecute).toHaveBeenCalledTimes(2);
  });

  it("should handle tasks added while processing others", async () => {
    const options = { ...defaultOptions, maxConcurrentTasks: 1, timeout: 200 };
    const addLaterQueue = new SimpleQueue<string, number>(options);

    const results: number[] = [];

    const task1Promise = createTaskPromise(addLaterQueue, {
      id: "addLater1",
      request: "req1",
      execute: async () => {
        await delay(100);
        results.push(1);
        return 1;
      },
    });

    await delay(20); // Ensure task 1 has started processing
    const task2Promise = createTaskPromise(addLaterQueue, {
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
    expect(results).toEqual([1, 2]);
  });

  // --- New/Extended Tests Based on Jest Examples ---
  it("should process tasks concurrently based on limits", async () => {
    const options = { ...defaultOptions, maxConcurrentTasks: 4 };
    const concQueue = new SimpleQueue<string, string>(options);
    const taskDuration = 100; // ms
    const numTasks = 6;
    const expectedBatches = Math.ceil(numTasks / options.maxConcurrentTasks); // 6 / 4 = 2 batches
    const expectedMinDuration = expectedBatches * taskDuration; // ~200ms
    const expectedMaxDuration = expectedMinDuration + 100; // Allow generous overhead

    const promises: Promise<string>[] = [];
    const executeMock = vi.fn(async (req: string) => {
      await delay(taskDuration);
      return `result-${req}`;
    });

    const startTime = Date.now();

    for (let i = 1; i <= numTasks; i++) {
      promises.push(
        createTaskPromise(concQueue, {
          id: `conc-task-${i}`,
          request: `${i}`,
          execute: executeMock,
        })
      );
    }

    const results = await Promise.all(promises);
    const endTime = Date.now();
    const totalDuration = endTime - startTime;

    // Verify all tasks completed
    expect(results.length).toBe(numTasks);
    expect(results).toContain("result-1");
    expect(results).toContain("result-6");

    // Verify the execution mock was called for each task
    expect(executeMock).toHaveBeenCalledTimes(numTasks);

    // Verify timing suggests concurrency
    // It should be faster than sequential execution (numTasks * taskDuration)
    expect(totalDuration).toBeLessThan(numTasks * taskDuration);
    // It should be roughly the time for the number of batches
    expect(totalDuration).toBeGreaterThanOrEqual(expectedMinDuration);
    expect(totalDuration).toBeLessThan(expectedMaxDuration); // Check it's not excessively long
  });

  /**
   * @description Corresponds to jest "should retry on failure"
   * Tests retrying multiple times before success.
   */
  it("should retry multiple times and succeed eventually", async () => {
    const options = { ...defaultOptions, retryCount: 3, retry: { initialDelay: 20 } }; // 3 retries (4 attempts)
    const retryQueue = new SimpleQueue<string, string>(options);
    const expectedResult = "success_on_3rd_attempt";
    let attempt = 0;
    const mockExecute = vi.fn(async () => {
      attempt++;
      await delay(5); // Simulate work
      if (attempt <= 2) {
        throw new Error(`Fail ${attempt}`);
      }
      return expectedResult;
    });

    const taskPromise = createTaskPromise(retryQueue, {
      id: "multiRetryTask",
      request: "reqMultiRetry",
      execute: mockExecute,
    });

    await expect(taskPromise).resolves.toBe(expectedResult);
    expect(attempt).toBe(3); // Failed twice, succeeded on the third attempt
    expect(mockExecute).toHaveBeenCalledTimes(3);
  });

  it("should reject due to timeout after exhausting retries", async () => {
    const options = {
      ...defaultOptions,
      timeout: 50, // Short timeout
      retryCount: 2, // 3 attempts total
    };
    const timeoutQueue = new SimpleQueue<string, string>(options);
    let attempt = 0;
    const mockExecute = vi.fn(async () => {
      attempt++;
      // This delay will exceed the timeout on every attempt
      await delay(options.timeout + 50);
      return "should_never_resolve";
    });

    const taskPromise = createTaskPromise(timeoutQueue, {
      id: "timeoutRetryTask",
      request: "reqTimeoutRetry",
      execute: mockExecute,
    });

    // Expect rejection with the specific timeout error
    await expect(taskPromise).rejects.toThrow(QueueTaskTimeoutError);
    await expect(taskPromise).rejects.toThrow("Queue task timeout");

    // Verify it attempted the task multiple times (initial + retries) before final timeout rejection
    // The exact number of calls might depend on internal queue logic (does it call execute *then* timeout, or timeout *before* call?)
    // Assuming it calls execute for each attempt:
    expect(mockExecute).toHaveBeenCalledTimes(options.retryCount + 1); // e.g., 3 times for retryCount: 2
  });

  // --- Performance Tests ---
  describe("Performance tests", () => {
    it("should handle a large number of tasks efficiently", async () => {
      // Consider skipping this on CI if it's too slow/flaky, using it.skip
      const taskCount = 1000;
      const performanceThresholdMs = 10000; // 10 seconds threshold from jest test
      const perfQueue = new SimpleQueue<string, string>({
        ...defaultOptions,
        maxConcurrentTasks: 10, // Increase concurrency slightly for faster processing
      });
      const promises: Promise<string>[] = [];
      const quickExecute = vi.fn().mockResolvedValue("done"); // Very fast execution

      console.log(`[Performance Test] Starting ${taskCount} quick tasks...`);
      const startTime = Date.now();

      for (let i = 0; i < taskCount; i++) {
        promises.push(
          createTaskPromise(perfQueue, {
            id: `perf-task-${i}`,
            request: `task-${i}`,
            execute: quickExecute, // Use the fast mock
          })
        );
      }

      // Wait for all tasks to complete using Promise.all
      const results = await Promise.all(promises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results.length).toBe(taskCount); // Verify all tasks resolved
      expect(quickExecute).toHaveBeenCalledTimes(taskCount);
      // Check against the performance threshold
      expect(duration).toBeLessThan(performanceThresholdMs);

      console.log(`[Performance Test] Processed ${taskCount} quick tasks in ${duration}ms (Threshold: < ${performanceThresholdMs}ms)`);
    });

    it("should maintain performance under high concurrency", async () => {
      // Consider skipping this on CI if it's too slow/flaky, using it.skip
      const taskCount = 100;
      const taskWorkDuration = 50; // ms of simulated work per task
      const highConcurrencyOptions: QueueOptionsType = {
        ...defaultOptions,
        maxConcurrentTasks: 50, // High concurrency setting from  st
        retryCount: 0, // Disable retries for perf test simplicity
        timeout: 5000, // Increase timeout for safety under load
      };
      const highConcQueue = new SimpleQueue<string, string>(highConcurrencyOptions);
      const promises: Promise<string>[] = [];

      // Calculate a rough expected minimum duration based on batches
      const expectedBatches = Math.ceil(taskCount / highConcurrencyOptions.maxConcurrentTasks); // 100 / 50 = 2
      const expectedMinDuration = expectedBatches * taskWorkDuration; // 2 * 50 = 100ms
      // Set a reasonable threshold slightly above the minimum + overhead
      const performanceThresholdMs = Math.max(500, expectedMinDuration * 3); // e.g., 500ms or 3x expected, whichever is higher

      const executeWithDelay = vi.fn(async (id: string) => {
        await delay(taskWorkDuration);
        return id;
      });

      console.log(
        `[Performance Test] Starting ${taskCount} tasks (${taskWorkDuration}ms each) with concurrency ${highConcurrencyOptions.maxConcurrentTasks}...`
      );
      const startTime = Date.now();

      for (let i = 0; i < taskCount; i++) {
        promises.push(
          createTaskPromise(highConcQueue, {
            id: `high-conc-task-${i}`,
            request: `task-${i}`,
            execute: executeWithDelay,
          })
        );
      }

      // Wait for all tasks to complete
      const results = await Promise.all(promises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(results.length).toBe(taskCount);
      expect(executeWithDelay).toHaveBeenCalledTimes(taskCount);
      // Check against the performance threshold
      expect(duration).toBeLessThan(performanceThresholdMs);

      console.log(
        `[Performance Test] Processed ${taskCount} tasks (${taskWorkDuration}ms each) with concurrency ${highConcurrencyOptions.maxConcurrentTasks} in ${duration}ms (Expected Min: ~${expectedMinDuration}ms, Threshold: < ${performanceThresholdMs}ms)`
      );
    });
  });
});
