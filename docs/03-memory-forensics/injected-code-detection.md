---
tags:
  - Memory Forensics
  - T1055
---

# Finding Injected Code: malfind, ldrmodules, vadinfo

Three plugins that work together as a workflow — broad flag, specific cross-reference, detailed inspection — rather than three independent tools.

## `malfind`: the broad flag

Scans process memory for regions with characteristics inconsistent with normal, legitimately-loaded code — most notably memory marked with **RWX (Read-Write-Execute)** permissions simultaneously that isn't backed by any file on disk. Legitimately loaded DLLs and executables are typically mapped with permissions matching their actual sections (code as read-execute, data as read-write) and are backed by the file they came from; injected shellcode or a manually-mapped PE frequently isn't backed by anything on disk at all, and often needs write access to memory it's also executing from.

`malfind` also flags regions containing a valid PE header (`MZ` signature) sitting somewhere other than a normal module base address — a strong indicator of a manually-mapped executable image.

## `ldrmodules`: cross-referencing what a process claims to have loaded

Every process's Process Environment Block (PEB) maintains three separate linked lists of loaded modules (in load order, in memory order, and in initialization order). `ldrmodules` cross-references those three lists against what's *actually* mapped in the process's memory (its VAD — Virtual Address Descriptor — tree).

**A module present in the VAD tree but missing from all three PEB lists is hidden** — and this is precisely the signature of reflective DLL injection, which manually maps a DLL into memory without ever calling the normal `LoadLibrary` API, so it never gets registered anywhere the PEB would normally track it.

## `vadinfo`: drilling into a specific region

Once `malfind` or `ldrmodules` has flagged something, `vadinfo` gives you the full detail on that specific memory region — exact permissions, size, and any file backing — for manual inspection or extraction.

## The workflow

1. Run `malfind` across all processes to get a broad list of suspicious memory regions.
2. For each flagged process, run `ldrmodules` to check whether any loaded module is missing from the PEB's own lists.
3. Use `vadinfo` on specific regions of interest for full detail before extracting or hashing the region for further analysis.

!!! danger "Red flag"
    An RWX memory region with no file backing and a valid PE header (`malfind`), or any module present in a process's VAD tree but absent from all three PEB module lists (`ldrmodules`).

## ATT&CK mapping

[T1055 (Process Injection)](https://attack.mitre.org/techniques/T1055/) broadly; see [Injection Techniques](injection-techniques.md) for how specific sub-techniques map to what you'll actually see with these plugins.

<!-- BACKLINKS:START -->
## Referenced From

- [EPROCESS Internals](eprocess-internals.md)
- [Module 3: Windows Memory Forensics](index.md)
- [Injection Techniques: What Each Looks Like in Memory](injection-techniques.md)
- [LSASS Memory Analysis & Credential Theft](lsass-memory-analysis.md)
- [Malware Triage Methodology](malware-triage-methodology.md)
- [Thread Analysis](thread-analysis.md)
- [Memory-Based File Recovery](../anti-forensics/memory-based-file-recovery.md)
- [Glossary](../glossary.md)
- [Drill: Process Tree Triage](../practice-drills/process-tree-drill.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — memory forensics, code injection detection)
- Volatility 3 documentation (volatility3.readthedocs.io)
