import { Context, context, Span, SpanStatusCode, Tracer } from "@opentelemetry/api";
import { ATTR_HTTP_REQUEST_METHOD, ATTR_URL_FULL } from "@opentelemetry/semantic-conventions";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import type { ProxyAgent } from "proxy-agent";
import { z } from "zod";

import { LoggerManager } from "../../plugins";
import { TelemetryManager } from "../../plugins/telemetry";
import { HttpClientError, HttpRequestError } from "./http-client.error";
import { HttpClient, HttpClientOptions, HttpClientResponse } from "./http-client.interface";

const convertHeadersToRecord = (headers: any): Record<string, string> => {
  const headerRecord: Record<string, string> = {};
  if (headers && (typeof headers === "object" || headers instanceof Headers)) {
    Object.entries(headers).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        headerRecord[key] = value.join(", ");
      } else if (typeof value === "string") {
        headerRecord[key] = value;
      } else {
        headerRecord[key] = "";
      }
    });
  }

  return headerRecord;
};

const axiosToHttpRequestError = (error: AxiosError): HttpRequestError => {
  const message = error?.message || "An unexpected error occurred";
  const status = error?.response?.status || 500;
  const headers = convertHeadersToRecord(error?.response?.headers) || {};
  const data = error?.response?.data || {};
  return new HttpRequestError(message, status, headers, data);
};

interface IsomorphicHttpClientConfig {
  timeoutInMilliseconds?: number;
  axiosInstance?: AxiosInstance;
  telemetryTracer?: Tracer;
  enableProxyAgent?: boolean;
}

class IsomorphicHttpClient implements HttpClient {
  private defaultTimeout?: number;
  private client: AxiosInstance;
  private httpProxyAgent?: ProxyAgent;
  private httpsProxyAgent?: ProxyAgent;
  private enableProxyAgent: boolean;

  constructor(config: IsomorphicHttpClientConfig) {
    const { axiosInstance, timeoutInMilliseconds, enableProxyAgent } = config;
    this.client = axiosInstance || axios.create();

    const Timeout = z.number().int().positive().optional();
    this.defaultTimeout = Timeout.parse(timeoutInMilliseconds);

    this.client.defaults.timeout = this.defaultTimeout;

    // Enable proxy agent by default unless explicitly disabled
    this.enableProxyAgent = enableProxyAgent ?? true;

    if (this.enableProxyAgent) {
      // Use require here to avoid importing in a browser build
      const ProxyAgent = require("proxy-agent");
      this.httpProxyAgent = new ProxyAgent.ProxyAgent();
      this.httpsProxyAgent = new ProxyAgent.ProxyAgent({
        rejectUnauthorized: false, // Don't check SSL cert
      });
    }
    const logger = LoggerManager.getLogger();
    logger?.debug(`IsomorphicHttpClient initialized with defaultTimeout: ${this.defaultTimeout}`);
  }

  isNodeEnvironment = (): boolean => {
    return typeof process !== "undefined" && process.versions != null && process.versions.node != null;
  };

