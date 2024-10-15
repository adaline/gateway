// import { v4 as uuidv4 } from "uuid";

// import { HttpRequestError } from "../../../src/plugins/http-client";
// import { QueueOptionsType, QueueTask } from "../../../src/plugins/queue/queue.interface";
// import { SimpleQueue } from "../../../src/plugins/queue/simple.queue";

// import { ROOT_CONTEXT } from "@opentelemetry/api";

// jest.mock("@opentelemetry/api", () => ({
//   trace: {
//     getTracer: jest.fn().mockReturnValue({
//       startActiveSpan: jest.fn((name, callback) => {
//         if (typeof callback !== "function") {
//           throw new TypeError("'callback' is not a function");
//         }

//         const span = {
//           end: jest.fn(),
//           setAttribute: jest.fn(),
//           addEvent: jest.fn(),
//         };

//         return callback(span);
//       }),
//     }),
//     getSpan: jest.fn().mockReturnValue({
//       end: jest.fn(),
//     }),
//   },
//   context: {
//     active: jest.fn().mockReturnValue({}),
//     with: jest.fn((ctx, fn) => fn()),
//   },
// }));

// describe("SimpleQueue", () => {
//   let queue: SimpleQueue<string, string>;
//   let options: QueueOptionsType;

//   beforeEach(() => {
//     options = {
//       maxConcurrentTasks: 4,
//       retryCount: 2,
//       timeout: 1000,
//       retry: {
//         initialDelay: 100,
//         exponentialFactor: 2,
//       },
//     };
//     queue = new SimpleQueue<string, string>(options);
//   });

//   describe("Unit tests", () => {
// it("should process tasks concurrently", async () => {
//   const results: string[] = [];
//   const createTask = (id: string): QueueTask<string, string> => ({
//     id: uuidv4(),
//     request: id,
//     cache: { get: jest.fn(), set: jest.fn(), delete: jest.fn(), clear: jest.fn() },
//     resolve: (value) => results.push(value),
//     reject: jest.fn(),
//     execute: jest.fn().mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(id), 100))),
//     telemetryContext: ROOT_CONTEXT,
//   });

//   queue.enqueue(createTask("1"));
//   queue.enqueue(createTask("2"));
//   queue.enqueue(createTask("3"));
//   queue.enqueue(createTask("4"));
//   queue.enqueue(createTask("5"));
//   queue.enqueue(createTask("6"));

//   await new Promise((resolve) => setTimeout(resolve, 150));
//   expect(results).toEqual(["1", "2", "3", "4"]);

//   await new Promise((resolve) => setTimeout(resolve, 150));
//   expect(results).toEqual(["1", "2", "3", "4","5", "6"]);
// });

// it("should retry on failure", async () => {
//   const task: QueueTask<string, string> = {
//     id: uuidv4(),
//     request: "test",
//     cache: { get: jest.fn(), set: jest.fn(), delete: jest.fn(), clear: jest.fn() },
//     resolve: jest.fn(),
//     reject: jest.fn(),
//     execute: jest
//       .fn()
//       .mockRejectedValueOnce(new Error("Fail 1"))
//       .mockRejectedValueOnce(new Error("Fail 2"))
//       .mockResolvedValue("success"),
//     telemetryContext: ROOT_CONTEXT,
//   };

//   queue.enqueue(task);

//   await new Promise((resolve) => setTimeout(resolve, 1000));

//   expect(task.execute).toHaveBeenCalledTimes(3);
//   expect(task.resolve).toHaveBeenCalledWith("success");
//   expect(task.reject).not.toHaveBeenCalled();
// });

//   it("should handle timeouts", async () => {
//     const task: QueueTask<string, string> = {
//       id: uuidv4(),
//       request: "test",
//       cache: { get: jest.fn(), set: jest.fn(), delete: jest.fn(), clear: jest.fn() },
//       resolve: jest.fn(),
//       reject: jest.fn(),
//       execute: jest.fn().mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve("late"), 2000))),
//       telemetryContext: ROOT_CONTEXT,
//     };

//     queue.enqueue(task);

