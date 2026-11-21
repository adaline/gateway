---
"@adaline/openai": minor
"@adaline/azure": minor
---

OpenAI + Azure parity sync: remove retired models, add the GPT-6 family, and correct pricing/spec drift (verified against developers.openai.com and the Azure model-retirement schedule, 2026-11-20).

BREAKING (for consumers pinning these literals or importing their classes):

- OpenAI: `gpt-3.5-turbo`(+0125), `gpt-4`, `gpt-4-0613`, `gpt-4-1106-preview`, `gpt-4-turbo`(+2024-04-09), `o1`(+2024-12-17), `o3-mini`(+2025-01-31), `o4-mini`(+2025-04-16) shut down 2026-10-23; `gpt-3.5-turbo-1106` shut down 2026-09-28; `gpt-5.2-chat-latest` shut down 2026-08-10. All are fully deleted. `gpt-4.1-nano` and `gpt-4o-2024-05-13` are no longer registered with the openai provider (shut down 2026-10-23), but their schemas stay exported for `@adaline/azure`, where they remain GA until 2027-04-14 and 2027-01-14.
- Azure: `o1`(+2024-12-17), `o3`(+2025-04-16), `o3-mini`(+2025-01-31), `o3-pro`, `o4-mini`(+2025-04-16) were retired 2026-11-19, and `gpt-4-turbo-2024-04-09` was retired 2025-11-11. Their wrappers are deleted. (`o3`, `o3-2025-04-16` and `o3-pro` stay on the OpenAI side until 2026-12-11.)

Added:

- OpenAI: `gpt-6.2-astra`, `gpt-6.2-sol`, `gpt-6.1-sol`, `gpt-6.1-terra`, `gpt-6-astra`, `gpt-6-sol`, `gpt-6-luna`. All have 922K input, 128K output and two pricing tiers split at 272K. They are routed to the Responses API, and they support `reasoningMode` and the `max` effort level.
- Azure: wrappers for `gpt-6-astra`, `gpt-6-sol`, `gpt-6-luna`, `gpt-6.1-sol`, `gpt-6.1-terra`.

Fixed (OpenAI):

- Pricing: `gpt-5.6-terra` $2/$12 (>272K $4/$18); `gpt-5.6-luna` $0.20/$1.20 (>272K $0.40/$1.80); `gpt-5.1` $1.25/$10; `gpt-5.3-codex` $1.75/$14; `gpt-5-search-api` $1.25/$10; `gpt-4o` $2.50/$10; `gpt-4o-mini`(+2024-07-18) $0.15/$0.60; `o3`(+2025-04-16) $2/$8. Added >272K tiers to `gpt-5.4` ($5/$22.50), `gpt-5.4-pro` and `gpt-5.5-pro` ($60/$270).
- Reasoning effort: the gpt-5.6 enum drops `minimal`; `gpt-5.5` now defaults to `medium`; `gpt-5.5-pro` now defaults to `high`; `gpt-5-pro` accepts `high` only.
- Token limits: `gpt-5`/`-mini`/`-nano` 272K input and 128K output; `gpt-5-pro` 272K output; `gpt-5.3-codex` 272K input and 128K output, and it is now routed to the Responses API; `gpt-5.4-mini`/`-nano` 272K input; `gpt-5.2`/`-pro` 128K output; the gpt-4o family 16,384 output.
- Descriptions: corrected snapshot pointers for `gpt-4o`/`gpt-4o-mini` and knowledge cutoffs. Added deprecation annotations for the 2026-12-11, 2027-01-14 and 2027-04-01 shutdown waves.
- `o3` and `o3-2025-04-16` schemas now carry their `price`.