  private async makeRequest<T>(
    method: "get" | "post" | "put" | "delete" | "patch",
    url: string,
    dataOrParams: Record<string, unknown>,
    additionalConfig: AxiosRequestConfig = {},
    options?: HttpClientOptions,
    telemetryContext?: Context
  ): Promise<HttpClientResponse<T>> {
    const logger = LoggerManager.getLogger();

    const _makeRequest = async <T>(span?: Span): Promise<HttpClientResponse<T>> => {
      const executeRequest = async (): Promise<HttpClientResponse<T>> => {
        try {
          const config: AxiosRequestConfig = {
            ...(method === "get" || method === "delete" ? { params: dataOrParams } : { data: dataOrParams }),
            ...additionalConfig,
            timeout: this.defaultTimeout,
            ...(this.enableProxyAgent
              ? {
                  httpAgent: this.httpProxyAgent,
                  httpsAgent: this.httpsProxyAgent,
                }
              : {}),
          };

          if (method === "get" || method === "delete") {
            const resp = await this.client[method]<T>(url, config);
            const response = {
              data: resp.data,
              headers: convertHeadersToRecord(resp.headers),
              status: {
                code: resp.status,
                text: resp.statusText,
              },
            };
            logger?.debug("IsomorphicHttpClient.makeRequest response: ", response);
            return response;
          } else {
            const resp = await this.client[method]<T>(url, config.data, {
              ...config,
              params: config.params,
            });
            const response = {
              data: resp.data,
              headers: convertHeadersToRecord(resp.headers),
              status: {
                code: resp.status,
                text: resp.statusText,
              },
            };
            logger?.debug("IsomorphicHttpClient.makeRequest response: ", response);
            return response;
          }
        } catch (error) {
          logger?.warn("IsomorphicHttpClient.makeRequest error: ", error);
          if (axios.isAxiosError(error)) throw axiosToHttpRequestError(error);
          throw new HttpClientError({ info: "An unexpected error occurred", cause: error });
        }
      };

      try {
        // If no retry configuration, execute once
        if (!options?.retry) {
          const result = await executeRequest();
          span?.setStatus({ code: SpanStatusCode.OK, message: "request successful" });
          return result;
        }

        // Retry logic with exponential backoff
        const retryConfig = options.retry;
        let lastError: any;

        for (let attempt = 1; attempt <= retryConfig.maxAttempts; attempt++) {
          try {
            const result = await executeRequest();
            // If successful, return the result
            span?.setStatus({ code: SpanStatusCode.OK, message: "request successful" });
            return result;
          } catch (error) {
            lastError = error;
            logger?.warn(`IsomorphicHttpClient.makeRequest attempt ${attempt} failed: `, error);

            // If this is the last attempt, don't wait and throw the error
            if (attempt === retryConfig.maxAttempts) {
              break;
            }

            // Calculate delay with exponential backoff
            const delay = retryConfig.initialDelay * Math.pow(retryConfig.exponentialFactor, attempt - 1);
            logger?.debug(`IsomorphicHttpClient.makeRequest retrying after ${delay}ms (attempt ${attempt}/${retryConfig.maxAttempts})`);

            // Wait before retrying
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }

        // If we get here, all attempts failed
        span?.setStatus({ code: SpanStatusCode.ERROR, message: "request failed after all retry attempts" });
        throw lastError;
      } catch (error) {
        span?.setStatus({ code: SpanStatusCode.ERROR, message: "request failed" });
        throw error;
      } finally {
        span?.end();
      }
    };

    if (!telemetryContext) {
      return _makeRequest<T>();
    }

    return await context.with(telemetryContext, async () => {
      const tracer = TelemetryManager.getTracer();
      return await tracer.startActiveSpan("http.request", async (span: Span) => {
        span.setAttribute(ATTR_HTTP_REQUEST_METHOD, method.toUpperCase());
        span.setAttribute(ATTR_URL_FULL, url);
        return await _makeRequest<T>(span);
      });
    });
  }

  async *stream<T>(
    url: string,
    method: "get" | "post",
    data?: Record<string, unknown>,
    headers?: Record<string, string>,
    options?: {
      abortSignal?: AbortSignal;
    },
    telemetryContext?: Context
  ): AsyncGenerator<T, void, unknown> {
    const logger = LoggerManager.getLogger();
    logger?.debug(`IsomorphicHttpClient.STREAM request to ${url}`, { data, headers });
    const _stream = async function* (this: IsomorphicHttpClient, span?: Span): AsyncGenerator<T, void, unknown> {
      // Record the time we start the request for TTFT measurement
      const requestStart = Date.now();
      let timeToFirstTokenSet = false;

      try {
        if (this.isNodeEnvironment()) {
          logger?.debug("IsomorphicHttpClient.stream in node environment");
          const response = await this.client.request({
            method,
            url,
            headers,
            data,
            responseType: "stream",
            signal: options?.abortSignal,
          });

          for await (const chunk of response.data) {
            // Set time-to-first-token if this is the first chunk
            if (!timeToFirstTokenSet) {
              const ttfb = Date.now() - requestStart;
              span?.setAttribute("time-to-first-token", ttfb);
              timeToFirstTokenSet = true;
            }
            span?.addEvent("stream.chunk", { message: "stream chunk received" });
            const decodedChunk = chunk.toString();
            logger?.debug("IsomorphicHttpClient.stream chunk: ", decodedChunk);
            yield decodedChunk as unknown as T;
          }
          span?.setStatus({ code: SpanStatusCode.OK, message: "stream successful" });
        } else {
          logger?.debug("IsomorphicHttpClient.stream in browser environment");
          const fetchConfig: RequestInit = {
            method,
            headers: new Headers({
              ...headers,
            }),
            body: method !== "get" ? JSON.stringify(data) : undefined,
            signal: options?.abortSignal,
          };
          const response = await fetch(url, fetchConfig);

          if (!response.ok) {
            logger?.warn("IsomorphicHttpClient.stream response not ok: ", response);
            span?.setStatus({ code: SpanStatusCode.ERROR, message: "stream failed" });
            const text: any = await response.json();
            throw new HttpRequestError(
              `Request failed with status ${response.status}`,
              response.status,
              convertHeadersToRecord(response.headers),
              text
            );
          }

          if (response.body) {
            const reader = response.body.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                // Set time-to-first-token if we receive data on the last chunk
                if (!timeToFirstTokenSet && value) {
                  const ttfb = Date.now() - requestStart;
                  span?.setAttribute("time-to-first-token", ttfb);
                  timeToFirstTokenSet = true;
                }
                span?.addEvent("stream.chunk", { message: "stream chunk received" });
                const decodedValue = new TextDecoder().decode(value, { stream: true });
                logger?.debug("IsomorphicHttpClient.stream chunk: ", decodedValue);
                yield decodedValue as unknown as T;
                break;
              }

              // Set time-to-first-token if this is the first chunk
              if (!timeToFirstTokenSet) {
                const ttfb = Date.now() - requestStart;
                span?.setAttribute("time-to-first-token", ttfb);
                timeToFirstTokenSet = true;
              }
              span?.addEvent("stream.chunk", { message: "stream chunk received" });
              const decodedValue = new TextDecoder().decode(value, { stream: true });
              logger?.debug("IsomorphicHttpClient.stream chunk: ", decodedValue);
              yield decodedValue as unknown as T;
            }
            span?.setStatus({ code: SpanStatusCode.OK, message: "stream successful" });
          } else {
            logger?.warn("IsomorphicHttpClient.stream response has no body");
            span?.setStatus({ code: SpanStatusCode.ERROR, message: "stream failed" });
            throw new HttpRequestError("Cannot stream the body of the response.", 500, {}, response);
          }
        }
      } catch (error: any) {
        logger?.warn("IsomorphicHttpClient.stream error: ", error);
        span?.setStatus({ code: SpanStatusCode.ERROR, message: "stream failed" });
        if (HttpRequestError.isHttpRequestError(error)) throw error;
        if (error?.name === "AbortError") throw new HttpRequestError("AbortError", 408, {}, {});
        if (error?.name === "CanceledError") throw new HttpRequestError("AbortError", 408, {}, {});
        // TODO: how to convert non-axios errors to HttpRequestError for fetch aka browser environment
        if (axios.isAxiosError(error)) throw axiosToHttpRequestError(error);
        throw new HttpClientError({ info: "An unexpected error occurred", cause: error });
      } finally {
        span?.end();
      }
    }.bind(this);

