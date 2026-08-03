---
tags:
  - Windows Endpoint
  - T1070
  - T1070.004
---

# Artifact: USN Journal

## What it is / where it lives

The Update Sequence Number (USN) Journal is NTFS's own change log — it records essentially every modification made to files and directories on a volume: creates, deletes, renames (both old and new name), data overwrites, and attribute/security changes, each tagged with a reason code and a timestamp.

- **Location:** the `$J` alternate data stream of `$Extend\$UsnJrnl`, a hidden system metadata file at the volume root.
- **Behavior:** it's a bounded ring buffer, not a permanent log. Once the journal reaches its configured size, the oldest records are overwritten to make room for new ones — so it only ever covers a rolling recent window, not the volume's full history.

## Normal baseline

A continuous stream of small, routine entries reflecting normal OS and application activity — temp file writes, browser cache updates, application auto-save behavior, Windows Update housekeeping.

## Red flags

- **A tight create → rename → delete sequence for the same short-lived file.** This is a classic staging pattern: drop a payload under an innocuous name, rename it, execute it, then delete it — all within seconds. The USN Journal often catches this even when nothing else does.
- **A USN record for a file with no corresponding current [`$MFT`](mft.md) entry.** That combination is strong evidence the file was deliberately deleted — sometimes the *only* remaining evidence it ever existed at all.
- **A gap or apparent reset in the journal's sequence numbers.** The journal can be deliberately cleared (`fsutil usn deletejournal`); an unexplained discontinuity is itself worth investigating as possible anti-forensic activity.

!!! success "Baseline"
    Continuous, unremarkable file-system housekeeping activity consistent with installed software and normal user behavior.

!!! danger "Red flag"
    Rapid create-rename-delete cycles, orphaned entries with no matching MFT record, or an unexplained journal discontinuity.

## How to collect it

Extract `$J` alongside `$MFT` during triage — the two are usually parsed together. Eric Zimmerman's `MFTECmd` handles both:

```
MFTECmd.exe -f "C:\triage\$J" --csv C:\triage\output
```

Collect this early: because it's a rolling buffer, ongoing system activity (including your own live-response tooling) can push the exact window you need out of scope.

## ATT&CK mapping

Primary evidence source for [T1070.004 (Indicator Removal: File Deletion)](https://attack.mitre.org/techniques/T1070/004/) — proving a file existed and was removed even when the file itself, and possibly its Prefetch/Amcache traces, are gone.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 1: Windows Endpoint Forensics](index.md)
- [Playbook: Data Exfiltration](../08-playbooks/data-exfiltration.md)
- [Playbook: Insider Threat](../08-playbooks/insider-threat.md)
- [Alternate Data Streams (ADS)](../anti-forensics/alternate-data-streams.md)
- [File Carving](../anti-forensics/file-carving.md)
- [Anti-Forensics & Data Recovery](../anti-forensics/index.md)
- [Log & Artifact Recovery](../anti-forensics/log-artifact-recovery.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR500 / FOR508 — filesystem journal analysis)
- Eric Zimmerman's forensic tools (MFTECmd)
