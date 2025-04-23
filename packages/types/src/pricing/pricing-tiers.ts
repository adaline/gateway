import { z } from "zod";

/**
 * A pair of per‑million‑token rates for a single price category (e.g., base input/output).
 * Represents the input and output cost for 1 million tokens within a specific category (like 'base') of a pricing tier.
 */
const ChatModelTokenPairPrice = z
  .object({
    inputPricePerMillion: z.number().nonnegative().describe("Price per 1M input tokens"),
    outputPricePerMillion: z.number().nonnegative().describe("Price per 1M output tokens"),
  })
  .describe("Input/output price pair (per 1M tokens) for a specific category within a ChatModel pricing tier.");

type ChatModelTokenPairPriceType = z.infer<typeof ChatModelTokenPairPrice>;

/**
 * Defines the price categories (e.g., base) applicable within a single pricing tier (`ChatModelTokenRangePrice`).
 * Each category holds a `ChatModelTokenPairPrice`.
 */
const ChatModelTokenTypePrice = z
  .object({
    base: ChatModelTokenPairPrice.describe("Base (uncached, non‑reasoning) rates"),
    // Add optional 'cached' and 'reasoning' here if they become standard
  })
  .describe("Holds the `ChatModelTokenPairPrice` for different categories (e.g., base) within a single pricing tier.");

type ChatModelTokenTypePriceType = z.infer<typeof ChatModelTokenTypePrice>;

/**
 * Defines a single tier in a model's pricing schedule (`ChatModelPrice`), based on token count range.
 * - `minTokens`: inclusive lower bound (integer ≥ 0).
 * - `maxTokens`: exclusive upper bound (integer > minTokens), or `null` for ∞.
 * - `prices`: the `ChatModelTokenTypePrice` (categories and their rates) applicable to this tier.
 */
const ChatModelTokenRangePrice = z
  .object({
    minTokens: z.number().int().nonnegative().describe("Inclusive lower token bound for this tier."),
    maxTokens: z.number().int().nullable().optional().describe("Exclusive upper token bound; `null` means ∞."),
    prices: ChatModelTokenTypePrice.describe("Price categories and rates for this specific token range."),
  })
  .refine((t) => t.maxTokens === null || (typeof t.maxTokens === "number" && t.maxTokens > t.minTokens), {
    message: "maxTokens must be > minTokens (or null for infinite).",
    path: ["maxTokens"],
  })
  .describe("A single pricing tier defined by a token range and associated prices.");

type ChatModelTokenRangePriceType = z.infer<typeof ChatModelTokenRangePrice>;

/**
 * Full pricing schedule for a specific chat model, potentially with multiple `ChatModelTokenRangePrice` tiers.
 * Ensures tiers are contiguous and cover the full range from 0 to infinity.
 * - First tier must start at 0 tokens.
 * - `tokenRanges` must be contiguous: each tier.minTokens === previous.maxTokens.
 * - Last `tokenRange` must have maxTokens = null (infinite).
 */
const ChatModelPrice = z
  .object({
    modelName: z.string().describe("Model name this schedule applies to."),
    currency: z.string().default("USD").describe("Currency code (e.g., USD)."),
    tokenRanges: z
      .array(ChatModelTokenRangePrice)
      .min(1)
      .describe("Pricing tiers (`ChatModelTokenRangePrice`) schedule, sorted by minTokens."),
  })
  .superRefine((data, ctx) => {
    const { tokenRanges } = data;

    // 1) First tier starts at 0
    if (tokenRanges[0].minTokens !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tokenRanges", 0, "minTokens"],
        message: "The first tier must have minTokens = 0.",
      });
    }

    // 2) tokenRanges must be sorted and contiguous
    for (let i = 1; i < tokenRanges.length; i++) {
      const prev = tokenRanges[i - 1];
      const curr = tokenRanges[i];

      if (prev.maxTokens === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tokenRanges", i - 1, "maxTokens"],
          message: "Cannot define any tokenRanges after an infinite tier (maxTokens = null).",
        });
        break; // Stop further checks if structure is already invalid
      }

      if (curr.minTokens !== prev.maxTokens) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tokenRanges", i, "minTokens"],
          message: `Tier ${i} minTokens (${curr.minTokens}) must equal previous tier's maxTokens (${prev.maxTokens}) for contiguity.`,
        });
      }

      // Ensure sorting (although contiguity check often implies this)
      if (curr.minTokens < prev.minTokens) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["tokenRanges", i, "minTokens"],
          message: `tokenRanges must be sorted by ascending minTokens. Tier ${i} (${curr.minTokens}) starts before Tier ${i - 1} (${prev.minTokens}).`,
        });
      }
    }

    // 3) Last tier must be infinite
    const last = tokenRanges[tokenRanges.length - 1];
    // Check last.maxTokens only if the loop didn't break early due to a previous infinite tier
    if (tokenRanges.every((t) => t.maxTokens !== null || t === last) && last.maxTokens !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tokenRanges", tokenRanges.length - 1, "maxTokens"],
        message: "The final tier must have maxTokens = null (representing infinity).",
      });
    }
  })
  .describe("Complete pricing schedule for a single chat model, including all its token-based tiers.");

type ChatModelPriceType = z.infer<typeof ChatModelPrice>;

// Export the schemas and types
export { ChatModelPrice, ChatModelTokenPairPrice, ChatModelTokenRangePrice, ChatModelTokenTypePrice };
export type { ChatModelPriceType, ChatModelTokenPairPriceType, ChatModelTokenRangePriceType, ChatModelTokenTypePriceType };
