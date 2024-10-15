import { GatewayBaseError } from "@adaline/types";

const InvalidEmbeddingRequestsErrorLiteral = "InvalidEmbeddingRequestsError" as const;
export class InvalidEmbeddingRequestsError extends GatewayBaseError {
  readonly name = InvalidEmbeddingRequestsErrorLiteral;
  readonly info: string;
  readonly cause: unknown;

  constructor({ info, cause }: { info: string; cause: unknown }) {
    super({ info, cause }, InvalidEmbeddingRequestsErrorLiteral);
    this.info = info;
    this.cause = cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static isInvalidEmbeddingRequestsError(error: unknown): error is InvalidEmbeddingRequestsError {
    return error instanceof InvalidEmbeddingRequestsError;
  }
}
