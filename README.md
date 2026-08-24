# Enterprise DFIR Field Guide

An interactive, data-driven reference for enterprise digital forensics and incident response — Windows endpoints, memory, Active Directory, and hybrid/cloud identity. Built for SOC analysts, incident responders, and threat hunters. Not written for criminal-prosecution workflows.

<h3 align="center">
  <a href="https://ironbranded.github.io/Microsoft-DFIR-Wayfinder/" target="_blank" rel="noopener noreferrer">
    🟢 FIND YOUR DFIR WAY 🟢
  </a>
</h3>

## Status

Complete. All 9 original modules plus Anti-Forensics & Data Recovery, Network & Perimeter Log Analysis, Case Studies, Investigation Playbooks, and Practice Drills are fully built. ~50,000+ words across 107 pages, rebuilding clean under `mkdocs build --strict` after every change.

## Functionality added beyond the original build

- **Tags** — every page tagged by module and, where one is named directly, MITRE ATT&CK ID. Browse via the Tags Index. Regenerate after adding new pages with `python3 scripts/tag_pages.py` (idempotent — skips files that already have front matter).
- **Backlinks** — every page with incoming links gets an auto-generated "Referenced From" section. Regenerate with `python3 scripts/generate_backlinks.py` (idempotent, safe to run repeatedly — this runs automatically in CI before every deploy).
- **Breadcrumbs** and **per-page "last updated" dates** (via git history — see the note on this below).
- **PDF export** — a single combined PDF is built automatically on deploy, available at `/pdf/enterprise-dfir-field-guide.pdf` on the live site. Locally: `ENABLE_PDF_EXPORT=1 mkdocs build`. Known limitation: Mermaid diagrams (process trees, the ATT&CK hierarchy, the Diamond Model) require JS execution to render and will appear as raw code blocks in the PDF rather than diagrams; internal cross-reference links also won't resolve to in-document anchors in the merged PDF the way they do on the live site. Both are inherent to converting a linked, JS-rendered site into one static document, not bugs to chase down further.
- **Scheduled dead-link checking** — `.github/workflows/link-check.yml` runs weekly (and on any PR touching `docs/`) via `lychee`, opening an issue automatically if something 404s.
- **Light-mode contrast fix** — the original teal/amber accents failed WCAG AA against a white background (verified by computing actual contrast ratios, not eyeballing); replaced with darker variants that pass in light mode while dark mode keeps the original, already-compliant colors.

### A note on "last updated" dates

This requires real git history to be meaningful. The repo was `git init`'d as part of this build with a single initial commit — every page will show that same date until you make further commits. That's intentional; the alternative was fabricating backdated commit history, which would make the dates actively misleading rather than just uninformative.

## A known consideration: the MkDocs ecosystem is mid-transition

As of mid-2026, the original MkDocs project's maintenance has stalled, and Material for MkDocs (the theme this project uses) is in maintenance mode with an end-of-life date of **November 5, 2026** — critical fixes only until then. The Material for MkDocs team has built a designated successor, **Zensical** (same team, MIT-licensed, aiming for near drop-in migration from Material for MkDocs projects), but it is still in Alpha as of this writing.

This project is unaffected today — `requirements.txt` pins to `mkdocs-material`, which itself pins its `mkdocs` dependency below version 2, so builds won't break unexpectedly. Recommended path: keep building content here now, and re-evaluate migrating to Zensical (or a community fork such as ProperDocs/MaterialX) before the November 2026 EOL date, once Zensical is further out of Alpha. Check `zensical.org` for current migration tooling when that time comes.

## Getting this live on your own GitHub Pages

This project already has one git commit in it (see the note on revision dates above) — you're pushing an existing repo, not starting fresh.

1. Create a new, empty repository on GitHub (don't initialize it with a README, license, or .gitignore — this project already has all three).
2. Point it at your new repo and push:
   ```
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```
3. In `mkdocs.yml`, replace `YOUR-USERNAME`/`dfir-field-guide` in `site_url`, `repo_url`, and `edit_uri` with your actual GitHub username and repo name.
4. The included GitHub Action (`.github/workflows/deploy.yml`) runs automatically on every push to `main` — it builds the site (including the PDF), regenerates tags/backlinks, and pushes to a `gh-pages` branch.
5. After the first successful run, go to **Settings → Pages** in your GitHub repo and confirm the source is set to the `gh-pages` branch (GitHub sometimes needs this pointed at manually the first time).
6. Optional: enable the weekly dead-link check by doing nothing — `.github/workflows/link-check.yml` is scheduled and runs on its own once the repo is on GitHub.

## Running it locally

```
pip install -r requirements.txt
mkdocs serve
```

Then open `http://127.0.0.1:8000`.

## Contributing / content standards

See [CONTRIBUTING.md](CONTRIBUTING.md) — every reference page follows one of four fixed templates (Artifact, Persistence Entry, Playbook, or Practice Drill) so the guide stays consistent as it grows.

## Sourcing

Every page is original writing built from the facts, structures, and taxonomies published by SANS (course material and posters), Microsoft Learn/MSTIC, and the wider DFIR community. Nothing is reproduced verbatim from any source; each page links out to primaries for readers who want the original material.
