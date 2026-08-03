---
tags:
  - Anti-Forensics
  - T1564
  - T1564.004
---

# Alternate Data Streams (ADS)

## What it is, and why it exists at all

NTFS allows a single file to hold multiple named data streams — the "primary" stream is the file content you'd normally see, but a file can carry additional, named streams (`filename:streamname`) that are completely invisible to File Explorer, a default `dir` listing, and — critically — many security tools that only scan a file's primary stream. The feature exists for legitimate reasons (originally added for compatibility with Apple's Hierarchical File System, and still used today for things like storing thumbnail data), which is exactly why it's not disabled or unusual to encounter — making a malicious stream blend in rather than stand out.

## The one you'll encounter constantly, and it's not malicious

**`Zone.Identifier`** is the single most common ADS you'll see in any investigation, and it's entirely benign — Windows automatically writes it to any file downloaded from the internet (the "Mark of the Web"), recording the source zone and, often, the actual originating URL. Precisely because it's created automatically and consistently, it's genuinely useful: a `Zone.Identifier` stream on a suspicious executable can confirm it was downloaded (versus, say, copied from removable media) and sometimes reveal exactly where from, even after other download-source evidence is gone.

## Data hiding: the actual anti-forensics use

Beyond `Zone.Identifier`, ADS gets used deliberately to hide data — most commonly, an entire secondary executable or script stashed inside a stream attached to an innocuous host file, invisible to a normal directory browse and often skipped by security tooling that only inspects primary streams.

## How to make streams visible

```
dir /r
```

reveals ADS in a standard directory listing (Vista and later). For programmatic enumeration and reading:

```powershell
Get-Item -Path .\suspicious.txt -Stream *
Get-Content -Path .\suspicious.txt -Stream <stream-name>
```

## Where else the evidence lives

- **[$MFT](../01-windows-endpoint/mft.md)** — a file's MFT record enumerates all of its `$DATA` attributes, named and unnamed; an entry with an unusually high attribute count for what should be a simple file is worth a direct MFT-level look, independent of what a directory listing shows.
- **[USN Journal](../01-windows-endpoint/usn-journal.md)** — ADS creation and modification generate journal entries just like any other file write, giving you a timeline of when a stream was created even without knowing to look for it in advance.
- Note the one hard limit: an ADS **cannot be deleted independently of its host file** — the only ways to remove one are to delete the entire file or overwrite the stream directly. This means an ADS, once created, persists for the life of its host file — which cuts both ways for an attacker (durable hiding spot) and an investigator (it's not going anywhere once you know to check).

## Normal baseline vs. red flag

`Zone.Identifier` streams on downloaded files are baseline, full stop — expect them constantly and don't treat presence alone as noteworthy. What's worth flagging: any **other** stream name, especially one attached to a file type that has no legitimate reason to carry one (a plain text or log file with a stream containing a PE header), or a stream whose content, once read, is itself executable or script content.

!!! danger "Red flag"
    A non-`Zone.Identifier` stream on any file, especially one whose content resolves to executable code, a script, or an `MZ` header.

## Turning this into report language

"A hidden file was found" is vague; "the file `invoice.pdf` carried an alternate data stream named `:svc.exe` (170 KB, PE executable, `MZ` header confirmed), created per USN Journal analysis at [timestamp] — a technique consistent with NTFS Alternate Data Stream data hiding (T1564.004)" gives a technical reader everything needed to verify the finding independently, and gives an executive reader a clear, concrete image: a normal-looking file was secretly carrying a hidden program.

## ATT&CK mapping

[T1564.004 (Hide Artifacts: NTFS File Attributes)](https://attack.mitre.org/techniques/T1564/004/).

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [Anti-Forensics & Data Recovery](index.md)
- [Glossary](../glossary.md)

<!-- BACKLINKS:END -->

## Sources

- SANS Internet Storm Center — "Alternate Data Streams: Adversary Defense Evasion and Detection" (guest diary)
- MITRE ATT&CK — T1564.004