//     await new Promise((resolve) => setTimeout(resolve, 4000));

//     expect(task.execute).toHaveBeenCalledTimes(3);
//     expect(task.resolve).not.toHaveBeenCalled();
//     expect(task.reject).toHaveBeenCalledWith(expect.any(Error));
//     expect(task.reject).toHaveBeenCalledWith(
//       expect.objectContaining({
//         message: expect.stringContaining("Queue task timeout"),
//       })
//     );
//   });

//   it("should handle rate limiting errors", async () => {
//     const rateLimitError = new HttpRequestError("Rate limit exceeded", 429, { "retry-after": "2" }, {});
//     const task: QueueTask<any, string> = {
//       id: uuidv4(),
//       request: {
//         model: {
//           getRetryDelay: jest.fn().mockReturnValue({ shouldRetry: true, delayMs: 2000 }),
//         },
//       },
//       cache: { get: jest.fn(), set: jest.fn(), delete: jest.fn(), clear: jest.fn() },
//       resolve: jest.fn(),
//       reject: jest.fn(),
//       execute: jest.fn().mockRejectedValueOnce(rateLimitError).mockResolvedValue("success"),
//       telemetryContext: ROOT_CONTEXT,
//     };

//     queue.enqueue(task);

//     await new Promise((resolve) => setTimeout(resolve, 3000));

//     expect(task.execute).toHaveBeenCalledTimes(2);
//     expect(task.resolve).toHaveBeenCalledWith("success");
//     expect(task.reject).not.toHaveBeenCalled();
//   });
// });

// describe("Performance tests", () => {
//   it("should handle a large number of tasks efficiently", async () => {
//     const taskCount = 1000;
//     const results: string[] = [];

//     const createTask = (id: string): QueueTask<string, string> => ({
//       id: uuidv4(),
//       request: id,
//       cache: { get: jest.fn(), set: jest.fn(), delete: jest.fn(), clear: jest.fn() },
//       resolve: (value) => results.push(value),
//       reject: jest.fn(),
//       execute: jest.fn().mockResolvedValue(id),
//       telemetryContext: ROOT_CONTEXT,
//     });

//     const startTime = Date.now();

//     for (let i = 0; i < taskCount; i++) {
//       queue.enqueue(createTask(`task-${i}`));
//     }

//     while (results.length < taskCount) {
//       await new Promise((resolve) => setTimeout(resolve, 100));
//     }

//     const endTime = Date.now();
//     const duration = endTime - startTime;

//     expect(results.length).toBe(taskCount);
//     expect(duration).toBeLessThan(10000);
//     console.log(`Processed ${taskCount} tasks in ${duration}ms`);
//   });

//   it("should maintain performance under high concurrency", async () => {
//     const taskCount = 100;
//     const results: string[] = [];
//     const highConcurrencyOptions: QueueOptionsType = { ...options, maxConcurrentTasks: 50 };
//     const highConcurrencyQueue = new SimpleQueue<string, string>(highConcurrencyOptions);

//     const createTask = (id: string): QueueTask<string, string> => ({
//       id: uuidv4(),
//       request: id,
//       cache: { get: jest.fn(), set: jest.fn(), delete: jest.fn(), clear: jest.fn() },
//       resolve: (value) => results.push(value),
//       reject: jest.fn(),
//       execute: jest.fn().mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(id), 50))),
//       telemetryContext: ROOT_CONTEXT,
//     });

//     const startTime = Date.now();

//     for (let i = 0; i < taskCount; i++) {
//       highConcurrencyQueue.enqueue(createTask(`task-${i}`));
//     }

//     while (results.length < taskCount) {
//       await new Promise((resolve) => setTimeout(resolve, 50));
//     }

//     const endTime = Date.now();
//     const duration = endTime - startTime;

//     expect(results.length).toBe(taskCount);
//     expect(duration).toBeLessThan(5000);
//     console.log(`Processed ${taskCount} tasks with high concurrency in ${duration}ms`);
//   });
//   });
// });

// // import { v4 as uuidv4 } from "uuid";
// // import { Context } from "@opentelemetry/api";

