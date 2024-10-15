import { z } from "zod";

import { encodingFormat } from "./common.config.embedding-model.openai";

const EmbeddingModelBaseConfigSchema = () =>
  z.object({
    encodingFormat: encodingFormat.schema,
  });

const EmbeddingModelBaseConfigDef = () =>
  ({
    encodingFormat: encodingFormat.def,
  }) as const;

export { EmbeddingModelBaseConfigDef, EmbeddingModelBaseConfigSchema };
