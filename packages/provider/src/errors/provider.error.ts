import { GatewayBaseError } from "@adaline/types";

const ProviderErrorLiteral = "ProviderError" as const;
export class ProviderError extends GatewayBaseError {
  readonly name = ProviderErrorLiteral;
  readonly info: string;
  readonly cause: unknown;

  constructor({ info, cause }: { info: string; cause: unknown }) {
    super({ info, cause }, ProviderErrorLiteral);
    this.info = info;
    this.cause = cause;
  }

  static isProviderError(error: unknown): error is ProviderError {
    return error instanceof ProviderError;
  }
}
