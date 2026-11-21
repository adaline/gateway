#!/usr/bin/env python3
"""Regenerate OpenRouter / Together pricing JSON in the Adaline Gateway repo shape.

Repo shape (ChatModelPrice, packages/types/src/pricing/pricing-tiers.ts):
  { "<id>": { "modelName": "<id>", "currency": "USD",
              "tokenRanges": [ { "minTokens": 0, "maxTokens": null|int,
                                 "prices": { "base": { "inputPricePerMillion": n, "outputPricePerMillion": n } } }, ... ] } }
Embedding shape (EmbeddingModelPrice): { "<id>": { "modelName", "currency", "inputPricePerMillion" } }

Usage (writes to --out-dir, default /tmp/parity-or-together/out; point at repo only deliberately):
  python3 -I gen.py --openrouter /tmp/parity-or-together/openrouter-models.json \
                    --together-md /tmp/parity-or-together/together-serverless-models.md \
                    [--old-openrouter path] [--old-together path] [--keep-stale] [--out-dir DIR]
"""
import argparse
import json
import os
import re
import sys
from decimal import Decimal, InvalidOperation

MILLION = Decimal(1_000_000)


def num(d: Decimal):
    """Decimal -> JSON number: int if integral, else shortest float repr."""
    d = d.normalize()
    if d == d.to_integral_value():
        return int(d)
    return float(format(d, "f"))


def per_million(per_token: str):
    """OpenRouter per-token string -> per-1M number. Returns None for variable/invalid (<0, e.g. "-1")."""
    try:
        v = Decimal(str(per_token))
    except (InvalidOperation, TypeError):
        return None
    if v < 0:
        return None
    return num(v * MILLION)


def entry(model, tiers):
    """tiers: list of (minTokens, input, output), any order."""
    tiers = sorted(tiers, key=lambda t: t[0])
    ranges = []
    for i, (lo, inp, out) in enumerate(tiers):
        hi = tiers[i + 1][0] if i + 1 < len(tiers) else None
        ranges.append(
            {
                "minTokens": lo,
                "maxTokens": hi,
                "prices": {"base": {"inputPricePerMillion": inp, "outputPricePerMillion": out}},
            }
        )
    return {"modelName": model, "currency": "USD", "tokenRanges": ranges}


def gen_openrouter(path, report):
    data = json.load(open(path))["data"]
    out, skipped_variable, skipped_bad, time_overrides = {}, [], [], []
    for m in data:
        mid, p = m["id"], m.get("pricing") or {}
        inp, outp = per_million(p.get("prompt")), per_million(p.get("completion"))
        if inp is None or outp is None:
            (skipped_variable if str(p.get("prompt")) == "-1" or str(p.get("completion")) == "-1" else skipped_bad).append(mid)
            continue
        tiers = {0: (0, inp, outp)}
        for o in p.get("overrides") or []:
            if any(k.startswith("utc_") for k in o):  # time-of-day discounts: not representable, use base
                time_overrides.append(mid)
                continue
            lo = o.get("min_prompt_tokens")
            if not isinstance(lo, int) or lo <= 0:
                continue
            oi = per_million(o["prompt"]) if "prompt" in o else inp
            oo = per_million(o["completion"]) if "completion" in o else outp
            if oi is None or oo is None:
                continue
            tiers[lo] = (lo, oi, oo)
        out[mid] = entry(mid, list(tiers.values()))
    report["openrouter"] = {
        "source_models": len(data),
        "written": len(out),
        "skipped_variable_-1": sorted(skipped_variable),
        "skipped_unparseable": sorted(skipped_bad),
        "tiered": sorted(k for k, v in out.items() if len(v["tokenRanges"]) > 1),
        "ignored_time_based_overrides": sorted(set(time_overrides)),
    }
    return out


PRICE_RE = re.compile(r"^\\?\$?\s*([0-9]*\.?[0-9]+)$")


