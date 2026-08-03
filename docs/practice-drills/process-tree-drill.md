---
tags:
  - Practice Drill
---

# Drill: Process Tree Triage

## The scenario

A live process listing pulled from a workstation, simplified to the columns that matter. Before expanding the answer: which process would you flag, and why?

| PID | Process | Parent PID | Parent Process |
|---|---|---|---|
| 4 | System | — | — |
| 372 | smss.exe | 4 | System |
| 456 | csrss.exe | 372 | smss.exe |
| 512 | wininit.exe | 372 | smss.exe |
| 524 | csrss.exe | 372 | smss.exe |
| 596 | winlogon.exe | 372 | smss.exe |
| 632 | services.exe | 512 | wininit.exe |
| 640 | **lsass.exe** | 512 | wininit.exe |
| 812 | svchost.exe | 632 | services.exe |
| 828 | svchost.exe | 632 | services.exe |
| 1044 | explorer.exe | 984 | userinit.exe |
| 2216 | outlook.exe | 1044 | explorer.exe |
| 3120 | **lsass.exe** | 812 | svchost.exe |

??? question "Reveal the answer"
    **PID 3120, the second `lsass.exe`.**

    Two things are wrong with it simultaneously, either one of which would be enough on its own:

    - **There are two `lsass.exe` processes.** Per [Baseline Process Trees](../01-windows-endpoint/process-trees.md), exactly one should ever exist.
    - **Its parent is `svchost.exe` (PID 812), not `wininit.exe`.** The legitimate `lsass.exe` at PID 640 correctly shows `wininit.exe` as its parent — PID 3120 doesn't match that pattern at all.

    Everything else in this listing is textbook-normal: `smss.exe` spawned from `System`, `wininit.exe` and `winlogon.exe` both children of `smss.exe`, `services.exe` and the legitimate `lsass.exe` both children of `wininit.exe`, `svchost.exe` children of `services.exe`, and `explorer.exe` showing `userinit.exe` as parent (already exited, which is expected — see the note on this in [Baseline Process Trees](../01-windows-endpoint/process-trees.md)).

    **What to do next:** this is exactly the pattern [Module 3](../03-memory-forensics/injection-techniques.md) covers — a process masquerading as `lsass.exe` (via [process hollowing](../03-memory-forensics/injection-techniques.md) or simple renaming) run from `svchost.exe` is not going to have the same on-disk image as the real thing. Pull [`vadinfo`/`malfind`](../03-memory-forensics/injected-code-detection.md) against PID 3120 specifically, and treat this host as needing full incident response, not just a single-process cleanup.

<!-- BACKLINKS:START -->
## Referenced From

- [Baseline Process Trees](../01-windows-endpoint/process-trees.md)
- [EPROCESS Internals](../03-memory-forensics/eprocess-internals.md)
- [Practice Drills](index.md)

<!-- BACKLINKS:END -->

