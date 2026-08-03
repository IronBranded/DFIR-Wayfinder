---
tags:
  - Foundations
---

# Timeline Construction & Correlation

Every other page in this guide teaches recognition — here's an artifact, here's what normal looks like, here's the red flag. This page is different: it's about what happens *after* you've found several individually-suspicious things and need to turn them into one defensible story of what happened, in order, across multiple hosts and multiple log sources that don't share a clock, a timezone, or even a timestamp format.

This is the actual daily mechanic of an investigation, and it's worth being explicit about because it's where good analysis and wrong conclusions both come from the same instinct: lining timestamps up and trusting what you see.

## Why raw timestamps don't just line up

Three separate problems, and they compound:

- **Different formats.** [`$MFT`](../01-windows-endpoint/mft.md) and [Prefetch](../01-windows-endpoint/prefetch.md) store Windows FILETIME (100-nanosecond intervals since January 1, 1601 UTC — always UTC internally, regardless of what a viewer displays). Event logs display in whatever timezone the *viewing* tool or workstation is configured for, not necessarily the timezone the event actually happened in. Cloud logs (Entra sign-in logs, the Unified Audit Log) are UTC by convention but formatted differently depending on which API or portal you pulled them from.
- **Clock skew.** A host's local clock can simply be wrong — NTP sync silently failing, a stale CMOS battery, a misconfigured timezone — and every timestamp that host generates locally (Prefetch, its own Event Log, Sysmon) inherits that error. This is *not* rare, and it doesn't announce itself.
- **Ingestion latency.** Some sources don't even timestamp *arrival* the same as *occurrence*. The Purview Unified Audit Log is the sharpest example in this guide's scope — see [Sign-In Logs vs. Audit Logs](../06-cloud-identity/sign-in-vs-audit-logs.md) — where an event that already happened may simply not be queryable yet.

None of these are exotic edge cases. Assume all three are in play on every multi-source investigation until you've specifically checked otherwise.

## Establishing — and correcting for — clock skew

You can't take a host's word for its own clock. What you can do is find an event that got recorded **independently, by two systems with different clocks**, and compare.

The classic anchor: a network connection. A host's local Sysmon Event ID 3 records a connection at the host's own (possibly wrong) time. A centrally-logged, NTP-synced firewall or proxy sees the *same* connection (matching source IP, destination, port, and a timestamp within a plausible margin) and logs it at the *correct* time. The difference between the two is your skew, in both magnitude and direction.

```
Host-local timestamp for the connection:   03:15:38
Firewall/proxy timestamp, same connection: 03:01:38
Skew: host clock is 14 minutes FAST
```

Once you know the skew, apply it to **every timestamp that host generated locally** before comparing it against anything else — not just the one event you happened to check. A single correction event calibrates the whole host's local timeline.

!!! danger "Red flag, and a trap"
    Skipping this step doesn't just add imprecision — it can change the *interpretation* of an attack. A short, tight gap between two events might look like scripted, automated attacker tooling; correct for a clock running fast and the same two events might be sixteen minutes apart, consistent with a human operator working manually through each step. Those two conclusions point investigators toward different threat models entirely.

## Building a super timeline

Once individual sources are normalized, the standard tool for merging them into one sorted view is **`log2timeline`/`plaso`** (actively maintained — SANS FOR508's standard timelining tool). The workflow has three stages, mirrored by plaso's three command-line tools:

1. **Extract** — `log2timeline.py` parses each source (filesystem, registry hives, event logs, browser history, and — usefully for this guide — it can ingest a `mactime`-format body file directly from [MFTECmd](../01-windows-endpoint/mft.md) output) into one `.plaso` storage file.
2. **Verify** — `pinfo.py` reports what was actually collected, so you know the merged timeline's coverage before trusting gaps in it.
3. **Sort, filter, and export** — `psort.py` produces the final human-readable timeline, filtered to a time window and normalized to a single timezone:

```
psort.py --output-time-zone 'UTC' -o l2tcsv -w supertimeline.csv out.plaso \
  "date > datetime('2026-01-01T00:00:00') AND date < datetime('2026-01-02T00:00:00')"
```

`--output-time-zone 'UTC'` is the practical version of "normalize everything" from earlier on this page — it's the single flag doing that work. For collaborative, multi-analyst work at scale, [Timesketch](https://timesketch.org) provides a shared front-end over the same plaso output.

## Reading a super timeline without drowning in it

A raw super timeline from even a single host is enormous — most of it routine. Three habits keep it usable:

- **Filter to a window before you filter by content.** Establish the incident's rough boundaries first (from your highest-confidence artifact — an alert timestamp, a known-bad file's creation time), then narrow. Filtering by keyword across the *entire* uncapped timeline buries the signal in volume.
- **Tag as you go.** Mark confirmed-relevant events distinctly from "still investigating" ones — a timeline you've partially triaged is a different, more useful object than the raw output.
- **Anchor on your highest-confidence timestamp and work outward.** A DCSync alert timestamp (Defender for Identity, [DCSync Detection](../02-active-directory/dcsync-detection.md)) is high-confidence — it's generated by the DC observing the replication request directly. A Prefetch last-run time is lower-confidence on its own — it only proves execution happened *at some point*, with weaker precision. Build outward from strong anchors, not from whichever artifact you happened to find first.

## How much correlation is enough

A single artifact is a lead, not a conclusion — this point already appears throughout this guide's artifact pages ([Amcache](../01-windows-endpoint/amcache.md) says it explicitly), but it's worth stating as a general principle here: **treat any single-source finding as provisional until a second, independently-generated source agrees with it.** "Independently-generated" is the operative phrase — two entries in the same log file corroborating each other is much weaker than a host-side artifact and a network-side log agreeing, because a single compromised or misconfigured source can be wrong in ways that repeat within itself but won't coincidentally match an unrelated system.

This is also where a timeline earns its keep as evidence, not just as an organizational tool: an incident write-up built on "these five things happened, in this order, corroborated across independent sources" is a fundamentally stronger document than a list of red flags in no particular sequence — and it's what the [Diamond Model](diamond-model.md) and [Evidence Handling](evidence-handling.md) pages both assume you're capable of producing.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 0: Foundations](index.md)
- [Reporting & Communication](reporting-and-communication.md)
- [Operationalizing Threat Intelligence](threat-intelligence-operationalization.md)
- [Volume Shadow Copy Recovery](../anti-forensics/volume-shadow-copy-recovery.md)
- [Case Study: Business Email Compromise, End to End](../case-studies/bec-case-study.md)
- [Case Study: Domain Compromise, End to End](../case-studies/domain-compromise-case-study.md)
- [Case Studies](../case-studies/index.md)
- [Glossary](../glossary.md)
- [Enterprise DFIR Field Guide](../index.md)
- [Network & Perimeter Log Analysis](../network-analysis/index.md)
- [Proxy & Firewall Log Triage](../network-analysis/proxy-firewall-triage.md)
- [Practice Drills](../practice-drills/index.md)
- [Drill: Timeline Correlation](../practice-drills/timeline-correlation-drill.md)

<!-- BACKLINKS:END -->

## Sources

- [Plaso / log2timeline documentation](https://plaso.readthedocs.io/) and project repository
- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — timeline analysis is a core module)
- [Timesketch](https://timesketch.org) — collaborative timeline analysis front-end
