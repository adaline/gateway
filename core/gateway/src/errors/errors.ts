import { GatewayBaseError } from "@adaline/types";

class GatewayError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number = 500, data?: unknown) {
    super(message);
    this.name = "GatewayError";
    this.status = status;
    this.data = data;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GatewayError);
    }
  }
}

const GatewayTelemetryErrorLiteral = "GatewayTelemetryError" as const;
class GatewayTelemetryError extends GatewayBaseError {
  readonly info: string;
  readonly cause: unknown;

  constructor({ info, cause }: { info: string; cause: unknown }) {
    super({ info, cause }, GatewayTelemetryErrorLiteral);
    this.info = info;
    this.cause = cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static isGatewayTelemetryError(error: unknown): error is GatewayTelemetryError {
    return error instanceof GatewayTelemetryError;
  }
}

export { GatewayError, GatewayTelemetryError };
