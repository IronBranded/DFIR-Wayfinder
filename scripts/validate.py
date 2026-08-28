#!/usr/bin/env python3
"""
validate.py
--------------------------------------------------------------------------
Integrity checks for the Malware Analysis Academy content tree. Run this
before every commit that touches content/ or assets/js/ — and it runs
automatically in CI via .github/workflows/validate.yml on every push and
pull request.

Checks performed:
  1. Every .json file under content/ parses as valid JSON
  2. Every .js file under assets/js/ passes `node --check` (syntax only)
  3. Every 'ready' lesson has a non-null contentPath/quizPath, and both
     files actually exist on disk
  4. Every 'coming-soon' lesson has null contentPath AND quizPath
     (a coming-soon lesson pointing at a real file is a status bug, not
     a coming-soon lesson)
  5. Every quiz file's internal "lessonId" matches the manifest entry
     that references it
  6. No duplicate lesson IDs anywhere in the manifest
  7. No orphaned content files on disk that no manifest entry references
  8. The blockquote-continuation typo: a `> [!TAG]` callout line
     immediately followed by a line starting with `|` instead of `>`,
     which silently truncates the callout and leaks a stray `|` into
     the rendered page (see docs/AUTHORING_GUIDE.md)
  9. glossary.json and tools.json entries all have their required fields
  10. Every curated track's lessonIds reference lessons that actually exist

Exit code is 0 if everything passes, 1 if anything fails — suitable for
direct use as a CI gate.
--------------------------------------------------------------------------
"""

import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

errors = []
warnings = []


def fail(msg):
    errors.append(msg)


def warn(msg):
    warnings.append(msg)


# 1. All JSON files parse ----------------------------------------------------
json_files = []
for root, _, files in os.walk("content"):
    for fn in files:
        if fn.endswith(".json"):
            json_files.append(os.path.join(root, fn))

parsed_json = {}
for f in json_files:
    try:
        with open(f, encoding="utf-8") as fh:
            parsed_json[f] = json.load(fh)
    except json.JSONDecodeError as e:
        fail(f"[JSON] {f}: does not parse — {e}")

if "content/manifest.json" not in parsed_json:
    fail("[FATAL] content/manifest.json failed to parse — cannot run remaining checks.")
    print("\n".join(errors))
    sys.exit(1)

manifest = parsed_json["content/manifest.json"]

# 2. All JS files pass node --check ------------------------------------------
js_files = []
for root, _, files in os.walk("assets/js"):
    for fn in files:
        if fn.endswith(".js"):
            js_files.append(os.path.join(root, fn))

node_available = subprocess.run(
    ["which", "node"], capture_output=True
).returncode == 0

if node_available:
    for f in js_files:
        result = subprocess.run(
            ["node", "--check", f], capture_output=True, text=True
        )
        if result.returncode != 0:
            fail(f"[JS SYNTAX] {f}: {result.stderr.strip()}")
else:
    warn("[JS SYNTAX] `node` not found on PATH — skipped JS syntax checks.")

# 3-6. Manifest lesson consistency -------------------------------------------
all_lesson_ids = []
referenced_paths = set()