// // import { HttpRequestError } from "../../../src/plugins/http-client";
// // import { QueueOptionsType, QueueTask } from "../../../src/plugins/queue/queue.interface";
// // import { SimpleQueue } from "../../../src/plugins/queue/simple.queue";

// // describe("SimpleQueue", () => {
// //   let queue: SimpleQueue<string, string>;
// //   let options: QueueOptionsType;

// //   beforeEach(() => {
// //     options = {
// //       maxConcurrentTasks: 4,
// //       retryCount: 2,
// //       timeout: 1000,
// //       retry: {
// //         initialDelay: 100,
// //         exponentialFactor: 2,
// //       },
// //     };
// //     queue = new SimpleQueue<string, string>(options);
// //   });

// //   describe("Unit tests", () => {
// //     it("should process tasks concurrently", async () => {
// //       const results: string[] = [];
// //       const createTask = (id: string): QueueTask<string, string> => ({
// //         id: uuidv4(),
// //         request: id,
// //         cache: { get: vi.fn(), set: vi.fn(), delete: vi.fn(), clear: vi.fn() },
// //         resolve: (value) => results.push(value),
// //         reject: vi.fn(),
// //         execute: vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(id), 100))),
// //         telemetryContext: {} as Context,
// //       });

// //       queue.enqueue(createTask("1"));
// //       queue.enqueue(createTask("2"));
// //       queue.enqueue(createTask("3"));
// //       queue.enqueue(createTask("4"));
// //       queue.enqueue(createTask("5"));
// //       queue.enqueue(createTask("6"));

// //       await new Promise((resolve) => setTimeout(resolve, 150));
// //       expect(results).toEqual(["1", "2", "3", "4"]);

// //       await new Promise((resolve) => setTimeout(resolve, 150));
// //       expect(results).toEqual(["1", "2", "3", "4", "5", "6"]);
// //     });

// //     it("should retry on failure", async () => {
// //       const task: QueueTask<string, string> = {
// //         id: uuidv4(),
// //         request: "test",
// //         cache: { get: vi.fn(), set: vi.fn(), delete: vi.fn(), clear: vi.fn() },
// //         resolve: vi.fn(),
// //         reject: vi.fn(),
// //         execute: vi
// //           .fn()
// //           .mockRejectedValueOnce(new Error("Fail 1"))
// //           .mockRejectedValueOnce(new Error("Fail 2"))
// //           .mockResolvedValue("success"),
// //         telemetryContext: {} as Context,
// //       };

// //       queue.enqueue(task);

// //       await new Promise((resolve) => setTimeout(resolve, 1000));

// //       expect(task.execute).toHaveBeenCalledTimes(3);
// //       expect(task.resolve).toHaveBeenCalledWith("success");
// //       expect(task.reject).not.toHaveBeenCalled();
// //     });

// //     it("should handle timeouts", async () => {
// //       const task: QueueTask<string, string> = {
// //         id: uuidv4(),
// //         request: "test",
// //         cache: { get: vi.fn(), set: vi.fn(), delete: vi.fn(), clear: vi.fn() },
// //         resolve: vi.fn(),
// //         reject: vi.fn(),
// //         execute: vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve("late"), 2000))),
// //         telemetryContext: {} as Context,
// //       };

// //       queue.enqueue(task);

// //       await new Promise((resolve) => setTimeout(resolve, 4000));

// //       expect(task.execute).toHaveBeenCalledTimes(3);
// //       expect(task.resolve).not.toHaveBeenCalled();
// //       expect(task.reject).toHaveBeenCalledWith(expect.any(Error));
// //       expect(task.reject).toHaveBeenCalledWith(
// //         expect.objectContaining({
// //           message: expect.stringContaining("Queue task timeout"),
// //         })
// //       );
// //     });

