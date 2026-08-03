---
tags:
  - Anti-Forensics
---

# Memory-Based File Recovery

## What it is, and why memory succeeds where disk fails

A file that's been deleted, securely wiped, or never fully committed to disk can still be sitting, intact, in memory — if it was open, mapped, or loaded at the moment of [acquisition](../03-memory-forensics/acquisition.md). This is the sharpest illustration of why [Order of Volatility](../00-foundations/order-of-volatility.md) puts memory ahead of disk: an attacker focused entirely on disk-based anti-forensics (secure deletion, [carving](file-carving.md)-resistant wiping) may not have touched — or even been aware of — the copy still resident in RAM.

## Where this applies

- A malicious DLL or executable, memory-mapped into a process, then deleted from disk while the process kept running (or shortly after it exited, before the memory was reclaimed).
- A document opened, read, and closed by an application whose cache or working set still holds the content, even after the file itself was deleted.
- Any file an attacker's own tooling read into memory as part of execution — the memory copy doesn't disappear just because the on-disk original does.

## How to actually pull it

Volatility's `windows.dumpfiles` plugin extracts memory-mapped files directly from a capture:

```
vol -f memory.dmp windows.dumpfiles --pid <PID>
```

This works because a memory-mapped file's data pages are tracked the same way any other VAD-backed memory region is — the same underlying structure [`vadinfo`](../03-memory-forensics/injected-code-detection.md) already reads for injection detection. Extracting a deleted-from-disk file and extracting an injected code region are, mechanically, close cousins of the same technique.

## What you get, and its limits

A memory-mapped file recovered this way is frequently **not byte-identical** to the original on-disk file — memory-mapping can involve padding, partial loading (only the pages actually accessed may be resident), or in-memory modification after loading. Treat a memory-recovered file as strong evidence of *content and presence*, and verify anything you plan to state as a precise hash match against other corroborating sources before treating the recovered copy as forensically identical to the original.

## How you actually use this in an investigation

This is a targeted technique, not a broad sweep — you reach for it once [process or thread analysis](../03-memory-forensics/thread-analysis.md) has already identified a specific PID worth extracting from, not as a first move against an entire memory image. The natural sequence: [malware triage](../03-memory-forensics/malware-triage-methodology.md) flags a process → you determine it loaded or referenced a file that's no longer on disk → `dumpfiles` against that specific PID recovers what's still resident.

## Turning this into report language

"The malicious file could not be recovered from disk" is where a lot of investigations would stop — and it's not actually the end of the story if a memory capture exists. "Although the dropped payload was deleted from disk prior to acquisition (confirmed absent via [MFT](../01-windows-endpoint/mft.md) review), the memory capture of PID 4412 retained the mapped file content, recovered via `windows.dumpfiles` and confirmed to match the SHA-256 hash associated with [known-malicious indicator]" turns a dead end into a confirmed technical finding, and is exactly the kind of detail that justifies why memory acquisition mattered enough to prioritize in the first place.

<!-- BACKLINKS:START -->
## Referenced From

- [Anti-Forensics & Data Recovery](index.md)

<!-- BACKLINKS:END -->

## Sources

- Volatility 3 documentation (volatility3.readthedocs.io) — `windows.dumpfiles`
- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — memory-based file recovery)
