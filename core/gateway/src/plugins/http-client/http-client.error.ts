import { GatewayBaseError } from "@adaline/types";

const HttpClientErrorLiteral = "HttpClientError" as const;
class HttpClientError extends GatewayBaseError {
  readonly info: string;
  readonly cause: unknown;

  constructor({ info, cause }: { info: string; cause: unknown }) {
    super({ info, cause }, HttpClientErrorLiteral);
    this.info = info;
    this.cause = cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static isHttpClientError(error: unknown): error is HttpClientError {
    return error instanceof HttpClientError;
  }
}

const HttpRequestErrorLiteral = "HttpRequestError" as const;
class HttpRequestError extends GatewayBaseError {
  readonly info: string;
  readonly cause: {
    status: number;
    headers: Record<string, string>;
    data: unknown;
  };

  constructor(message: string, status: number = 500, headers: Record<string, string>, data: unknown) {
    super({ info: message, cause: { status, headers, data } }, HttpRequestErrorLiteral);
    this.info = message;
    this.cause = { status, headers, data };
    Object.setPrototypeOf(this, new.target.prototype);
  }

  static isHttpRequestError(error: unknown): error is HttpRequestError {
    return error instanceof HttpRequestError;
  }
}

export { HttpClientError, HttpRequestError };
