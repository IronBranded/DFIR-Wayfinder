# Enterprise DFIR Field Guide

An interactive, data-driven reference for enterprise digital forensics and incident response — Windows endpoints, memory, Active Directory, and hybrid/cloud identity. Built for SOC analysts, incident responders, and threat hunters. Not written for criminal-prosecution workflows.

**Live site:** update this once deployed — `https://YOUR-USERNAME.github.io/dfir-field-guide/`

## Status

This is an active work in progress. Module 0 (Foundations) and the hybrid account-compromise runbook in Module 6 are complete, along with a full exemplar artifact page (Prefetch) in Module 1. Every other module is scaffolded with a clear build checklist on its index page — see [docs/index.md](docs/index.md) for the full map.

## A known consideration: the MkDocs ecosystem is mid-transition

As of mid-2026, the original MkDocs project's maintenance has stalled, and Material for MkDocs (the theme this project uses) is in maintenance mode with an end-of-life date of **November 5, 2026** — critical fixes only until then. The Material for MkDocs team has built a designated successor, **Zensical** (same team, MIT-licensed, aiming for near drop-in migration from Material for MkDocs projects), but it is still in Alpha as of this writing.

This project is unaffected today — `requirements.txt` pins to `mkdocs-material`, which itself pins its `mkdocs` dependency below version 2, so builds won't break unexpectedly. Recommended path: keep building content here now, and re-evaluate migrating to Zensical (or a community fork such as ProperDocs/MaterialX) before the November 2026 EOL date, once Zensical is further out of Alpha. Check `zensical.org` for current migration tooling when that time comes.

## Getting this live on your own GitHub Pages

1. Create a new, empty repository on GitHub (don't initialize it with a README).
2. Push this project to it:
   ```
   git init
   git add .
   git commit -m "Initial scaffold"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
   git push -u origin main
   ```
3. In `mkdocs.yml`, replace `YOUR-USERNAME`/`dfir-field-guide` in `site_url`, `repo_url`, and `edit_uri` with your actual GitHub username and repo name.
4. The included GitHub Action (`.github/workflows/deploy.yml`) runs automatically on every push to `main` — it builds the site and pushes it to a `gh-pages` branch.
5. After the first successful run, go to **Settings → Pages** in your GitHub repo and confirm the source is set to the `gh-pages` branch (GitHub sometimes needs this pointed at manually the first time).

## Running it locally

```
pip install -r requirements.txt
mkdocs serve
```

Then open `http://127.0.0.1:8000`.

## Contributing / content standards

See [CONTRIBUTING.md](CONTRIBUTING.md) — every page follows one of three fixed templates (Artifact, Persistence Entry, or Playbook) so the guide stays consistent as it grows.

## Sourcing

Every page is original writing built from the facts, structures, and taxonomies published by SANS (course material and posters), Microsoft Learn/MSTIC, and the wider DFIR community. Nothing is reproduced verbatim from any source; each page links out to primaries for readers who want the original material.
