---
tags:
  - Anti-Forensics
---

# File Carving

## What it is, and why it works at all

File carving recovers files by scanning raw bytes for recognizable file signatures — completely ignoring the filesystem's own metadata (the MFT, directory entries, allocation tables). This matters because most "deletion" doesn't actually erase data: deleting a file in NTFS marks its MFT entry and the clusters it occupied as available for reuse, but the original bytes physically remain on disk until something else happens to write over that exact location. A quick format only clears the file table, not the data; even many purpose-built "secure delete" tools vary widely in whether they actually overwrite what they claim to. Carving exploits the gap between *the filesystem says this space is empty* and *the space is actually empty*.

## How it actually works

Most common file formats have a distinctive **header** (magic bytes at the start) and often a **footer** (an end-of-file marker). A carving tool scans a disk image byte-by-byte for these signatures and extracts everything between a header and its corresponding footer (or, for formats without a reliable footer, up to a configured maximum size).

| File type | Header (hex) | Footer (hex) |
|---|---|---|
| JPEG | `FF D8` | `FF D9` |
| PNG | `89 50 4E 47` | `49 45 4E 44 AE 42 60 82` |
| PDF | `25 50 44 46` (`%PDF`) | `25 25 45 4F 46` (`%%EOF`) |
| ZIP / Office (docx, xlsx, etc.) | `50 4B 03 04` (`PK..`) | — (use central directory or size estimation) |
| Windows PE (exe/dll) | `4D 5A` (`MZ`) | — (use PE header's own size fields) |

Recovered files from pure carving lose their original filenames and metadata by design — the filesystem structures that held that information are exactly what's gone. Recovered output is typically named generically (`file0001.jpg`) and needs to be identified by content, hash, or embedded strings.

## The limitation that matters most: fragmentation

Simple header/footer carving assumes a file's data is stored **contiguously** — one unbroken run of clusters. In practice, especially on a disk that's been in use for a while, files frequently fragment into non-contiguous pieces. When that happens, naive carving grabs only the first fragment and produces a truncated or corrupted result. Filesystem-aware carving (tools that reference remaining MFT structure, even partial, rather than ignoring it entirely) handles this meaningfully better than pure signature-based carvers — worth knowing which category a given tool falls into before trusting a "no results" outcome.

## Tools

| Tool | Approach | Notes |
|---|---|---|
| **PhotoRec** (CGSecurity, ships with TestDisk) | Pure signature carving, 480+ file type signatures | Most forgiving on damaged media; filenames always lost |
| **Foremost** (originally US Air Force OSI) | Config-file-driven header/footer matching | Compact, scriptable, easy to add custom signatures |
| **Scalpel** | A faster fork of Foremost, skips irrelevant regions | Same config style as Foremost |
| **bulk_extractor** | A different approach entirely — extracts *content patterns* (emails, URLs, BTC addresses, search queries) rather than whole files | Genuinely useful for a different question: not "recover this file" but "what fragments of text or identifiers exist anywhere on this disk, allocated or not" |
| **Autopsy** | Integrated carving module built on SleuthKit | Good default when you're already working in a full case-management tool rather than single-purpose CLI tools |

## How you actually use this in an investigation

Carving is a last resort in terms of sequencing, not importance — reach for it after normal filesystem-based recovery (checking `$Recycle.Bin` directly for straightforward deletions, reviewing [$MFT](../01-windows-endpoint/mft.md) for orphaned-but-still-referenced entries) has been exhausted, because it's slower and produces less contextualized output. The point where it becomes essential: when an attacker has taken deliberate steps — secure-delete tooling, format, direct manipulation of MFT entries — that go beyond simple deletion. If the file you need existed and was later removed, and normal artifact review shows no trace of it, carving unallocated space is often the only remaining path to the actual content (as opposed to just evidence that *something* happened, which artifacts like [Prefetch](../01-windows-endpoint/prefetch.md) or the [USN Journal](../01-windows-endpoint/usn-journal.md) may still provide even after the file itself is gone).

Always image first — never carve against a live, writable disk. A drive with unstable sectors should be imaged with a tool built for that specifically (`ddrescue`, which logs and retries bad sectors rather than failing outright) before any carving attempt.

## Turning this into report language

Carved output on its own is weak evidence — "a JPEG matching this signature was recovered from unallocated space" doesn't establish when it was created, by whom, or that it's even related to the incident. What makes a carved file reportable is corroboration: a recovered file whose content matches a hash already seen elsewhere in the investigation (an [Amcache](../01-windows-endpoint/amcache.md) SHA-1, a file named in [Prefetch](../01-windows-endpoint/prefetch.md)) moves from "a curiosity found on disk" to "confirmed recovery of the deleted tool referenced in Finding 2." State the corroboration explicitly — per [Reporting & Communication](../00-foundations/reporting-and-communication.md), a finding is only as strong as what independently confirms it.

<!-- BACKLINKS:START -->
## Referenced From

- [Anti-Forensics & Data Recovery](index.md)
- [Memory-Based File Recovery](memory-based-file-recovery.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR500/FOR508 — file carving and data recovery methodology)
- CGSecurity — PhotoRec / TestDisk documentation
