import { Context, context, Span, SpanStatusCode, Tracer } from "@opentelemetry/api";
import { ATTR_HTTP_REQUEST_METHOD, ATTR_URL_FULL } from "@opentelemetry/semantic-conventions";
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { ProxyAgent } from "proxy-agent";
import { z } from "zod";

import { LoggerManager } from "../../plugins";
import { TelemetryManager } from "../../plugins/telemetry";
import { HttpClientError, HttpRequestError } from "./http-client.error";
import { HttpClient, HttpClientResponse } from "./http-client.interface";

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
}

class IsomorphicHttpClient implements HttpClient {
  private defaultTimeout?: number;
  private client: AxiosInstance;
  private httpProxyAgent?: ProxyAgent;
  private httpsProxyAgent?: ProxyAgent;

  constructor(config: IsomorphicHttpClientConfig) {
    const { axiosInstance, timeoutInMilliseconds } = config;
    this.client = axiosInstance || axios.create();

    const Timeout = z.number().int().positive().optional();
    this.defaultTimeout = Timeout.parse(timeoutInMilliseconds);

    this.client.defaults.timeout = this.defaultTimeout;
    this.httpProxyAgent = new ProxyAgent();
    this.httpsProxyAgent = new ProxyAgent({
      rejectUnauthorized: false, // Don't check SSL cert
    });
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
    telemetryContext?: Context
  ): Promise<HttpClientResponse<T>> {
    const logger = LoggerManager.getLogger();
    const _makeRequest = async <T>(span?: Span): Promise<HttpClientResponse<T>> => {
      try {
        const config: AxiosRequestConfig = {
          ...(method === "get" || method === "delete" ? { params: dataOrParams } : { data: dataOrParams }),
          ...additionalConfig,
          timeout: this.defaultTimeout,
          httpAgent: this.httpProxyAgent,
          httpsAgent: this.httpsProxyAgent,
        };

        if (method === "get" || method === "delete") {
          const resp = await this.client[method]<T>(url, config);
          span?.setStatus({ code: SpanStatusCode.OK, message: "request successful" });
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
          span?.setStatus({ code: SpanStatusCode.OK, message: "request successful" });
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
        span?.setStatus({ code: SpanStatusCode.ERROR, message: "request failed" });
        if (axios.isAxiosError(error)) throw axiosToHttpRequestError(error);
        throw new HttpClientError({ info: "An unexpected error occurred", cause: error });
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

  // TODO: needs testing for with context and without context
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
                span?.addEvent("stream.chunk", { message: "stream chunk received" });
                const decodedValue = new TextDecoder().decode(value, { stream: true });
                logger?.debug("IsomorphicHttpClient.stream chunk: ", decodedValue);
                yield decodedValue as unknown as T;
                break;
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
    telemetryContext?: Context
  ): Promise<HttpClientResponse<T>> {
    const logger = LoggerManager.getLogger();
    logger?.debug(`IsomorphicHttpClient.GET request to ${url}`, { params, headers });
    return this.makeRequest<T>("get", url, params || {}, { headers }, telemetryContext);
  }

  async post<T>(
    url: string,
    data?: Record<string, unknown>,
    headers?: Record<string, string | undefined>,
    telemetryContext?: Context
  ): Promise<HttpClientResponse<T>> {
    const logger = LoggerManager.getLogger();
    logger?.debug(`IsomorphicHttpClient.POST request to ${url}`, { data, headers });
    return this.makeRequest<T>("post", url, data || {}, { headers }, telemetryContext);
  }

  async put<T>(
    url: string,
    data?: Record<string, unknown>,
    headers?: Record<string, string | undefined>,
    telemetryContext?: Context
  ): Promise<HttpClientResponse<T>> {
    const logger = LoggerManager.getLogger();
    logger?.debug(`IsomorphicHttpClient.PUT request to ${url}`, { data, headers });
    return this.makeRequest<T>("put", url, data || {}, { headers }, telemetryContext);
  }

  async delete<T>(
    url: string,
    params?: Record<string, unknown>,
    headers?: Record<string, string | undefined>,
    telemetryContext?: Context
  ): Promise<HttpClientResponse<T>> {
    const logger = LoggerManager.getLogger();
    logger?.debug(`IsomorphicHttpClient.DELETE request to ${url}`, { params, headers });
    return this.makeRequest<T>("delete", url, params || {}, { headers }, telemetryContext);
  }

  async patch<T>(
    url: string,
    data?: Record<string, unknown>,
    headers?: Record<string, string | undefined>,
    telemetryContext?: Context
  ): Promise<HttpClientResponse<T>> {
    const logger = LoggerManager.getLogger();
    logger?.debug(`IsomorphicHttpClient.PATCH request to ${url}`, { data, headers });
    return this.makeRequest<T>("patch", url, data || {}, { headers }, telemetryContext);
  }
}

export { IsomorphicHttpClient };
