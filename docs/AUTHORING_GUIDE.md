# Authoring Guide

This project is built so that adding or editing content never risks breaking anything else. This guide covers the exact schema for every content type and the safe workflow for common changes.

## The golden rule

**`content/manifest.json` is the only file that defines site structure.** Lesson `.md` files are pure prose. Quiz `.quiz.json` files are pure questions. Neither knows anything about where it sits in the curriculum, what level it belongs to, or what comes next — that's the manifest's job alone. Keep it that way.

## Adding a new lesson

1. **Pick the level** it belongs in, inside `content/manifest.json` → `levels[]`.

2. **Write the lesson content** as a new `.md` file under `content/levels/<level-id>/`. No frontmatter — just start writing prose. Supported Markdown:
   - Headings (`#`, `##`, `###`)
   - Bold/italic/inline code
   - Fenced code blocks (with automatic copy button)
   - GitHub-style alert callouts (see below)
   - Blockquotes, ordered/unordered lists, tables
   - Links (external links automatically open in a new tab), images, horizontal rules

3. **Write a quiz** (optional) as a new `.quiz.json` file, same directory, matching schema:

   ```json
   {
     "lessonId": "l2-04-example-lesson",
     "questions": [
       {
         "id": "q1",
         "type": "single",
         "prompt": "Question text goes here?",
         "options": ["Option A", "Option B", "Option C", "Option D"],
         "correctIndex": 1,
         "explanation": "Why this answer is correct, shown after the user answers."
       },
       {
         "id": "q2",
         "type": "multi",
         "prompt": "Select all that apply.",
         "options": ["Option A", "Option B", "Option C"],
         "correctIndices": [0, 2],
         "explanation": "Explanation shown after answering."
       }
     ]
   }
   ```

   Use `"type": "single"` with `correctIndex` (a number) for single-answer questions, or `"type": "multi"` with `correctIndices` (an array) for select-all-that-apply. A lesson can skip a quiz entirely — see Level 7's certification and practice-labs lessons for the pattern (set `quizPath` to `null` in the manifest, below).

4. **Add the manifest entry** — inside the right level's `lessons[]` array:

   ```json
   {
     "id": "l2-04-example-lesson",
     "module": "Static Analysis Fundamentals",
     "title": "Example Lesson Title",
     "summary": "One sentence shown on cards and in search results.",
     "estimatedMinutes": 12,
     "status": "ready",
     "contentPath": "content/levels/02-static-analysis/04-example-lesson.md",
     "quizPath": "content/levels/02-static-analysis/04-example-lesson.quiz.json",
     "objectives": [
       "What the learner will be able to do after this lesson",
       "A second concrete, testable objective"
     ],
     "tags": ["relevant", "search", "keywords"]
   }
   ```

   Set `status` to `"ready"` once the content file exists. Paths are relative to the repo root, matching how `contentPath`/`quizPath` are fetched everywhere else.

5. **Validate before committing:**

   ```bash
   python3 scripts/validate.py
   ```

   This runs every check described in [Validating your changes](#validating-your-changes) below — it's the only command you need before committing.

That's the entire workflow. No other file needs to change — `nav.js` and `app.js` both build everything from the manifest at load time.

## Adding a "coming soon" placeholder lesson

Exactly the same manifest entry as above, but set `"status": "coming-soon"` and omit `contentPath`/`quizPath` (or set them to `null`). The app renders a placeholder panel showing the lesson's `objectives` instead of attempting to fetch a file that doesn't exist yet. This is how roadmapped content stays visible and honest instead of a dead link.

## Editing an existing lesson

Just edit the `.md` file directly. Since lesson prose carries no metadata, this is always safe — it cannot affect the sidebar, the homepage, or any other lesson, regardless of how much you rewrite.

## Editing quiz questions

Edit the `.quiz.json` file directly, keeping the schema above. Run `python3 scripts/validate.py` before committing — a malformed quiz file will fail to load for that lesson only; it won't affect anything else on the site.

## Callout syntax reference

GitHub-style alert blockquotes render as styled callout boxes:

```markdown
> [!NOTE]
> Neutral, supplementary information.

> [!TIP]
> A helpful shortcut or best practice.

> [!IMPORTANT]
> Something the reader should not skip.

> [!WARNING]
> A real risk if ignored.

> [!CAUTION]
> A safety-critical warning — used for anything that could cause real harm if mishandled (running an unverified binary outside an isolated environment, taking an eradication action before containment is confirmed, tipping off an active attacker mid-investigation, etc.).

> [!LAB]
> A hands-on exercise the reader should actually go do before continuing. Custom to this project, not a standard GitHub alert type.

> [!PLAIN]
> A plain-language restatement of a technical term or concept, immediately after it's introduced — the "in other words" moment for a reader with no prior technical background. Custom to this project. Use it generously anywhere a lesson introduces real jargon (a protocol name, a CPU concept, an acronym); it should never be the only explanation, but it should always be present alongside the technical one.
```

> [!WARNING]
> Every line of a callout's body must start with `>` — including blank-seeming continuation lines. A line that doesn't start with `>` ends the callout early and will render as a stray paragraph (often starting with a visible `|` or other leftover character if you were building a table). If a callout looks broken after rendering, this is the first thing to check.

## Adding to the glossary or tools reference

Both are flat JSON arrays — append an entry matching the existing shape:

```json
// content/glossary.json
{"term": "New Term", "definition": "A clear, one-to-three-sentence definition."}

// content/tools.json
{"name": "Tool Name", "category": "Existing or new category string", "platform": "Windows / Linux / Cross-platform / Web", "description": "What it does and why it's here.", "url": "https://official-source.example"}
```

New `category` values in `tools.json` automatically get their own section header on the Tools page — no code changes needed. Keep category names consistent (exact string match) with any existing ones you mean to group under.

## Adding a new Level or restructuring the curriculum

Levels live in `content/manifest.json` → `levels[]`, each with `id`, `number`, `title`, `tagline`, `difficulty`, `description`, and a `lessons[]` array following the lesson schema above. The sidebar and homepage both render levels in array order — reordering the curriculum is as simple as reordering this array. `difficulty` should be one of `Novice`, `Beginner`, `Intermediate`, or `Advanced` to match the existing tier color-coding in `components.css`; introducing a new tier name would need a matching CSS rule added there.

## Validating your changes

Before committing anything under `content/` or `assets/js/`, run:

```bash
python3 scripts/validate.py
```

This checks everything covered above automatically: every JSON file parses, every JS file has valid syntax, every `ready` lesson's paths actually exist and every `coming-soon` lesson's paths are actually null, every quiz file's internal `lessonId` matches the manifest entry pointing to it, there are no duplicate lesson IDs or orphaned files, and the callout-typo pattern described above isn't present anywhere. It exits non-zero on failure, so it's safe to chain: `python3 scripts/validate.py && git commit ...`.

The same script runs automatically in CI (`.github/workflows/validate.yml`) on every push and pull request that touches content or JS — so a mistake that slips past a local check still gets caught before it reaches `main`.

## What NOT to do

- Don't add frontmatter to `.md` files — metadata belongs only in the manifest.
- Don't hardcode navigation links anywhere — if you're tempted to add a link outside of what `nav.js` generates from the manifest, that's a sign the content belongs in the manifest instead.
- Don't use absolute paths (leading `/`) anywhere in content or code — this site is designed to work both at a GitHub Pages project subpath (`username.github.io/repo-name/`) and at a root domain, and a leading slash breaks the former.
- Don't skip JSON validation before committing a hand-edited `.json` file — a single missing comma will break that file's feature cleanly, but it's a five-second check to avoid it entirely.
