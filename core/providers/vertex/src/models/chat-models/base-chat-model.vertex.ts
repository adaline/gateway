import { SignJWT } from "jose";
import { z } from "zod";

import { BaseChatModel } from "@adaline/google";
import { ChatModelSchemaType, HeadersType, ModelError, ModelResponseError } from "@adaline/provider";
import { ChatModelPriceType } from "@adaline/types";

import { Vertex } from "../../provider/provider.vertex";
import pricingData from "../pricing.json";

const BaseChatModelOptions = z.discriminatedUnion("authType", [
  z.object({
    authType: z.literal("accessToken"),
    accessToken: z.string(),
    modelName: z.string(),
    baseUrl: z.string().url().optional(),
    location: z.string().optional(),
    projectId: z.string().optional(),
    publisher: z.string().optional(),
  }),
  z.object({
    authType: z.literal("serviceAccount"),
    serviceAccount: z.object({
      client_email: z.string().email(),
      private_key: z.string(),
      type: z.string().optional(),
      project_id: z.string().optional(),
      private_key_id: z.string().optional(),
      client_id: z.string().optional(),
      auth_uri: z.string().url().optional(),
      token_uri: z.string().url().optional(),
      auth_provider_x509_cert_url: z.string().url().optional(),
      client_x509_cert_url: z.string().url().optional(),
      universe_domain: z.string().optional(),
    }),

    modelName: z.string(),
    baseUrl: z.string().url().optional(),
    location: z.string().optional(),
    projectId: z.string().optional(),
    publisher: z.string().optional(),
    tokenLifetimeHours: z.number().min(0.1).max(24).default(1),
  }),
]);
type BaseChatModelOptionsType = z.infer<typeof BaseChatModelOptions>;

class BaseChatModelVertex extends BaseChatModel {
  readonly version = "v1" as const;
  modelSchema: ChatModelSchemaType;
  modelName: string;

  private readonly authOptions: BaseChatModelOptionsType;
  private readonly location: string | undefined;
  private readonly projectId: string | undefined;
  private readonly publisher: string | undefined;
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(modelSchema: ChatModelSchemaType, options: BaseChatModelOptionsType) {
    const parsedOptions = BaseChatModelOptions.parse(options);
    let baseUrl: string | undefined;

    if (parsedOptions.baseUrl) {
      baseUrl = parsedOptions.baseUrl;
    } else if (parsedOptions.location && parsedOptions.projectId) {
      baseUrl = Vertex.baseUrl(parsedOptions.location, parsedOptions.projectId, parsedOptions.publisher);
    } else {
      throw new ModelError({
        info: "Either 'baseUrl' must be provided or 'location' and 'projectId' must be provided",
        cause: new Error("Either 'baseUrl' must be provided or 'location' and 'projectId' must be provided"),
      });
    }

    super(modelSchema, {
      modelName: parsedOptions.modelName,
      apiKey: "random-api-key",
      completeChatUrl: `${baseUrl}/models/${parsedOptions.modelName}:generateContent`,
      streamChatUrl: `${baseUrl}/models/${parsedOptions.modelName}:streamGenerateContent`,
    });

    this.modelSchema = modelSchema;
    this.modelName = parsedOptions.modelName;
    this.authOptions = parsedOptions;
    this.location = parsedOptions.location;
    this.projectId = parsedOptions.projectId;
    this.publisher = parsedOptions.publisher;

    // Initialize access token for accessToken auth type
    if (parsedOptions.authType === "accessToken") {
      this.accessToken = parsedOptions.accessToken;
    }
  }

  private async getAccessToken(): Promise<string> {
    // If we have a valid access token, return it
    if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    // For service account auth, generate a new token
    if (this.authOptions.authType === "serviceAccount") {
      try {
        const serviceAccountConfig = this.authOptions.serviceAccount;

        // Create JWT token for Google service account
        const now = Math.floor(Date.now() / 1000);
        const token = await new SignJWT({
          scope: "https://www.googleapis.com/auth/cloud-platform",
          aud: "https://oauth2.googleapis.com/token",
        })
          .setProtectedHeader({ alg: "RS256", typ: "JWT" })
          .setIssuedAt(now)
          .setExpirationTime(now + this.authOptions.tokenLifetimeHours * 3600)
          .setIssuer(serviceAccountConfig.client_email)
          .setSubject(serviceAccountConfig.client_email)
          .sign(await this.importPrivateKey(serviceAccountConfig.private_key));

        // Exchange JWT for access token
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
            assertion: token,
          }),
        });

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text();
          throw new Error(`Token exchange failed: ${tokenResponse.status} ${errorText}`);
        }

        const tokenData = (await tokenResponse.json()) as { access_token?: string; error?: string };

        if (!tokenData.access_token) {
          throw new Error(`No access token received from Google OAuth: ${tokenData.error || "Unknown error"}`);
        }

        this.tokenExpiry = Date.now() + this.authOptions.tokenLifetimeHours * 3600 * 1000 - 5 * 60 * 1000;
        this.accessToken = tokenData.access_token;
        return this.accessToken;
      } catch (error) {
        throw new ModelError({
          info: `Failed to generate service account token: ${error instanceof Error ? error.message : String(error)}`,
          cause: error instanceof Error ? error : new Error(String(error)),
        });
      }
    }

    // For access token auth, return the stored token
    if (this.accessToken) {
      return this.accessToken;
    }

    throw new ModelError({
      info: "No valid access token available",
      cause: new Error("No valid access token available"),
    });
  }

  private async importPrivateKey(privateKeyPem: string): Promise<CryptoKey> {
    // Remove PEM headers and convert to raw key
    const privateKeyRaw = privateKeyPem
      .replace(/-----BEGIN PRIVATE KEY-----/, "")
      .replace(/-----END PRIVATE KEY-----/, "")
      .replace(/\s/g, "");

    // Convert base64 to ArrayBuffer
    const binaryString = atob(privateKeyRaw);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Import the private key
    return await crypto.subtle.importKey(
      "pkcs8",
      bytes,
      {
        name: "RSASSA-PKCS1-v1_5",
        hash: "SHA-256",
      },
      false,
      ["sign"]
    );
  }

  async ensureToken(): Promise<void> {
    if (this.authOptions.authType === "serviceAccount") {
      await this.getAccessToken();
    }
  }

  getDefaultHeaders(): HeadersType {
    return {
      ...super.getDefaultHeaders(),
      Authorization: `Bearer ${this.accessToken}`,
    };
  }

  async getCompleteChatHeaders(config?: any, messages?: any, tools?: any): Promise<HeadersType> {
    await this.ensureToken();
    return this.getDefaultHeaders();
  }

  async getStreamChatHeaders(config?: any, messages?: any, tools?: any): Promise<HeadersType> {
    await this.ensureToken();
    return this.getDefaultHeaders();
  }

  getModelPricing(): ChatModelPriceType {
    // Check if the modelName exists in pricingData before accessing it
    if (!(this.modelName in pricingData)) {
      throw new ModelResponseError({
        info: `Invalid model pricing for model : '${this.modelName}'`,
        cause: new Error(`No pricing configuration found for model "${this.modelName}"`),
      });
    }

    const entry = pricingData[this.modelName as keyof typeof pricingData];
    return entry as ChatModelPriceType;
  }
}

export { BaseChatModelOptions, BaseChatModelVertex, type BaseChatModelOptionsType };