    if (!telemetryContext) {
      return yield* _stream();
    }

    return yield* await context.with(telemetryContext, async () => {
      const tracer = TelemetryManager.getTracer();
      return await tracer.startActiveSpan("http.stream", async (span: Span) => {
        span.setAttribute(ATTR_HTTP_REQUEST_METHOD, method.toUpperCase());
        span.setAttribute(ATTR_URL_FULL, url);
        return await _stream(span);
      });
    });
  }

  async get<T>(
    url: string,
    params?: Record<string, unknown>,
    headers?: Record<string, string | undefined>,
    options?: HttpClientOptions,
    telemetryContext?: Context
  ): Promise<HttpClientResponse<T>> {
    const logger = LoggerManager.getLogger();
    logger?.debug(`IsomorphicHttpClient.GET request to ${url}`, { params, headers });
    return this.makeRequest<T>("get", url, params || {}, { headers }, options, telemetryContext);
  }

  async post<T>(
    url: string,
    data?: Record<string, unknown>,
    headers?: Record<string, string | undefined>,
    options?: HttpClientOptions,
    telemetryContext?: Context
  ): Promise<HttpClientResponse<T>> {
    const logger = LoggerManager.getLogger();
    logger?.debug(`IsomorphicHttpClient.POST request to ${url}`, { data, headers });
    return this.makeRequest<T>("post", url, data || {}, { headers }, options, telemetryContext);
  }

  async put<T>(
    url: string,
    data?: Record<string, unknown>,
    headers?: Record<string, string | undefined>,
    options?: HttpClientOptions,
    telemetryContext?: Context
  ): Promise<HttpClientResponse<T>> {
    const logger = LoggerManager.getLogger();
    logger?.debug(`IsomorphicHttpClient.PUT request to ${url}`, { data, headers });
    return this.makeRequest<T>("put", url, data || {}, { headers }, options, telemetryContext);
  }

  async delete<T>(
    url: string,
    params?: Record<string, unknown>,
    headers?: Record<string, string | undefined>,
    options?: HttpClientOptions,
    telemetryContext?: Context
  ): Promise<HttpClientResponse<T>> {
    const logger = LoggerManager.getLogger();
    logger?.debug(`IsomorphicHttpClient.DELETE request to ${url}`, { params, headers });
    return this.makeRequest<T>("delete", url, params || {}, { headers }, options, telemetryContext);
  }

  async patch<T>(
    url: string,
    data?: Record<string, unknown>,
    headers?: Record<string, string | undefined>,
    options?: HttpClientOptions,
    telemetryContext?: Context
  ): Promise<HttpClientResponse<T>> {
    const logger = LoggerManager.getLogger();
    logger?.debug(`IsomorphicHttpClient.PATCH request to ${url}`, { data, headers });
    return this.makeRequest<T>("patch", url, data || {}, { headers }, options, telemetryContext);
  }
}

export { IsomorphicHttpClient };
