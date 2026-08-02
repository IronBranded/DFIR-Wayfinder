# Content Standards

This guide stays useful at scale only if every page follows the same shape. Three templates, used consistently:

## Artifact page (Modules 1–3, 6, 7)

1. **What it is / where it lives** — location, format basics, what generates it
2. **Normal baseline** — what this looks like on a clean, unremarkable host
3. **Red flags** — specific, concrete deviations (name real tool names, real paths, real patterns — not "anything unusual")
4. **How to collect it** — the actual command or tool, not just the tool's name
5. **ATT&CK mapping** — which technique(s)/sub-technique(s) this artifact provides evidence for
6. **Sources** — named, linked where a stable URL exists

See [docs/01-windows-endpoint/prefetch.md](docs/01-windows-endpoint/prefetch.md) as the reference implementation.

## Persistence entry (Module 5)

**Mechanism → ATT&CK ID → where the evidence lives → detection query/approach → cleanup**

## Playbook (Module 8)

**Trigger → Triage questions → Data to pull → Analysis steps → Contain/Eradicate → Recover → Lessons learned**

## House rules

- Use `!!! success "Baseline"` and `!!! danger "Red flag"` admonition blocks consistently — this is the guide's visual language. Don't introduce new callout types without updating this file.
- Every numeric/technical claim (retention periods, timestamp counts, default settings) should be verifiable against a named source. If you can't source it, mark it as unverified rather than stating it as fact.
- Link sideways aggressively. If a playbook needs to explain an artifact, link to the artifact page — don't re-explain it.
- Scope every page to enterprise IR, not criminal-prosecution procedure, per the guide's stated audience.
- Where a page touches offensive technique categories (obfuscation, evasion, bypasses), stop at the detection signature. This guide documents how to recognize and investigate — not how to build.
