#!/usr/bin/env python3
"""Build every runtime translation file from locale/<code>.json.

locale/sk.json is the master: it must contain every key. Other languages may
miss keys (they fall back to English, then Slovak) but may not invent keys,
and must keep the same {placeholders}. Run with --check in CI to verify the
generated files are current, --strict to also require complete languages.

Key prefixes decide where a string is shipped:
  language.*            language name, shipped everywhere
  common.*              shared labels, shipped everywhere
  panel.*               wall panel UI          -> frontend/i18n.js (embedded, offline)
  studio.*, backend.*   Aurelvi Studio in HA   -> frontend/locale/<code>.json (fetched)
  web.*                 public website         -> website/assets/i18n.js
  ha.*                  HA integration strings -> translations/<code>.json, strings.json
"""
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCALE = ROOT / "locale"
PARTS = LOCALE / "parts"
COMPONENT = ROOT / "custom_components" / "aurelvi"
FRONTEND = COMPONENT / "frontend"
RUNTIME = ROOT / "tools" / "i18n-runtime.js"
MASTER = "sk"
KEY = re.compile(r"[a-z][a-z0-9_]*(\.[a-z0-9_]+)+")
PLACEHOLDER = re.compile(r"\{([a-zA-Z0-9_]+)\}")
BEGIN, END = "/*@i18n-runtime-begin*/", "/*@i18n-runtime-end*/"


def read_locales():
    codes = sorted(p.stem for p in LOCALE.glob("*.json"))
    data = {}
    for code in codes:
        table = json.loads((LOCALE / f"{code}.json").read_text(encoding="utf-8"))
        for part in sorted(PARTS.glob(f"*.{code}.json")) if PARTS.is_dir() else []:
            extra = json.loads(part.read_text(encoding="utf-8"))
            clash = set(extra) & set(table)
            if clash:
                raise SystemExit(f"{part.name}: keys already defined: {sorted(clash)[:5]}")
            table.update(extra)
        data[code] = table
    return data


def validate(data, strict):
    errors, missing = [], {}
    master = data.get(MASTER)
    if master is None:
        raise SystemExit("locale/sk.json is required")
    for code, table in data.items():
        for key, value in table.items():
            if not KEY.fullmatch(key):
                errors.append(f"{code}: invalid key {key!r}")
            if not isinstance(value, str) or not value.strip():
                errors.append(f"{code}: empty value for {key}")
                continue
            if code != MASTER:
                if key not in master:
                    errors.append(f"{code}: key not in sk.json: {key}")
                elif set(PLACEHOLDER.findall(value)) != set(PLACEHOLDER.findall(master[key])):
                    errors.append(f"{code}: placeholders differ for {key}")
        if code != MASTER:
            gone = [k for k in master if k not in table]
            if gone:
                missing[code] = gone
    if strict:
        errors += [f"{code}: {len(keys)} missing keys, e.g. {keys[0]}" for code, keys in missing.items()]
    return errors, missing


def pick(data, prefixes):
    return {code: {k: v for k, v in table.items() if k.startswith(prefixes)} for code, table in data.items()}


def runtime(data, prefixes, mount=True):
    names = {code: table.get("language.name", code) for code, table in data.items()}
    payload = {"names": names, "strings": pick(data, prefixes) if prefixes else {}}
    if not mount:
        payload["mount"] = False
    blob = json.dumps(payload, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    return RUNTIME.read_text(encoding="utf-8").replace("/*@DATA@*/{}", blob)


def unflatten(table, prefix):
    out = {}
    for key, value in sorted(table.items()):
        if not key.startswith(prefix):
            continue
        node, parts = out, key[len(prefix):].split(".")
        for part in parts[:-1]:
            node = node.setdefault(part, {})
        node[parts[-1]] = value
    return out


def dump(obj):
    return json.dumps(obj, ensure_ascii=False, indent=2, sort_keys=True) + "\n"


def outputs(data):
    files = {}
    shared = ("language.", "common.")
    files[FRONTEND / "i18n.js"] = runtime(data, shared + ("panel.",))
    files[ROOT / "website" / "assets" / "i18n.js"] = runtime(data, shared + ("web.",))
    for code, table in pick(data, shared + ("studio.", "backend.")).items():
        files[FRONTEND / "locale" / f"{code}.json"] = dump(table)
    studio = FRONTEND / "studio.js"
    source = studio.read_text(encoding="utf-8")
    if BEGIN in source and END in source:
        head, rest = source.split(BEGIN, 1)
        tail = rest.split(END, 1)[1]
        files[studio] = head + BEGIN + "\n" + runtime(data, None, mount=False) + END + tail
    if any(k.startswith("ha.") for k in data[MASTER]):
        for code, table in data.items():
            tree = unflatten(table, "ha.")
            if tree:
                files[COMPONENT / "translations" / f"{code}.json"] = dump(tree)
        files[COMPONENT / "strings.json"] = dump(unflatten(data.get("en", data[MASTER]), "ha."))
    return files


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--check", action="store_true", help="fail if generated files are out of date")
    parser.add_argument("--strict", action="store_true", help="fail if any language misses keys")
    parser.add_argument("--fold-parts", action="store_true", help="merge locale/parts/* into locale/<code>.json")
    args = parser.parse_args()
    data = read_locales()
    errors, missing = validate(data, args.strict)
    if errors:
        print("\n".join(errors[:50]), file=sys.stderr)
        return 1
    if args.fold_parts:
        for code, table in data.items():
            (LOCALE / f"{code}.json").write_text(dump(table), encoding="utf-8")
        for part in PARTS.glob("*.json"):
            part.unlink()
        print("parts folded into locale/<code>.json")
    stale = []
    for path, content in outputs(data).items():
        current = path.read_text(encoding="utf-8") if path.exists() else None
        if current != content:
            stale.append(path.relative_to(ROOT))
            if not args.check:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(content, encoding="utf-8")
    total = len(data[MASTER])
    print("coverage:", " ".join(f"{c}={total - len(missing.get(c, []))}" for c in sorted(data) if c != MASTER))
    if args.check and stale:
        print("Out of date, run python3 tools/build_locales.py:", *stale, sep="\n  ", file=sys.stderr)
        return 1
    print(f"{MASTER}: {total} keys; {'checked' if args.check else 'wrote'} {len(stale)} changed file(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