// //     it("should handle rate limiting errors", async () => {
// //       const rateLimitError = new HttpRequestError("Rate limit exceeded", 429, { "retry-after": "2" }, {});
// //       const task: QueueTask<any, string> = {
// //         id: uuidv4(),
// //         request: {
// //           model: {
// //             getRetryDelay: vi.fn().mockReturnValue({ shouldRetry: true, delayMs: 2000 }),
// //           },
// //         },
// //         cache: { get: vi.fn(), set: vi.fn(), delete: vi.fn(), clear: vi.fn() },
// //         resolve: vi.fn(),
// //         reject: vi.fn(),
// //         execute: vi.fn().mockRejectedValueOnce(rateLimitError).mockResolvedValue("success"),
// //         telemetryContext: {} as Context,
// //       };

// //       queue.enqueue(task);

// //       await new Promise((resolve) => setTimeout(resolve, 3000));

// //       expect(task.execute).toHaveBeenCalledTimes(2);
// //       expect(task.resolve).toHaveBeenCalledWith("success");
// //       expect(task.reject).not.toHaveBeenCalled();
// //     });
// //   });

// //   describe("Performance tests", () => {
// //     it("should handle a large number of tasks efficiently", async () => {
// //       const taskCount = 1000;
// //       const results: string[] = [];

// //       const createTask = (id: string): QueueTask<string, string> => ({
// //         id: uuidv4(),
// //         request: id,
// //         cache: { get: vi.fn(), set: vi.fn(), delete: vi.fn(), clear: vi.fn() },
// //         resolve: (value) => results.push(value),
// //         reject: vi.fn(),
// //         execute: vi.fn().mockResolvedValue(id),
// //         telemetryContext: {} as Context,
// //       });

// //       const startTime = Date.now();

// //       for (let i = 0; i < taskCount; i++) {
// //         queue.enqueue(createTask(`task-${i}`));
// //       }

// //       while (results.length < taskCount) {
// //         await new Promise((resolve) => setTimeout(resolve, 100));
// //       }

// //       const endTime = Date.now();
// //       const duration = endTime - startTime;

// //       expect(results.length).toBe(taskCount);
// //       expect(duration).toBeLessThan(10000);
// //       console.log(`Processed ${taskCount} tasks in ${duration}ms`);
// //     });

// //     it("should maintain performance under high concurrency", async () => {
// //       const taskCount = 100;
// //       const results: string[] = [];
// //       const highConcurrencyOptions: QueueOptionsType = { ...options, maxConcurrentTasks: 50 };
// //       const highConcurrencyQueue = new SimpleQueue<string, string>(highConcurrencyOptions);

// //       const createTask = (id: string): QueueTask<string, string> => ({
// //         id: uuidv4(),
// //         request: id,
// //         cache: { get: vi.fn(), set: vi.fn(), delete: vi.fn(), clear: vi.fn() },
// //         resolve: (value) => results.push(value),
// //         reject: vi.fn(),
// //         execute: vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(id), 50))),
// //         telemetryContext: {} as Context,
// //       });

// //       const startTime = Date.now();

// //       for (let i = 0; i < taskCount; i++) {
// //         highConcurrencyQueue.enqueue(createTask(`task-${i}`));
// //       }

// //       while (results.length < taskCount) {
// //         await new Promise((resolve) => setTimeout(resolve, 50));
// //       }

// //       const endTime = Date.now();
// //       const duration = endTime - startTime;

// //       expect(results.length).toBe(taskCount);
// //       expect(duration).toBeLessThan(5000);
// //       console.log(`Processed ${taskCount} tasks with high concurrency in ${duration}ms`);
// //     });
// //   });
// // });

// +++++++++++++++++++
import { performance } from "perf_hooks";
import { Context, context, Span, SpanStatusCode } from "@opentelemetry/api";

import { LoggerManager } from "../../../src/plugins/logger";
import { QueueTaskTimeoutError } from "../../../src/plugins/queue/queue.error";
import { QueueOptionsType, QueueTask } from "../../../src/plugins/queue/queue.interface";
import { SimpleQueue } from "../../../src/plugins/queue/simple.queue";
import { TelemetryManager } from "../../../src/plugins/telemetry";

// import { HttpRequestError } from "../../../src/plugins/http-client";
// import { GatewayCompleteChatRequest } from "../../../src/gateway.types";

