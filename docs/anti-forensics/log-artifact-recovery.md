---
tags:
  - Anti-Forensics
---

# Log & Artifact Recovery

## What survives log clearing, and why

When Event ID [1102](../01-windows-endpoint/event-log-key-ids.md) fires — the Security log was cleared — the underlying `.evtx` file is rewritten from scratch, but the *old* file's data isn't securely wiped. Its clusters simply become unallocated, available for reuse but not yet overwritten. Three separate avenues can recover what was in it:

1. **NTFS metadata journals.** The `$LogFile` transaction log and the [USN Journal](../01-windows-endpoint/usn-journal.md) may retain references to the original `.evtx` file's data-run locations, letting you find the original clusters before anything else reuses them.
2. **[Volume Shadow Copies](volume-shadow-copy-recovery.md).** A shadow copy taken before the clearing event may contain a complete, intact pre-clearing snapshot of the log file — often the fastest and most complete recovery path when one exists.
3. **Direct carving.** EVTX files are organized into 64KB chunks, each beginning with a distinctive `ElfChnk` signature. Scanning unallocated space for that signature recovers orphaned chunks even with zero filesystem metadata remaining — and because each chunk is largely self-describing (including the `EventRecordID` range it covers), a carved chunk can often be parsed in isolation.

**Tools purpose-built for this:** `EVTXtract` (Willi Ballenthin) recovers EVTX fragments from raw images, unallocated space, or memory captures directly. `bulk_extractor`'s dedicated EVTX-carving plugin does the same as part of a broader carving pass. Once you have carved chunks, `EvtxECmd` (the same Eric Zimmerman tool used for normal EVTX parsing elsewhere in this guide) can parse them directly.

!!! tip "Why full recovery isn't guaranteed"
    EVTX records aren't fully self-contained — the format reuses "templates" across nearby records to save space, and a record's complete meaning sometimes depends on template data stored elsewhere in the same chunk. If that template data is itself corrupted or only partially recovered, some records may parse incompletely even when their raw bytes were successfully carved. Partial recovery is still far better than none, but don't expect every carved chunk to yield a perfectly clean result.

## A stealthier technique that skips 1102 entirely

A more sophisticated attacker doesn't clear the log at all — clearing is loud specifically *because* it generates the very 1102 event this guide already teaches you to alert on. Instead: **suspend the Windows Event Log service's threads**, do whatever noisy thing needs doing, then resume them (the public tool `Invoke-Phant0m` implements exactly this). While suspended, events generated elsewhere in the OS queue up in ETW but never get written to the `.evtx` file — no 1102, no cleared-log event at all, just a gap.

**Detection doesn't rely on the log itself, for the obvious reason** — two independent checks instead:

- **`EventRecordID` continuity.** Each EVTX chunk header records a first and last `EventRecordID`, and the counter should be strictly monotonic across the whole channel. Suspension doesn't reset this counter (the *service* is suspended, not the underlying ETW provider counting events) — but timestamps will show an unexplained gap with zero events from providers that are normally constantly active, which is glaringly obvious on something like a Domain Controller's Security log.
- **The event log service's own lifecycle channel.** `Microsoft-Windows-EventLog%4Operational` logs the health of the logging service itself — its heartbeat pattern breaking is a signal independent of anything that could be suppressed by suspending the *other* channels' writers.

!!! danger "Red flag"
    A gap in `EventRecordID` continuity with no corresponding 1102 event, especially on a host that should be generating constant activity through the gap window.

## How you actually use this in an investigation

Priority order when you discover a cleared or gapped log: check for a Volume Shadow Copy first (fastest, most complete if one exists and predates the clearing), then check `$LogFile`/USN Journal for surviving cluster references, then fall back to direct `ElfChnk` carving if the first two come up empty or the timeframe is too old for shadow copies to cover. For the thread-suspension variant specifically, the `EventRecordID` continuity check should be a standing habit on any host where you're relying heavily on Security log completeness — not just something you reach for once you already suspect tampering.

## Turning this into report language

"Log records could not be located for the period in question" is a dead end in a report — it invites the reader to wonder whether you looked hard enough. "The Security log was cleared at [timestamp] (Event ID 1102); records for the preceding six hours were recovered via chunk-carving of unallocated space, recovering 340 of an estimated 412 events based on `EventRecordID` continuity, sufficient to reconstruct the attacker's authentication sequence" is a finding that shows the work and states its own completeness honestly — which per [Reporting & Communication](../00-foundations/reporting-and-communication.md) is exactly the level of specificity a technical reader needs to trust the conclusion built on top of it.

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [Anti-Forensics & Data Recovery](index.md)
- [Volume Shadow Copy Recovery](volume-shadow-copy-recovery.md)
- [Glossary](../glossary.md)

<!-- BACKLINKS:END -->

## Sources

- EVTXtract (Willi Ballenthin) and `bulk_extractor` EVTX-carving plugin documentation
- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — log tampering detection and recovery)
