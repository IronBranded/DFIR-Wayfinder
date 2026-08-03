---
tags:
  - Anti-Forensics
  - T1070.006
---

# Anti-Forensics & Data Recovery

Every module before this one assumes the evidence is basically intact — an artifact exists, and the question is how to read it correctly. This module is about the other half of real investigations: an attacker who knows this guide exists too, and takes deliberate steps to destroy, hide, or corrupt the evidence before you get to it — and what's actually still recoverable when they try.

## A framework for the "why," not just the "how"

Dr. Marcus Rogers' taxonomy, the most widely cited framework in the anti-forensics literature, sorts every technique into one of four categories by *intent*:

| Category | What it means | Examples already in this guide |
|---|---|---|
| **Data hiding** | Conceal information's existence, not just its content | [Alternate Data Streams](alternate-data-streams.md); steganography, encryption |
| **Artifact wiping** | Destroy evidence that would otherwise persist | [USN Journal](../01-windows-endpoint/usn-journal.md) deletion; Prefetch clearing; [log clearing](log-artifact-recovery.md) |
| **Trail obfuscation** | Confuse the investigative process, not just remove evidence | [Timestomping](../01-windows-endpoint/mft.md) (T1070.006); log tampering that inserts *false* entries rather than just removing true ones |
| **Attacks against the forensic process/tools** | Target the analyst's tooling or methodology directly | Anti-VM/sandbox detection in malware; deliberately malformed files designed to crash a specific parser |

Knowing which category a technique falls into is more than trivia — it predicts where to look for what survives. Wiping and hiding leave fundamentally different kinds of residue, which is why this module's recovery pages are organized by *technique*, not lumped into one generic "anti-forensics" bucket.

## The principle that makes recovery possible at all

Every technique on this page's linked pages relies on the same underlying weakness: **destroying a file system's *reference* to data is cheap and fast; actually overwriting the underlying bytes on disk is comparatively slow and often skipped.** Deleting a file, clearing a log, or removing a directory entry typically just marks the space as available for reuse — the original bytes remain physically present until something else happens to overwrite that exact location. Every recovery technique in this module — [file carving](file-carving.md) chief among them — exploits precisely that gap.

## What's in this module

- [File Carving](file-carving.md) — recovering files with no intact filesystem metadata at all, by scanning raw bytes for file signatures
- [Alternate Data Streams](alternate-data-streams.md) — NTFS's built-in data-hiding mechanism, and how to make it visible again
- [Log & Artifact Recovery](log-artifact-recovery.md) — what survives log clearing, USN Journal deletion, and a stealthier technique that avoids the obvious "log cleared" event entirely
- [Volume Shadow Copy Recovery](volume-shadow-copy-recovery.md) — using point-in-time snapshots to recover data as it existed before tampering
- [Memory-Based File Recovery](memory-based-file-recovery.md) — recovering a file that's gone from disk but was still resident in memory when captured

<!-- BACKLINKS:START -->
## Referenced From

- [Enterprise DFIR Field Guide](../index.md)

<!-- BACKLINKS:END -->

## Sources

- Rogers, M. (2006). Anti-forensics presentation, Lockheed Martin / Purdue University — the four-category taxonomy referenced throughout this module
- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — anti-forensics detection and evidence recovery)
