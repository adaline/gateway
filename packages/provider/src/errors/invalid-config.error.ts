import { GatewayBaseError } from "@adaline/types";

const InvalidConfigErrorLiteral = "InvalidConfigError" as const;
export class InvalidConfigError extends GatewayBaseError {
  readonly name = InvalidConfigErrorLiteral;
  readonly info: string;
  readonly cause: unknown;

  constructor({ info, cause }: { info: string; cause: unknown }) {
    super({ info, cause }, InvalidConfigErrorLiteral);
    this.cause = cause;
    this.info = info;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static isInvalidConfigError(error: unknown): error is InvalidConfigError {
    return error instanceof InvalidConfigError;
  }
}
