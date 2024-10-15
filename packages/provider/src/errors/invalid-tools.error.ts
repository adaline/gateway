import { GatewayBaseError } from "@adaline/types";

const InvalidToolsErrorLiteral = "InvalidToolsError" as const;
export class InvalidToolsError extends GatewayBaseError {
  readonly name = InvalidToolsErrorLiteral;
  readonly info: string;
  readonly cause: unknown;

  constructor({ info, cause }: { info: string; cause: unknown }) {
    super({ info, cause }, InvalidToolsErrorLiteral);
    this.cause = cause;
    this.info = info;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static isInvalidToolsError(error: unknown): error is InvalidToolsError {
    return error instanceof InvalidToolsError;
  }
}