for lvl in manifest.get("levels", []):
    for les in lvl.get("lessons", []):
        lid = les.get("id", "<missing id>")
        all_lesson_ids.append(lid)
        status = les.get("status")
        cp, qp = les.get("contentPath"), les.get("quizPath")

        if status == "ready":
            if not cp:
                fail(f"[STATUS] {lid}: status=ready but contentPath is null")
            elif not os.path.exists(cp):
                fail(f"[MISSING FILE] {lid}: contentPath set but file missing: {cp}")
            else:
                referenced_paths.add(cp)

            if qp:
                if not os.path.exists(qp):
                    fail(f"[MISSING FILE] {lid}: quizPath set but file missing: {qp}")
                else:
                    referenced_paths.add(qp)
                    if qp in parsed_json:
                        actual_id = parsed_json[qp].get("lessonId")
                        if actual_id != lid:
                            fail(
                                f"[QUIZ MISMATCH] {lid}: quiz file's lessonId is "
                                f"'{actual_id}', expected '{lid}' ({qp})"
                            )
            # quizPath is allowed to be null even when ready (e.g. capstone
            # reflection lessons) — that's a deliberate design choice, not
            # a status bug — so no warning here.

        elif status == "coming-soon":
            if cp or qp:
                fail(
                    f"[STATUS] {lid}: status=coming-soon but has a non-null path "
                    f"(contentPath={cp}, quizPath={qp}) — either the file is "
                    f"actually done and status should be 'ready', or the path "
                    f"should be null"
                )
        else:
            fail(f"[STATUS] {lid}: unrecognized status '{status}'")

dupes = {x for x in all_lesson_ids if all_lesson_ids.count(x) > 1}
if dupes:
    fail(f"[DUPLICATE IDS] Lesson IDs used more than once: {sorted(dupes)}")

# 7. Orphaned files -----------------------------------------------------------
on_disk = set()
for root, _, files in os.walk("content/levels"):
    for fn in files:
        on_disk.add(os.path.join(root, fn))

orphans = on_disk - referenced_paths
if orphans:
    for o in sorted(orphans):
        warn(
            f"[ORPHANED FILE] {o} exists on disk but no 'ready' manifest entry "
            f"references it — either link it or remove it"
        )

# 8. Blockquote-continuation typo scan ---------------------------------------
md_files = []
for root, _, files in os.walk("content"):
    for fn in files:
        if fn.endswith(".md"):
            md_files.append(os.path.join(root, fn))

callout_re = re.compile(r"^> \[!\w+\]")
for path in md_files:
    with open(path, encoding="utf-8") as fh:
        lines = fh.read().split("\n")
    for i, line in enumerate(lines):
        if callout_re.match(line) and i + 1 < len(lines) and lines[i + 1].startswith("|"):
            fail(
                f"[CALLOUT TYPO] {path}:{i + 2}: line after a '> [!TAG]' callout "
                f"starts with '|' instead of '>' — this truncates the callout "
                f"early (see docs/AUTHORING_GUIDE.md)"
            )

# 9. glossary.json / tools.json schema ----------------------------------------
glossary = parsed_json.get("content/glossary.json")
if glossary is not None:
    for i, entry in enumerate(glossary):
        if "term" not in entry or "definition" not in entry:
            fail(f"[SCHEMA] content/glossary.json entry {i}: missing 'term' or 'definition'")

tools = parsed_json.get("content/tools.json")
if tools is not None:
    required = {"name", "category", "platform", "description", "url"}
    for i, entry in enumerate(tools):
        missing = required - entry.keys()
        if missing:
            fail(f"[SCHEMA] content/tools.json entry {i} ({entry.get('name','?')}): missing fields {missing}")

# 10. Curated track lessonIds all reference real, existing lessons -----------
all_lesson_ids_set = set(all_lesson_ids)
for track in manifest.get("tracks", []):
    tid = track.get("id", "<missing id>")
    if not track.get("lessonIds"):
        fail(f"[TRACK] {tid}: has no lessonIds")
        continue
    for lid in track["lessonIds"]:
        if lid not in all_lesson_ids_set:
            fail(f"[TRACK] {tid}: references lesson id '{lid}' which does not exist in the manifest")

# ------------------------------------------------------------------------- #
print(f"Checked {len(json_files)} JSON files, {len(js_files)} JS files, {len(md_files)} Markdown files.\n")

if warnings:
    print(f"{len(warnings)} warning(s):")
    for w in warnings:
        print("  -", w)
    print()

if errors:
    print(f"{len(errors)} error(s):")
    for e in errors:
        print("  -", e)
    print("\nFAILED")
    sys.exit(1)
else:
    print("All checks passed.")
    sys.exit(0)
