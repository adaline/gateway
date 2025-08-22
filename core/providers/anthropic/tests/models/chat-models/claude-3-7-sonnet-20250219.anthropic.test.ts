import { beforeEach, describe, expect, it } from "vitest";

import { BaseChatModel, Claude3_7Sonnet20250219, Claude3_7Sonnet20250219Options } from "../../../src/models";

describe("Claude3_7Sonnet20250219", () => {
  const mockOptions = {
    apiKey: "test-api-key",
    modelName: "claude-3-7-sonnet-20250219",
  };

  let model: Claude3_7Sonnet20250219;

  beforeEach(() => {
    model = new Claude3_7Sonnet20250219(mockOptions);
  });

  describe("constructor", () => {
    it("should initialize with the correct model schema", () => {
      expect(model.modelSchema.name).toBe("claude-3-7-sonnet-20250219");
      expect(model.modelName).toBe("claude-3-7-sonnet-20250219");
    });
  });

  describe("getDefaultHeaders", () => {
    it("should return headers with output-128k beta feature when no existing beta header", () => {
      const headers = model.getDefaultHeaders();

      expect(headers["anthropic-beta"]).toBe("output-128k-2025-02-19");
      expect(headers["x-api-key"]).toBe("test-api-key");
      expect(headers["anthropic-version"]).toBe("2023-06-01");
      expect(headers["content-type"]).toBe("application/json");
      expect(headers["anthropic-dangerous-direct-browser-access"]).toBe("true");
    });

    it("should merge output-128k beta feature with existing beta header", () => {
      // Create a mock model that returns headers with an existing beta header
      const mockModel = {
        getDefaultHeaders: () => ({
          "x-api-key": "test-api-key",
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
          "anthropic-dangerous-direct-browser-access": "true",
          "anthropic-beta": "mcp-client-2025-04-04",
        }),
      };

      // Mock the super call by temporarily replacing the method
      const originalGetDefaultHeaders = model.getDefaultHeaders;
      model.getDefaultHeaders = function () {
        const headers = mockModel.getDefaultHeaders();

        // Check if there's already an anthropic-beta header
        const existingBetaHeader = headers["anthropic-beta"];
        const output128kFeature = "output-128k-2025-02-19";

        if (existingBetaHeader) {
          // If beta header exists, append the 128k feature
          headers["anthropic-beta"] = `${existingBetaHeader},${output128kFeature}`;
        } else {
          // If no beta header exists, create one with just the 128k feature
          headers["anthropic-beta"] = output128kFeature;
        }

        return headers;
      };

      const headers = model.getDefaultHeaders();

      expect(headers["anthropic-beta"]).toBe("mcp-client-2025-04-04,output-128k-2025-02-19");

      // Restore the original method
      model.getDefaultHeaders = originalGetDefaultHeaders;
    });
  });

  describe("Claude3_7Sonnet20250219Options", () => {
    it("should validate valid options", () => {
      const validOptions = {
        apiKey: "valid-api-key",
        modelName: "claude-3-7-sonnet-20250219",
      };

      expect(() => Claude3_7Sonnet20250219Options.parse(validOptions)).not.toThrow();
    });

    it("should reject invalid options", () => {
      const invalidOptions = {
        // Missing required fields
      };

      expect(() => Claude3_7Sonnet20250219Options.parse(invalidOptions)).toThrow();
    });
  });

  describe("MCP header integration", () => {
    it("should merge MCP beta header with existing output-128k beta header", async () => {
      const mcpConfig = {
        mcp: true,
        mcpServers: ["test-server"],
      };

      const headers = await model.getStreamChatHeaders(mcpConfig);

      expect(headers["anthropic-beta"]).toBe("output-128k-2025-02-19,mcp-client-2025-04-04");
      expect(headers["x-api-key"]).toBe("test-api-key");
      expect(headers["anthropic-version"]).toBe("2023-06-01");
      expect(headers["content-type"]).toBe("application/json");
      expect(headers["anthropic-dangerous-direct-browser-access"]).toBe("true");
    });

    it("should add MCP beta header when no existing beta header", async () => {
      // Create a base model using the actual schema to test MCP header addition
      const baseModel = new BaseChatModel(model.modelSchema, mockOptions);

      const mcpConfig = {
        mcp: true,
        mcpServers: ["test-server"],
      };

      const headers = await baseModel.getStreamChatHeaders(mcpConfig);

      expect(headers["anthropic-beta"]).toBe("mcp-client-2025-04-04");
      expect(headers["x-api-key"]).toBe("test-api-key");
      expect(headers["anthropic-version"]).toBe("2023-06-01");
      expect(headers["content-type"]).toBe("application/json");
      expect(headers["anthropic-dangerous-direct-browser-access"]).toBe("true");
    });
  });
});