// Mock dependencies
jest.mock("@opentelemetry/api");
jest.mock("../../../src/plugins/telemetry");
jest.mock("../../../src/plugins/logger");
jest.mock("../../../src/plugins/http-client");
jest.mock("../../../src/gateway.types");

describe("SimpleQueue", () => {
  let queue: SimpleQueue<any, any>;
  let mockOptions: QueueOptionsType;
  let mockTask: QueueTask<any, any>;
  let mockContext: Context;
  let mockSpan: Span;
  let mockTracer: any;
  let mockLogger: any;

  beforeEach(() => {
    mockOptions = {
      maxConcurrentTasks: 2,
      timeout: 5000,
      retryCount: 3,
      retry: {
        initialDelay: 1000,
        exponentialFactor: 2,
      },
    };

    mockTask = {
      id: "test-task",
      request: {},
      cache: { get: jest.fn(), set: jest.fn(), delete: jest.fn(), clear: jest.fn() },
      execute: jest.fn(),
      resolve: jest.fn(),
      reject: jest.fn(),
      telemetryContext: {} as Context,
    };

    mockContext = {} as Context;
    mockSpan = {
      setAttribute: jest.fn(),
      setStatus: jest.fn(),
      end: jest.fn(),
    } as unknown as Span;

    mockTracer = {
      startActiveSpan: jest.fn((name, callback) => callback(mockSpan)),
    };

    mockLogger = {
      debug: jest.fn(),
      warn: jest.fn(),
    };

    (context.with as jest.Mock).mockImplementation((ctx, callback) => callback());
    (TelemetryManager.getTracer as jest.Mock).mockReturnValue(mockTracer);
    (LoggerManager.getLogger as jest.Mock).mockReturnValue(mockLogger);

    queue = new SimpleQueue(mockOptions);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("enqueue should add task to queue and start processing", async () => {
    await queue.enqueue(mockTask);

    expect(context.with).toHaveBeenCalledWith(mockTask.telemetryContext, expect.any(Function));
    expect(mockTracer.startActiveSpan).toHaveBeenCalledWith("queue.task.pickup-wait", expect.any(Function));
    expect(mockSpan.setAttribute).toHaveBeenCalledWith("id", mockTask.id);
    expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining("SimpleQueue.enqueue invoked"));
    expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining("SimpleQueue.enqueue task enqueued"));
  });

  test("executeWithRetry should retry on failure", async () => {
    const mockError = new Error("Test error");
    mockTask.execute = jest
      .fn()
      .mockRejectedValueOnce(mockError)
      .mockRejectedValueOnce(mockError)
      .mockResolvedValueOnce({ data: "success" });

    const result = await (queue as any).executeWithRetry(mockTask, mockOptions.retryCount);

    expect(result).toEqual({ data: "success" });
    expect(mockTask.execute).toHaveBeenCalledTimes(3);
    expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining("SimpleQueue.executeWithRetry invoked"));
    expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: SpanStatusCode.OK });
  });

  test("executeWithTimeout should resolve within timeout", async () => {
    const mockResponse = { data: "test" };
    mockTask.execute = jest.fn().mockResolvedValue(mockResponse);

    const result = await (queue as any).executeWithTimeout(mockTask, mockContext);

    expect(result).toEqual(mockResponse);
    expect(mockTask.execute).toHaveBeenCalledWith(mockTask.request, mockContext);
    expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining("SimpleQueue.executeWithTimeout invoked"));
    expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining("SimpleQueue.executeWithTimeout task completed"));
  });

  test("executeWithTimeout should reject on timeout", async () => {
    jest.useFakeTimers();
    mockTask.execute = jest.fn().mockImplementation(() => new Promise(() => {}));

    const executePromise = (queue as any).executeWithTimeout(mockTask, mockContext);
    jest.advanceTimersByTime(mockOptions.timeout + 100);

    await expect(executePromise).rejects.toThrow(QueueTaskTimeoutError);
    expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining("SimpleQueue.executeWithTimeout timed out"));

    jest.useRealTimers();
  });

  // test("executeWithRetry should handle HttpRequestError with rate limiting", async () => {
  //   const mockHttpError = new HttpRequestError(
  //     "Rate limit exceeded",
  //     429,
  //     { "retry-after": "1420" },
  //     {}
  //   );
  //   mockTask.execute = jest.fn()
  //     .mockRejectedValueOnce(mockHttpError)
  //     .mockResolvedValueOnce({ data: "success" });

  //   (GatewayCompleteChatRequest.safeParse as jest.Mock).mockReturnValue({
  //     success: true,
  //     data: {
  //       model: {
  //         getRetryDelay: jest.fn().mockReturnValue({ shouldRetry: true, delayMs: 1000 }),
  //       },
  //     },
  //   });

  //   const result = await (queue as any).executeWithRetry(mockTask, mockOptions.retryCount);

  //   expect(result).toEqual({ data: "success" });
  //   expect(mockTask.execute).toHaveBeenCalledTimes(2);
  //   expect(mockLogger.warn).toHaveBeenCalledWith(expect.stringContaining("SimpleQueue.executeWithRetry rate limiting error"));
  // });

  describe("Performance tests", () => {
    test("should handle a large number of tasks efficiently", async () => {
      const taskCount = 1000;
      const results: string[] = [];

      const createTask = (id: string): QueueTask<string, string> => ({
        id,
        request: id,
        cache: { get: jest.fn(), set: jest.fn(), delete: jest.fn(), clear: jest.fn() },
        execute: jest.fn().mockResolvedValue(id),
        resolve: (value) => results.push(value),
        reject: jest.fn(),
        telemetryContext: {} as Context,
      });

      const startTime = performance.now();

      for (let i = 0; i < taskCount; i++) {
        await queue.enqueue(createTask(`task-${i}`));
      }

      while (results.length < taskCount) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(results.length).toBe(taskCount);
      expect(duration).toBeLessThan(10000); // Adjust this threshold as needed
      console.log(`Processed ${taskCount} tasks in ${duration.toFixed(2)}ms`);
    });

    test("should maintain performance under high concurrency", async () => {
      const taskCount = 100;
      const results: string[] = [];
      const highConcurrencyOptions: QueueOptionsType = { ...mockOptions, maxConcurrentTasks: 50 };
      const highConcurrencyQueue = new SimpleQueue<string, string>(highConcurrencyOptions);

      const createTask = (id: string): QueueTask<string, string> => ({
        id,
        request: id,
        execute: jest.fn().mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(id), 50))),
        resolve: (value) => results.push(value),
        reject: jest.fn(),
        cache: { get: jest.fn(), set: jest.fn(), delete: jest.fn(), clear: jest.fn() },
        telemetryContext: {} as Context,
      });

      const startTime = performance.now();

      for (let i = 0; i < taskCount; i++) {
        await highConcurrencyQueue.enqueue(createTask(`task-${i}`));
      }

      while (results.length < taskCount) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(results.length).toBe(taskCount);
      expect(duration).toBeLessThan(5000); // Adjust this threshold as needed
      console.log(`Processed ${taskCount} tasks with high concurrency in ${duration.toFixed(2)}ms`);
    });

    test("should handle tasks with varying execution times", async () => {
      const taskCount = 100;
      const results: string[] = [];

      const createTask = (id: string, executionTime: number): QueueTask<string, string> => ({
        id,
        request: id,
        execute: jest.fn().mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(id), executionTime))),
        resolve: (value) => results.push(value),
        reject: jest.fn(),
        cache: { get: jest.fn(), set: jest.fn(), delete: jest.fn(), clear: jest.fn() },
        telemetryContext: {} as Context,
      });

      const startTime = performance.now();

      for (let i = 0; i < taskCount; i++) {
        const executionTime = Math.random() * 100; // Random execution time between 0-100ms
        await queue.enqueue(createTask(`task-${i}`, executionTime));
      }

      while (results.length < taskCount) {
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(results.length).toBe(taskCount);
      expect(duration).toBeLessThan(8000); // Adjust this threshold as needed
      console.log(`Processed ${taskCount} tasks with varying execution times in ${duration.toFixed(2)}ms`);
    });
  });
});
