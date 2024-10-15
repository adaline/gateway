import { GatewayBaseError } from "@adaline/types";

const QueueTaskTimeoutErrorLiteral = "QueueTaskTimeoutError" as const;
class QueueTaskTimeoutError extends GatewayBaseError {
  readonly info: string;
  readonly cause: unknown;

  constructor({ info, cause }: { info: string; cause: unknown }) {
    super({ info, cause }, QueueTaskTimeoutErrorLiteral);
    this.info = info;
    this.cause = cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static isQueueTaskTimeoutError(error: unknown): error is QueueTaskTimeoutError {
    return error instanceof QueueTaskTimeoutError;
  }
}

export { QueueTaskTimeoutError };
