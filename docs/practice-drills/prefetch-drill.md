---
tags:
  - Practice Drill
---

# Drill: Prefetch Triage

## The scenario

You've pulled `PECmd` output from a workstation flagged for unusual outbound traffic. Nine Prefetch entries below (simplified from real `PECmd` CSV output — real output carries more columns than shown here, but these are the ones that matter for this exercise). Before expanding the answer: which entries would you flag, and why?

| Source `.pf` file | Run Count | Last Run (UTC) | Inferred launch path |
|---|---|---|---|
| CHROME.EXE-A1B2C3D4.pf | 214 | 2026-08-01 14:22 | `C:\Program Files\Google\Chrome\Application\` |
| OUTLOOK.EXE-B2C3D4E5.pf | 89 | 2026-08-01 09:03 | `C:\Program Files\Microsoft Office\root\Office16\` |
| TEAMS.EXE-C3D4E5F6.pf | 156 | 2026-08-01 08:15 | `C:\Users\jsmith\AppData\Local\Microsoft\Teams\current\` |
| UPDATE.EXE-1A2B3C4D.pf | 3 | 2026-07-30 02:14 | `C:\Users\jsmith\AppData\Local\Temp\svc\` |
| UPDATE.EXE-9F8E7D6C.pf | 1 | 2026-07-31 03:47 | `C:\Users\jsmith\AppData\Local\Temp\update_stage\` |
| WINWORD.EXE-D4E5F6A7.pf | 47 | 2026-07-31 16:40 | `C:\Program Files\Microsoft Office\root\Office16\` |
| PSEXEC.EXE-E5F6A7B8.pf | 1 | 2026-07-31 03:51 | `C:\Users\jsmith\AppData\Local\Temp\svc\` |
| EXCEL.EXE-F6A7B8C9.pf | 22 | 2026-07-29 11:05 | `C:\Program Files\Microsoft Office\root\Office16\` |
| ONEDRIVE.EXE-A7B8C9D1.pf | 178 | 2026-08-01 08:01 | `C:\Users\jsmith\AppData\Local\Microsoft\OneDrive\` |

??? question "Reveal the answer"
    **The three to flag: `UPDATE.EXE` (both entries) and `PSEXEC.EXE`.**

    - **Two `UPDATE.EXE` entries with different hashes in their `.pf` filenames, launched from two different Temp subfolders, one day apart** — this is the split-hash staging pattern from the [Prefetch](../01-windows-endpoint/prefetch.md) page: the same executable *name* copied and re-launched from different paths. A single legitimate updater doesn't normally do this.
    - **`PSEXEC.EXE` launched once, from the same Temp staging folder as the first `UPDATE.EXE` entry, three minutes later** — PsExec has legitimate administrative uses, but not from a user's Temp folder outside a sanctioned admin workflow, and the timing (three minutes after the first staged binary landed) suggests it's part of the same sequence rather than coincidence.
    - **Chrome, Outlook, Teams, Word, Excel, OneDrive** are all high run-count, standard install paths, consistent usage pattern — this is what baseline looks like, and none of it needs a second look on its own.

    **What this tells you, and what it doesn't:** Prefetch alone doesn't prove what `UPDATE.EXE` actually did — it proves execution happened, from where, and roughly when. The natural next step is exactly what the [Prefetch](../01-windows-endpoint/prefetch.md) page recommends: corroborate with [Amcache](../01-windows-endpoint/amcache.md) for a SHA-1 hash of the binary, and check [Event Log](../01-windows-endpoint/event-log-key-ids.md) 4688/Sysmon 1 data from the same window for the actual command line `PSEXEC.EXE` was run with.

<!-- BACKLINKS:START -->
## Referenced From

- [Artifact: Prefetch](../01-windows-endpoint/prefetch.md)
- [Practice Drills](index.md)

<!-- BACKLINKS:END -->

