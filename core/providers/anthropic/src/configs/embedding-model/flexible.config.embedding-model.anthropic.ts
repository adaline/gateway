import { z } from "zod";

import { encodingFormat, inputType, outputDimension, outputDtype, truncation } from "./common.config.embedding-model.anthropic";

/**
 * Config for the flexible-dimension Voyage models (voyage-3.5, voyage-3.5-lite,
 * voyage-3-large, voyage-code-3). Extends the base config with `outputDimension`
 * and `outputDtype`, which only these models support. Legacy fixed-dimension
 * models keep `EmbeddingModelBaseConfig*` (no output_dimension / output_dtype),
 * matching the Voyage API's per-model constraints.
 */
const EmbeddingModelFlexibleConfigSchema = () =>
  z.object({
    encodingFormat: encodingFormat.schema,
    inputType: inputType.schema,
    truncation: truncation.schema,
    outputDimension: outputDimension.schema,
    outputDtype: outputDtype.schema,
  });

const EmbeddingModelFlexibleConfigDef = () => ({
  encodingFormat: encodingFormat.def,
  inputType: inputType.def,
  truncation: truncation.def,
  outputDimension: outputDimension.def,
  outputDtype: outputDtype.def,
});

export { EmbeddingModelFlexibleConfigDef, EmbeddingModelFlexibleConfigSchema };
