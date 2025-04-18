import { z } from "zod";

/**
 * A pair of per‑million‑token rates for a single price category.
 */
const PricePair = z
  .object({
    input: z.number().nonnegative().describe("Price per 1M input tokens").optional(),
    output: z.number().nonnegative().describe("Price per 1M output tokens").optional(),
  })
  .describe("Two rates (input/output) in Price per 1,000,000 tokens.");

type PricePairType = z.infer<typeof PricePair>;

/**
 * All three price categories.
 */
const TypePrices = z
  .object({
    base: PricePair.describe("Base (uncached, non‑reasoning) rates").optional(),
    cached: PricePair.describe("Cached data rates").optional(),
    reasoning: PricePair.describe("“Reasoning” (e.g. chain‑of‑thought) rates").optional(),
  })
  .describe("All price categories for this tier.");

type TierPricesType = z.infer<typeof TypePrices>;

/**
 * One tier in the pricing schedule.
 * - `minTokens`: inclusive lower bound (integer ≥ 0).
 * - `maxTokens`: exclusive upper bound (integer > minTokens), or `null` for ∞.
 * - `prices`: the three categories of (input/output) rates.
 */
const PricingTier = z
  .object({
    minTokens: z.number().int().nonnegative().describe("Inclusive lower bound for this tier."),
    maxTokens: z.number().int().nullable().optional().describe("Exclusive upper bound; `null` means ∞."),
    prices: TypePrices,
  })
  .refine((t) => t.maxTokens === null || (typeof t.maxTokens === "number" && t.maxTokens > t.minTokens), {
    message: "maxTokens must be > minTokens (or null for infinite).",
    path: ["maxTokens"],
  });

type PricingTierType = z.infer<typeof PricingTier>;

/**
 * Full model pricing with tiered schedule.
 * - First tier must start at 0.
 * - Tiers must be contiguous: each tier.minTokens === previous.maxTokens.
 * - Last tier must have maxTokens = null.
 */
const ModelPricing = z
  .object({
    model: z.string().optional().describe("Optional model ID."),
    currency: z.string().default("USD").describe("Currency code."),
    tiers: z.array(PricingTier).min(1).describe("Tiered schedule, sorted by minTokens."),
  })
  .superRefine((data, ctx) => {
    const { tiers } = data;

    // 1) First tier starts at 0
    if (tiers[0].minTokens !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tiers", 0, "minTokens"],
        message: "The first tier must have minTokens = 0.",
      });
    }

    // 2) Contiguity and no tiers after ∞
    for (let i = 1; i < tiers.length; i++) {
      const prev = tiers[i - 1];
      const curr = tiers[i];

      if (prev.maxTokens === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tiers", i - 1, "maxTokens"],
          message: "Cannot define any tiers after an infinite tier.",
        });
        break;
      }

      if (curr.minTokens !== prev.maxTokens) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tiers", i, "minTokens"],
          message: `Tier ${i} must start at previous maxTokens (${prev.maxTokens}).`,
        });
      }
    }

    // 3) Last tier must be infinite
    const last = tiers[tiers.length - 1];
    if (last.maxTokens !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tiers", tiers.length - 1, "maxTokens"],
        message: "The final tier must have maxTokens = null (∞).",
      });
    }
  });

type ModelPricingType = z.infer<typeof ModelPricing>;

/**
 * Full pricing for all supported models.
 */
const AllModelPricing = z.object({
  prices: z.array(ModelPricing).min(1).describe("List of model-specific pricing structures."),
});

export { AllModelPricing, ModelPricing, PricePair, PricingTier, TypePrices };
export type { ModelPricingType, PricePairType, PricingTierType, TierPricesType };
