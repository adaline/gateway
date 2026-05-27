import { describe, expect, it } from "vitest";

import { InvalidConfigError } from "@adaline/provider";

import { Voyage3, Voyage3_5, VoyageCode2 } from "../../../src/models/embedding-models";

const opts = (modelName: string) => ({ modelName, apiKey: "test-key" });

describe("Voyage embedding models — pricing", () => {
  it("getModelPricing returns the configured flat price for a flexible model", () => {
    const model = new Voyage3_5(opts("voyage-3.5"));
    expect(model.getModelPricing()).toEqual({
      modelName: "voyage-3.5",
      currency: "USD",
      inputPricePerMillion: 0.06,
    });
  });

  it("getModelPricing returns the configured price for a legacy model", () => {
    const model = new VoyageCode2(opts("voyage-code-2"));
    expect(model.getModelPricing()).toEqual({
      modelName: "voyage-code-2",
      currency: "USD",
      inputPricePerMillion: 0.12,
    });
  });

  it("exposes price on the model schema", () => {
    const model = new Voyage3(opts("voyage-3"));
    expect(model.modelSchema.price).toMatchObject({ modelName: "voyage-3", inputPricePerMillion: 0.06 });
  });

  it("getModelPricing throws for an unknown model name", () => {
    const model = new Voyage3_5(opts("voyage-does-not-exist"));
    expect(() => model.getModelPricing()).toThrow();
  });
});

describe("Voyage embedding models — flexible config (output_dimension / output_dtype)", () => {
  it("coerces output_dimension to a number and forwards output_dtype", () => {
    const model = new Voyage3_5(opts("voyage-3.5"));
    const params = model.transformConfig({ outputDimension: "1024", outputDtype: "int8" });
    expect(params.output_dimension).toBe(1024);
    expect(typeof params.output_dimension).toBe("number");
    expect(params.output_dtype).toBe("int8");
  });

  it("omits output_dimension / output_dtype when left empty (model default)", () => {
    const model = new Voyage3_5(opts("voyage-3.5"));
    const params = model.transformConfig({ outputDimension: "", outputDtype: "" });
    expect("output_dimension" in params).toBe(false);
    expect("output_dtype" in params).toBe(false);
  });

  it("supports every documented output_dimension value", () => {
    const model = new Voyage3_5(opts("voyage-3.5"));
    for (const dim of ["256", "512", "1024", "2048"] as const) {
      const params = model.transformConfig({ outputDimension: dim });
      expect(params.output_dimension).toBe(Number(dim));
    }
  });

  it("supports every documented output_dtype value", () => {
    const model = new Voyage3_5(opts("voyage-3.5"));
    for (const dtype of ["float", "int8", "uint8", "binary", "ubinary"] as const) {
      const params = model.transformConfig({ outputDtype: dtype });
      expect(params.output_dtype).toBe(dtype);
    }
  });

  it("rejects an output_dimension value the API does not accept", () => {
    const model = new Voyage3_5(opts("voyage-3.5"));
    expect(() => model.transformConfig({ outputDimension: "768" })).toThrow(InvalidConfigError);
  });
});

describe("Voyage embedding models — backwards compatibility", () => {
  it("base (legacy) config still forwards input_type / encoding_format unchanged", () => {
    const model = new Voyage3(opts("voyage-3"));
    const params = model.transformConfig({ inputType: "query", encodingFormat: "base64" });
    expect(params.input_type).toBe("query");
    expect(params.encoding_format).toBe("base64");
  });

  it("legacy models do not expose output_dimension (key not in def → silently ignored)", () => {
    const model = new Voyage3(opts("voyage-3"));
    const params = model.transformConfig({ inputType: "document", outputDimension: "256" });
    expect(params.input_type).toBe("document");
    expect("output_dimension" in params).toBe(false);
  });

  it("empty input_type / encoding_format are omitted (unchanged sentinel behavior)", () => {
    const model = new Voyage3(opts("voyage-3"));
    const params = model.transformConfig({ inputType: "", encodingFormat: "" });
    expect("input_type" in params).toBe(false);
    expect("encoding_format" in params).toBe(false);
  });
});

describe("Voyage embedding models — transformModelRequest round-trip", () => {
  it("maps a raw Voyage request back into config (output_dimension → string)", () => {
    const model = new Voyage3_5(opts("voyage-3.5"));
    const { modelName, config, embeddingRequests } = model.transformModelRequest({
      model: "voyage-3.5",
      input: "hello world",
      input_type: "query",
      output_dimension: 1024,
      output_dtype: "int8",
    });
    expect(modelName).toBe("voyage-3.5");
    expect(config.outputDimension).toBe("1024");
    expect(config.outputDtype).toBe("int8");
    expect(config.inputType).toBe("query");
    expect(embeddingRequests.requests).toEqual(["hello world"]);
  });

  it("omits output_dimension from config when absent in the raw request", () => {
    const model = new Voyage3_5(opts("voyage-3.5"));
    const { config } = model.transformModelRequest({ model: "voyage-3.5", input: ["a", "b"] });
    expect("outputDimension" in config).toBe(false);
  });
});
