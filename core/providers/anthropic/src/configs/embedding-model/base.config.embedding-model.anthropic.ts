import { z } from "zod";

import { encodingFormat, inputType, truncation } from "./common.config.embedding-model.anthropic";

const EmbeddingModelBaseConfigSchema = () =>
  z.object({
    encodingFormat: encodingFormat.schema,
    inputType: inputType.schema,
    truncation: truncation.schema,
  });

const EmbeddingModelBaseConfigDef = () => ({
  encodingFormat: encodingFormat.def,
  inputType: inputType.def,
  truncation: truncation.def,
});

export { EmbeddingModelBaseConfigDef, EmbeddingModelBaseConfigSchema };
