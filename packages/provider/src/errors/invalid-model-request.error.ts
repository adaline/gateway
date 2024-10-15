import { GatewayBaseError } from "@adaline/types";

const InvalidModelRequestErrorLiteral = "InvalidModelRequestError" as const;
export class InvalidModelRequestError extends GatewayBaseError {
  readonly name = InvalidModelRequestErrorLiteral;
  readonly info: string;
  readonly cause: unknown;

  constructor({ info, cause }: { info: string; cause: unknown }) {
    super({ info, cause }, InvalidModelRequestErrorLiteral);
    this.cause = cause;
    this.info = info;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static isInvalidModelRequestError(error: unknown): error is InvalidModelRequestError {
    return error instanceof InvalidModelRequestError;
  }
}
