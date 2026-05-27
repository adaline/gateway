import { z } from "zod";

/**
 * Flat, input-token-based pricing for a single embedding model.
 *
 * Unlike `ChatModelPrice` (which has input/output rates and token-range tiers),
 * embedding models are billed only on input tokens at a single flat rate, so a
 * tier schedule is unnecessary.
 */
const EmbeddingModelPrice = z
  .object({
    modelName: z.string().min(1).describe("Model name this price applies to."),
    currency: z.string().default("USD").describe("Currency code (e.g., USD)."),
    inputPricePerMillion: z.number().nonnegative().describe("Price per 1M input tokens."),
  })
  .describe("Complete (flat) pricing for a single embedding model.");

type EmbeddingModelPriceType = z.infer<typeof EmbeddingModelPrice>;

export { EmbeddingModelPrice };
export type { EmbeddingModelPriceType };
