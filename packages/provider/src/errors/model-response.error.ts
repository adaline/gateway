import { GatewayBaseError } from "@adaline/types";

const ModelResponseErrorLiteral = "ModelResponseError" as const;
export class ModelResponseError extends GatewayBaseError {
  readonly name = ModelResponseErrorLiteral;
  readonly info: string;
  readonly cause: unknown;

  constructor({ info, cause }: { info: string; cause: unknown }) {
    super({ info, cause }, ModelResponseErrorLiteral);
    this.cause = cause;
    this.info = info;
  }

  static isModelResponseError(error: unknown): error is ModelResponseError {
    return error instanceof ModelResponseError;
  }
}
