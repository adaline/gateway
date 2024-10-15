import { GatewayBaseError } from "@adaline/types";

const ModelErrorLiteral = "ModelError" as const;
export class ModelError extends GatewayBaseError {
  readonly name = ModelErrorLiteral;
  readonly info: string;
  readonly cause: unknown;

  constructor({ info, cause }: { info: string; cause: unknown }) {
    super({ info, cause }, ModelErrorLiteral);
    this.info = info;
    this.cause = cause;
  }

  static isModelError(error: unknown): error is ModelError {
    return error instanceof ModelError;
  }
}
