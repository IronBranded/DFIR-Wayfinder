---
tags:
  - Memory Forensics
  - T1055
---

# Thread Analysis

## What it is, and why it matters for DFIR specifically

A process can look completely legitimate at the EPROCESS level — right name, right parent, right token — and still be compromised, because the actual malicious code is running in a **thread** that was injected into it after the fact. This is precisely how [reflective DLL injection and several other techniques](injection-techniques.md) hide: the *process* is real and trusted; the *thread* running inside it isn't. Process-level analysis alone cannot catch this — you have to look at the threads themselves.

## The field that does almost all the work: thread start address

Every thread has a start address — the memory location its execution began at. For a legitimate thread, that address resolves cleanly to a location inside a loaded module (a DLL or the executable itself) — Volatility's `windows.threads` plugin surfaces this directly, reporting both a `start_addr` (the raw address) and a `start_path` (the module it resolves to, if any).

**A thread whose `start_path` is blank — an address that doesn't correspond to any loaded module — is one of the highest-confidence injection indicators available in memory forensics.** Legitimate code doesn't start executing from an anonymous, unbacked memory region; injected shellcode does, almost by definition.

## The plugin set

| Plugin | What it finds | When to reach for it |
|---|---|---|
| `windows.threads` | Full thread listing per process, including `start_addr`/`start_path` and create/exit times | Your default starting point once a process is already flagged as suspicious |
| `windows.thrdscan` | Pool-scans for thread objects directly, independent of any list | The thread-level equivalent of `psscan` — catches threads a rootkit tried to unlink |
| `windows.suspicious_threads` | A purpose-built plugin specifically flagging threads with anomalous characteristics | Run this early — it does a first pass of exactly the triage this page describes, automatically |
| `windows.suspended_threads` | Enumerates threads currently in a suspended state | Directly relevant to [process hollowing](injection-techniques.md), which classically starts a process suspended before replacing its image — a suspended thread sitting around longer than expected is worth explaining |

## How you actually use this in an investigation

The workflow is almost always: [`malfind`](injected-code-detection.md) or a process-tree anomaly flags a process → `windows.threads` (or `windows.suspicious_threads` directly) enumerates its threads → any thread with an unresolved `start_path` becomes the specific object you extract and analyze further, rather than treating the whole process as one undifferentiated blob of suspicion.

This also matters for **scoping**: a process with fifteen threads where fourteen resolve cleanly to `kernel32.dll`/`ntdll.dll` and one doesn't isn't "a suspicious process" in a vague sense — it's a process where thirteen threads need no further attention and exactly one does. That distinction saves real time on a host with dozens of flagged processes.

## Turning this into report language

"The process exhibited suspicious behavior" is not a technical finding — it's an unverifiable assertion. "Of `explorer.exe`'s (PID 4412) fourteen threads, thirteen resolved to legitimate Explorer/Shell32 code; the fourteenth, created at 14:03:22, had a start address with no corresponding loaded module, consistent with injected shellcode execution" is a finding a technical reviewer can independently check against the same memory image, and a specific, defensible claim rather than a characterization. See [Reporting & Communication](../00-foundations/reporting-and-communication.md) for how findings at this level of specificity fit into both the technical and executive sections of an incident report.

## ATT&CK mapping

Supports detection of the same techniques as [Injected Code Detection](injected-code-detection.md) and [Injection Techniques](injection-techniques.md) — [T1055](https://attack.mitre.org/techniques/T1055/) and its sub-techniques — from the thread level specifically rather than the process-memory level.

<!-- BACKLINKS:START -->
## Referenced From

- [EPROCESS Internals](eprocess-internals.md)
- [Module 3: Windows Memory Forensics](index.md)
- [Malware Triage Methodology](malware-triage-methodology.md)
- [Mutex (Mutant) Analysis](mutex-analysis.md)
- [Memory-Based File Recovery](../anti-forensics/memory-based-file-recovery.md)
- [Glossary](../glossary.md)

<!-- BACKLINKS:END -->

## Sources

- Volatility 3 documentation (volatility3.readthedocs.io) — `windows.threads`, `windows.suspicious_threads`, `windows.thrdscan`, `windows.suspended_threads`
- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — thread-level injection analysis)
