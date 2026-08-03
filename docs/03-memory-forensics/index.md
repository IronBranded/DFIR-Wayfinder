---
tags:
  - Memory Forensics
---

# Module 3: Windows Memory Forensics

Memory is the most volatile evidence tier that's still practical to capture in full (see [Order of Volatility](../00-foundations/order-of-volatility.md)) — and it's often the *only* place fileless techniques (see [Module 4](../04-powershell-forensics/index.md)) ever leave a trace, precisely because they never touch disk.

## Module status: complete

- [x] [Memory Acquisition](acquisition.md) — tools and live-vs-offline tradeoffs
- [x] [Process Analysis](volatility-process-analysis.md) — `pslist` / `pstree` / `psscan`, and the diff technique that catches hidden/unlinked processes
- [x] [EPROCESS Internals](eprocess-internals.md) — what's actually inside the structure, and which fields turn a flagged process into a defensible finding
- [x] [Injected Code Detection](injected-code-detection.md) — `malfind`, `ldrmodules`, `vadinfo` as a workflow
- [x] [Injection Techniques](injection-techniques.md) — process hollowing, process doppelgänging, reflective DLL injection, and what each looks like in a memory capture
- [x] [Thread Analysis](thread-analysis.md) — thread start-address anomalies, and the purpose-built plugins that catch them
- [x] [Mutex (Mutant) Analysis](mutex-analysis.md) — malware's own single-instance markers, used for fingerprinting and cross-host hunting
- [x] [LSASS Memory Analysis](lsass-memory-analysis.md) — live-read vs. offline dump-and-crack, including the verified `comsvcs.dll` technique
- [x] [Network Artifacts in Memory](network-memory-artifacts.md) — `netstat`/`netscan` and what it recovers that a live query can't
- [x] [Malware Triage Methodology](malware-triage-methodology.md) — the capstone: static + memory triage as one workflow, and turning capability into an impact statement

This module pairs directly with [Module 4: PowerShell Forensics](../04-powershell-forensics/index.md) — most of what makes fileless PowerShell dangerous is precisely that it only ever exists in the region this module covers.

<!-- BACKLINKS:START -->
## Referenced From

- [Baseline Process Trees](../01-windows-endpoint/process-trees.md)
- [PowerShell Forensics: Evasion Detection](../04-powershell-forensics/evasion-detection.md)
- [Persistence: LSA Provider / Security Support Provider Abuse](../05-persistence/lsa-ssp.md)
- [Playbook: Ransomware](../08-playbooks/ransomware.md)
- [Enterprise DFIR Field Guide](../index.md)

<!-- BACKLINKS:END -->

