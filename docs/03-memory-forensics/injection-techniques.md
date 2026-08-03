---
tags:
  - Memory Forensics
  - T1055
  - T1055.001
  - T1055.012
  - T1055.013
---

# Injection Techniques: What Each Looks Like in Memory

Three distinct techniques for running malicious code under the identity of a legitimate process, each leaving a different signature for [`malfind`/`ldrmodules`/`vadinfo`](injected-code-detection.md) to find.

## Process Hollowing

Start a legitimate executable in a **suspended** state, unmap its original image from memory, and replace it with malicious code before resuming execution. The result runs with the legitimate process's name, PID, and — critically — its expected [parent process](../01-windows-endpoint/process-trees.md), which is exactly what makes hollowing effective at defeating parent-child-based detection: on paper, everything about the process looks right.

**What gives it away:** the in-memory image doesn't match the on-disk binary for that executable. Compare a hash of what's actually mapped at the process's base address (via `vadinfo`) against a hash of the legitimate file at the path the process claims to be running from — a mismatch is the signature. Some Volatility community plugins (`hollowfind` and similar) automate this comparison.

## Process Doppelgänging

A more evasive variant that exploits NTFS transactions: malicious code is written to a file *within* an NTFS transaction, a process is created from that file while the transaction is still pending, and then the transaction is rolled back — reverting the file as though the write never happened, while the already-created process keeps running with the malicious image loaded.

**Why this is harder to catch than hollowing:** there's no completed on-disk artifact to compare against at all — the file the process was created from genuinely doesn't exist in a finished state on disk, not just a mismatched one. Memory analysis is the primary avenue here, specifically because disk-based comparison has nothing to compare against.

## Reflective DLL Injection

A DLL is mapped into a target process's memory manually — resolving imports, fixing relocations, mapping sections — without ever calling the normal `LoadLibrary` API. Since the loader API was never invoked, the DLL never registers itself in the process's PEB module lists.

**This is exactly the [`ldrmodules`](injected-code-detection.md) signature**: a module present in the VAD tree with no corresponding entry in any of the three PEB lists.

## Summary table

| Technique | Process identity | On-disk artifact | Primary detection |
|---|---|---|---|
| Process Hollowing | Legitimate name/PID/parent | Exists, but doesn't match memory | Hash mismatch between disk and memory image |
| Process Doppelgänging | Legitimate name/PID/parent | Never completes — no finished file to compare | Memory analysis only; no disk-side comparison possible |
| Reflective DLL Injection | Host process is otherwise legitimate | The DLL itself may never touch disk | `ldrmodules` — module in VAD, absent from PEB lists |

## ATT&CK mapping

[T1055.012 (Process Hollowing)](https://attack.mitre.org/techniques/T1055/012/) / [T1055.013 (Process Doppelgänging)](https://attack.mitre.org/techniques/T1055/013/) / [T1055.001 (Dynamic-link Library Injection)](https://attack.mitre.org/techniques/T1055/001/).

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [Module 3: Windows Memory Forensics](index.md)
- [Finding Injected Code: malfind, ldrmodules, vadinfo](injected-code-detection.md)
- [Thread Analysis](thread-analysis.md)
- [Drill: Process Tree Triage](../practice-drills/process-tree-drill.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 / FOR610 — process injection analysis)
- MITRE ATT&CK — T1055.012 / T1055.013 / T1055.001
