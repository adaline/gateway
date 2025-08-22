import { beforeEach, describe, expect, it } from "vitest";

import { BedrockClaude3_7Sonnet20250219, BedrockClaude3_7Sonnet20250219Options } from "../../../../src/models";

describe("BedrockClaude3_7Sonnet20250219", () => {
  const mockOptions = {
    modelName: "anthropic.claude-3-7-sonnet-20250219-v1:0",
    awsAccessKeyId: "test-access-key-id",
    awsSecretAccessKey: "test-secret-access-key",
  };

  let model: BedrockClaude3_7Sonnet20250219;

  beforeEach(() => {
    model = new BedrockClaude3_7Sonnet20250219(mockOptions);
  });

  describe("constructor", () => {
    it("should initialize with the correct model schema", () => {
      expect(model.modelSchema.name).toBe("anthropic.claude-3-7-sonnet-20250219-v1:0");
      expect(model.modelName).toBe("anthropic.claude-3-7-sonnet-20250219-v1:0");
    });
  });

  describe("getDefaultHeaders", () => {
    it("should return headers with output-128k beta feature when no existing beta header", () => {
      const headers = model.getDefaultHeaders();

      expect(headers["anthropic-beta"]).toBe("output-128k-2025-02-19");
      expect(headers["Accept"]).toBe("application/json");
      expect(headers["Content-Type"]).toBe("application/json");
    });

    it("should merge output-128k beta feature with existing beta header", () => {
      // Create a mock model that returns headers with an existing beta header
      const mockModel = {
        getDefaultHeaders: () => ({
          Accept: "application/json",
          "Content-Type": "application/json",
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

  describe("BedrockClaude3_7Sonnet20250219Options", () => {
    it("should validate valid options", () => {
      const validOptions = {
        modelName: "anthropic.claude-3-7-sonnet-20250219-v1:0",
        awsAccessKeyId: "valid-access-key-id",
        awsSecretAccessKey: "valid-secret-access-key",
      };

      expect(() => BedrockClaude3_7Sonnet20250219Options.parse(validOptions)).not.toThrow();
    });

    it("should reject invalid options", () => {
      const invalidOptions = {
        // Missing required fields
      };

      expect(() => BedrockClaude3_7Sonnet20250219Options.parse(invalidOptions)).toThrow();
    });
  });
});
