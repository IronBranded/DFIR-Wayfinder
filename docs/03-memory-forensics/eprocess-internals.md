---
tags:
  - Memory Forensics
  - T1055.012
---

# EPROCESS Internals

## What it is, and why this page exists separately from Process Analysis

[Process Analysis](volatility-process-analysis.md) already covers *finding* processes — `pslist`, `psscan`, and the diff between them. This page is about what's actually *inside* the kernel structure those plugins are reading, because several of the most useful forensic facts about a process live in EPROCESS fields that a basic process listing doesn't surface by default, and knowing they're there changes what you think to ask for.

`EPROCESS` is the kernel's own data structure representing a running process — one exists for every process, allocated from kernel pool memory, and it's what `pslist` walks (via a linked list) and `psscan` finds (via pool-tag scanning) in the first place.

## The fields that matter forensically

| Field (conceptually) | What it tells you | Why it matters for DFIR |
|---|---|---|
| **PID / PPID** | Process ID and parent's Process ID | The raw data behind [Baseline Process Trees](../01-windows-endpoint/process-trees.md) — a `PPID` that doesn't match the expected parent is often the single fastest anomaly check in the whole investigation |
| **ImageFileName** | The process's own name, as it knows itself | Compare against what a filesystem-based tool reports for the same PID — a mismatch is a `PPID`-spoofing or process-hollowing tell |
| **CreateTime / ExitTime** | When the process started and (if applicable) ended | A process still showing in `psscan` with a populated `ExitTime` has already exited — its EPROCESS structure just hasn't been reclaimed yet. Confusing this for a still-running process is a common analysis error |
| **Token** | The process's security context — SIDs, privileges, integrity level | A standard user's process holding `SeDebugPrivilege` or a `SYSTEM`-equivalent token is a privilege-escalation signal, independent of anything else about the process |
| **VadRoot** | Pointer to the process's Virtual Address Descriptor tree | This is the structure [`vadinfo`/`malfind`](injected-code-detection.md) actually read — the memory-region permissions and file-backing data that reveal injected code |
| **ThreadListHead** | Pointer to the process's own list of threads | What [Thread Analysis](thread-analysis.md) walks — a process with an unexpectedly high thread count, or one whose threads don't map to loaded code, is worth a second look |
| **Handle table** | Every handle the process holds open — files, registry keys, mutexes, other processes | See [Mutex/Mutant Analysis](mutex-analysis.md); also how a process's access to `lsass.exe` shows up structurally, not just as a log line |

## How you actually use this in an investigation

You rarely query EPROCESS fields directly by name — `pslist`/`pstree`/`psscan` already surface PID/PPID/CreateTime/ExitTime in their default output, which is why [Process Analysis](volatility-process-analysis.md) doesn't need to mention EPROCESS internals to be useful for baseline triage. This page matters at the next step: once a process is already flagged as suspicious, the **Token**, **VadRoot**, and **ThreadListHead** fields are where you go to answer *why* it's suspicious with structural evidence, not just a name that looks wrong.

Concretely: `windows.privileges` (`Privs`) reads the Token field directly, surfacing enabled privileges per process — run it against anything flagged by [Process Tree Triage](../practice-drills/process-tree-drill.md)-style anomalies to check whether it's also running with unexpected privilege, which is a second, independent finding rather than a restatement of the first.

## Turning this into report language

A process-tree anomaly alone ("PID 3120 claims to be `lsass.exe`") is a weak sentence in a report — it states an observation without justifying it. Pulling the EPROCESS-level detail turns it into a defensible technical finding: *"PID 3120 presented as `lsass.exe` but its EPROCESS Token held Administrator-equivalent privileges inconsistent with the legitimate `lsass.exe` at PID 640, and its VadRoot showed a memory region with RWX permissions unbacked by any file on disk — consistent with process hollowing (T1055.012)."* That sentence cites three independent structural facts, not just a name mismatch, which is the difference between an assertion and a technical finding a reader can verify. See [Reporting & Communication](../00-foundations/reporting-and-communication.md) for how this specific kind of sentence fits into a full report.

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [Module 3: Windows Memory Forensics](index.md)
- [Malware Triage Methodology](malware-triage-methodology.md)
- [Mutex (Mutant) Analysis](mutex-analysis.md)
- [Glossary](../glossary.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — Windows kernel structures in memory forensics)
- Volatility 3 documentation (volatility3.readthedocs.io) — `windows.privileges`, `windows.getsids`
