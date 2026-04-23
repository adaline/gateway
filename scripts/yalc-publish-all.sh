#!/usr/bin/env bash
# Publishes every publishable @adaline/* package in the workspace to yalc's
# local store and pushes updates to any consumer that has already added them.
#
# Usage from gateway root:
#   pnpm run build
#   bash scripts/yalc-publish-all.sh
#
# First-time setup in a consumer (e.g. pegasus):
#   cd ~/ws/adaline/adx-global/pegasus
#   yalc add @adaline/types @adaline/provider @adaline/gateway @adaline/openai
#   pnpm install
#
# Iterate loop after gateway changes:
#   (in gateway)   pnpm run build && bash scripts/yalc-publish-all.sh
#   (in pegasus)   files are already updated via yalc push; no extra command
#
# Cleanup in consumer when done:
#   yalc remove --all && pnpm install
#
# Notes:
#   - Packages marked `"private": true` are skipped (respects workspace intent).
#   - Packages without a dist/ are skipped with a warning — run `pnpm run build` first.
#   - The .yalc/ directory and yalc.lock file in consumers should be gitignored
#     and NOT committed.

set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v yalc >/dev/null 2>&1; then
  echo "error: yalc not found. Install with: npm install -g yalc" >&2
  exit 1
fi

published=0
skipped_private=0
skipped_no_dist=0

while IFS= read -r -d '' pkg; do
  dir="$(dirname "$pkg")"
  name=$(node -p "try { require('./$pkg').name || '' } catch { '' }" 2>/dev/null)
  private=$(node -p "try { !!require('./$pkg').private } catch { false }" 2>/dev/null)

  if [[ -z "$name" ]]; then
    printf "  warn (unreadable)   %s\n" "$pkg" >&2
    continue
  fi

  if [[ "$name" != @adaline/* ]]; then
    continue
  fi

  if [[ "$private" == "true" ]]; then
    skipped_private=$((skipped_private + 1))
    printf "  skip (private)      %s\n" "$name"
    continue
  fi

  if [[ ! -d "$dir/dist" ]]; then
    skipped_no_dist=$((skipped_no_dist + 1))
    printf "  skip (no dist/)     %s  — run 'pnpm run build' first\n" "$name"
    continue
  fi

  printf "  publishing          %s\n" "$name"
  # --no-scripts skips prepublishOnly (which would trigger a redundant tsup rebuild).
  # We trust that `pnpm run build` has already produced an up-to-date dist/.
  (cd "$dir" && yalc publish --push --no-scripts)
  published=$((published + 1))
done < <(
  find core packages -maxdepth 4 -name package.json \
    -not -path "*/node_modules/*" \
    -not -path "*/dist/*" \
    -print0 2>/dev/null
)

echo
echo "Summary:"
echo "  published:     $published"
[[ $skipped_private -gt 0 ]] && echo "  private:       $skipped_private"
[[ $skipped_no_dist -gt 0 ]] && echo "  missing dist/: $skipped_no_dist"

if [[ $published -eq 0 ]]; then
  echo
  echo "No packages published. Did you run 'pnpm run build'?"
  exit 1
fi