def parse_together_price(cell):
    c = cell.strip().replace("\\$", "$")
    if c.lower() == "free":
        return 0
    if c in ("-", ""):
        return None
    mm = PRICE_RE.match(c.replace("$", ""))
    return num(Decimal(mm.group(1))) if mm else None


def md_table(md, heading):
    """Return list of row dicts for the first table under '## <heading>'."""
    sec = md.split(f"## {heading}", 1)
    if len(sec) < 2:
        return []
    lines = sec[1].split("\n## ", 1)[0].splitlines()
    rows = [l for l in lines if l.startswith("|")]
    if len(rows) < 3:
        return []
    hdr = [h.strip() for h in rows[0].strip("|").split("|")]
    return [dict(zip(hdr, [c.strip() for c in r.strip("|").split("|")])) for r in rows[2:]]


def gen_together(md_path, report):
    md = open(md_path, encoding="utf-8").read()
    out, skipped = {}, []
    for r in md_table(md, "Chat models"):
        mid = r.get("API model string") or r.get("Model string for API")
        inp = parse_together_price(r.get("Input pricing (per 1M tokens)", ""))
        outp = parse_together_price(r.get("Output pricing (per 1M tokens)", ""))
        if not mid or inp is None or outp is None:
            skipped.append(mid or str(r))
            continue
        out[mid] = entry(mid, [(0, inp, outp)])
    emb = {}
    for r in md_table(md, "Embedding models"):
        mid = r.get("API model string") or r.get("Model string for API")
        price = parse_together_price(r.get("Price per 1M tokens", r.get("Price", "")))
        if mid and price is not None:
            emb[mid] = {"modelName": mid, "currency": "USD", "inputPricePerMillion": price}
    report["together"] = {"chat_written": len(out), "chat_skipped": skipped, "embedding_written": len(emb)}
    return out, emb


def diff(name, old_path, new, keep_stale, report):
    if not old_path:
        return new
    old = json.load(open(old_path))
    dropped = sorted(set(old) - set(new))
    added = sorted(set(new) - set(old))
    kept = sorted(set(old) & set(new))
    report[name + "_diff"] = {"old": len(old), "new": len(new), "dropped": len(dropped), "added": len(added),
                              "in_both": len(kept), "dropped_ids": dropped, "in_both_ids": kept}
    if keep_stale:
        merged = {k: old[k] for k in dropped}
        merged.update(new)
        return merged
    return new


def write(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(obj, f, indent=2, ensure_ascii=False)
        f.write("\n")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--openrouter")
    ap.add_argument("--together-md")
    ap.add_argument("--old-openrouter")
    ap.add_argument("--old-together")
    ap.add_argument("--old-together-embedding")
    ap.add_argument("--keep-stale", action="store_true", help="retain old entries absent from the source")
    ap.add_argument("--out-dir", default="/tmp/parity-or-together/out")
    a = ap.parse_args()
    report = {}
    if a.openrouter:
        orr = diff("openrouter", a.old_openrouter, gen_openrouter(a.openrouter, report), a.keep_stale, report)
        write(os.path.join(a.out_dir, "open-router/pricing.json"), orr)
    if a.together_md:
        chat, emb = gen_together(a.together_md, report)
        chat = diff("together", a.old_together, chat, a.keep_stale, report)
        write(os.path.join(a.out_dir, "together-ai/pricing.json"), chat)
        if emb:
            write(os.path.join(a.out_dir, "together-ai/embedding-pricing.json"), emb)
        else:
            # Serverless docs list no embedding models: do NOT emit an empty file (would break every
            # embedding cost lookup and `keyof typeof` narrows to never). Keep the existing file.
            print("together: no serverless embedding models in source; leave embedding-pricing.json untouched", file=sys.stderr)
    write(os.path.join(a.out_dir, "report.json"), report)
    summary = {k: {kk: vv for kk, vv in v.items() if not isinstance(vv, list) or len(vv) <= 12} for k, v in report.items()}
    print(json.dumps(summary, indent=1))


if __name__ == "__main__":
    main()
