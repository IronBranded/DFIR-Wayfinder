---
tags:
  - Windows Endpoint
  - T1070
  - T1070.006
---

# Artifact: $MFT & Timestomping

## What it is / where it lives

The Master File Table (`$MFT`) is the index NTFS uses to track every file and directory on a volume — it isn't a normal file you can just open, but it's extractable with any forensic imaging or triage tool. Every object on the volume gets at least one MFT record (typically 1024 bytes), and each record carries several "attributes." Two matter enormously for DFIR:

- **`$STANDARD_INFORMATION` (SI)** — the MACB timestamps (Modified, Accessed, Changed, Born/Created) that most tools, including Windows Explorer's own Properties dialog, show by default. These are easy for a user-mode tool to modify.
- **`$FILE_NAME` (FN)** — a *second*, independent set of MACB timestamps, updated far more restrictively by the OS (normally only at creation and on rename/move). Ordinary timestomping utilities that only touch the file via standard Win32 APIs modify SI but can't easily touch FN.

## Normal baseline

For a legitimately created file, SI and FN timestamps sit close together — FN's creation time is essentially never *later* than SI's, and both roughly track when the file actually arrived on the volume.

## Red flags

- **SI creation time earlier than FN creation time.** This is the textbook timestomping signature: a tool backdated the visible (SI) timestamp but couldn't touch the harder-to-reach FN timestamp underneath it.
- **A file's SI timestamp that doesn't fit its neighbors.** MFT records created close together in time (adjacent record numbers) should have close creation timestamps. A record with a wildly out-of-sequence SI creation time, sitting among records from a completely different period, is worth a second look.
- **A deleted file's MFT record still readable with intact metadata.** NTFS marks a record "available for reuse" on deletion but doesn't necessarily zero it immediately — a freshly deleted malicious binary's original name, size, and timestamps can often still be recovered.

!!! success "Baseline"
    SI and FN timestamps consistent with each other and with the surrounding MFT record sequence.

!!! danger "Red flag"
    SI creation time predates FN creation time, or a timestamp badly out of sequence with neighboring records.

## How to collect it

Extract `$MFT` as part of standard triage (it's accessible via most imaging tools, or directly via a raw volume read). Parse with Eric Zimmerman's `MFTECmd`, which outputs both SI and FN timestamp sets side by side specifically so they can be diffed:

```
MFTECmd.exe -f C:\triage\$MFT --csv C:\triage\output
```

## ATT&CK mapping

Directly maps to [T1070.006 (Indicator Removal: Timestomp)](https://attack.mitre.org/techniques/T1070/006/). More broadly, `$MFT` is a foundational **data source** for filesystem timeline reconstruction across nearly every other technique in this guide.

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [Timeline Construction & Correlation](../00-foundations/timeline-construction.md)
- [Module 1: Windows Endpoint Forensics](index.md)
- [Artifact: Shimcache (AppCompatCache)](shimcache.md)
- [Artifact: USN Journal](usn-journal.md)
- [Alternate Data Streams (ADS)](../anti-forensics/alternate-data-streams.md)
- [File Carving](../anti-forensics/file-carving.md)
- [Anti-Forensics & Data Recovery](../anti-forensics/index.md)
- [Memory-Based File Recovery](../anti-forensics/memory-based-file-recovery.md)
- [Glossary](../glossary.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR500: Windows Forensic Analysis — NTFS/MFT internals is a core module)
- Eric Zimmerman's forensic tools (MFTECmd)
