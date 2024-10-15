import { Context } from "@opentelemetry/api";

interface HttpClient {
  stream<T>(
    url: string,
    method: "get" | "post",
    data?: Record<string, unknown>,
    headers?: Record<string, string>,
    options?: {
      abortSignal?: AbortSignal;
    },
    telemetryContext?: Context
  ): AsyncGenerator<T, void, unknown>;
  get<T>(
    url: string,
    params?: Record<string, unknown>,
    headers?: Record<string, string | undefined>,
    telemetryContext?: Context
  ): Promise<HttpClientResponse<T>>;
  post<T>(
    url: string,
    data?: Record<string, unknown>,
    headers?: Record<string, string | undefined>,
    telemetryContext?: Context
  ): Promise<HttpClientResponse<T>>;
  put<T>(
    url: string,
    data?: Record<string, unknown>,
    headers?: Record<string, string | undefined>,
    telemetryContext?: Context
  ): Promise<HttpClientResponse<T>>;
  delete<T>(
    url: string,
    params?: Record<string, unknown>,
    headers?: Record<string, string | undefined>,
    telemetryContext?: Context
  ): Promise<HttpClientResponse<T>>;
  patch<T>(
    url: string,
    data?: Record<string, unknown>,
    headers?: Record<string, string | undefined>,
    telemetryContext?: Context
  ): Promise<HttpClientResponse<T>>;
}

interface HttpClientResponse<T> {
  data: T;
  headers: Record<string, string>;
  status: {
    code: number;
    text: string;
  };
}

export { type HttpClient, type HttpClientResponse };
