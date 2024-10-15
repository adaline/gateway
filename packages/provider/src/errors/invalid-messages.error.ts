import { GatewayBaseError } from "@adaline/types";

const InvalidMessagesErrorLiteral = "InvalidMessagesError" as const;
export class InvalidMessagesError extends GatewayBaseError {
  readonly name = InvalidMessagesErrorLiteral;
  readonly info: string;
  readonly cause: unknown;

  constructor({ info, cause }: { info: string; cause: unknown }) {
    super({ info, cause }, InvalidMessagesErrorLiteral);
    this.cause = cause;
    this.info = info;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static isInvalidMessagesError(error: unknown): error is InvalidMessagesError {
    return error instanceof InvalidMessagesError;
  }
}
