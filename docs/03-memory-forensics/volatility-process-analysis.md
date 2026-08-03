---
tags:
  - Memory Forensics
---

# Process Analysis: Finding What's Hidden

## Two fundamentally different ways to enumerate processes

Volatility 3's process plugins split into two families that answer different questions, and the difference matters enormously for detecting hidden processes.

| Plugin | Approach | What it catches | What it misses |
|---|---|---|---|
| `windows.pslist` | Walks the OS's own doubly-linked list of active processes (the same structure Task Manager reads) | Every legitimately-tracked running process | Anything deliberately unlinked from that list |
| `windows.pstree` | Same underlying data as `pslist`, presented as a parent-child hierarchy | The same processes as `pslist`, with [baseline process tree](../01-windows-endpoint/process-trees.md) context | The same blind spot as `pslist` |
| `windows.psscan` | Scans all of physical memory directly for process-object signatures, independent of any linked list | Hidden/unlinked processes, and recently-exited processes whose memory hasn't been overwritten yet | Nothing extra to miss — this is the wider net |

`pslist`/`pstree` are only as reliable as the list they're reading — a well-known rootkit technique (DKOM, Direct Kernel Object Manipulation) deliberately unlinks a malicious process from that exact structure, making it invisible to Task Manager, Process Explorer, and `pslist` simultaneously, while the process keeps running normally underneath.

## The core technique: diff the two views

```
vol -f memory.dmp windows.pslist -r csv > pslist.csv
vol -f memory.dmp windows.psscan -r csv > psscan.csv
```

Any PID present in `psscan` output but **absent from `pslist`** is either a process that's already exited (its memory hasn't been reclaimed yet — often benign) or a deliberately hidden process. Corroborate with other signals — active threads, open handles, or entries in [`netscan`](network-memory-artifacts.md) tied to that PID — to tell the two apart. This same "compare two views of the same data and investigate the gap" approach shows up throughout this guide — it's the same underlying logic as diffing [Shimcache](../01-windows-endpoint/shimcache.md) modified timestamps against actual file metadata.

!!! tip "A note on `psxview`"
    Volatility 2's dedicated `psxview` plugin, which automated exactly this cross-reference, is confirmed present in current Volatility 3 releases (`windows.psxview`) as of this writing — a convenient shortcut if your installed version has it. The manual `pslist`/`psscan` diff above achieves the same result and works regardless of version, which is why it's shown as the primary technique on this page.

!!! danger "Red flag"
    Any PID appearing in `psscan` but not `pslist`, especially one with active network connections or open handles to sensitive processes like `lsass.exe`.

<!-- BACKLINKS:START -->
## Referenced From

- [Memory Acquisition](acquisition.md)
- [EPROCESS Internals](eprocess-internals.md)
- [Module 3: Windows Memory Forensics](index.md)
- [Malware Triage Methodology](malware-triage-methodology.md)
- [Mutex (Mutant) Analysis](mutex-analysis.md)
- [Network Artifacts in Memory](network-memory-artifacts.md)
- [Glossary](../glossary.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — memory forensics with Volatility)
- Volatility 3 documentation (volatility3.readthedocs.io)
