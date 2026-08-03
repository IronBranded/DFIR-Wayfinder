---
tags:
  - Defender Suite
---

# Detection Engineering: From Hunt Query to Standing Detection

## The gap between the two

[Advanced Hunting with KQL](advanced-hunting-kql.md) covers writing queries to answer a specific question, right now, about data you already have — a hunt. This page is about the different discipline of turning a hunt query that found something real into a **rule that runs itself, forever**, catching the same pattern automatically the next time it happens. Every KQL example earlier in this module is a hunt query; none of them are a deployed detection until this step happens.

## What a custom detection rule actually needs

In Defender XDR, a KQL query becomes a rule via **Custom Detection Rules** — but a query written for one-time hunting usually needs adjustment first:

- **Required output columns.** The query must project `Timestamp` and `ReportId` (and `DeviceId`, if querying device-based tables) — omit these and the "Create detection rule" option is simply unavailable. This trips up more people than any other part of the setup, precisely because a hunt query that works fine interactively can silently fail this requirement.
- **Frequency.** Scheduled rules run every 1/3/12/24 hours, each with a matched lookback window (hourly checks the past 4 hours, every-24-hours checks the past 30 days) — or **Continuous (NRT)**, near-real-time, for qualifying queries. NRT has stricter syntax requirements: no joins, unions, or `externaldata`; regex must be double-escaped; only generally-available (non-preview) columns.
- **Entity mapping.** Without explicitly mapping query columns to entity types (Device, User, File, IP), triggered alerts won't correlate into incidents with related alerts — they'll sit isolated even when they're actually part of the same attack chain another rule also caught.
- **Response actions**, if wanted — isolate a device, run an AV scan, restrict app execution — execute automatically when the rule fires, tying directly into what [Automated Investigation & Remediation](automated-investigation-remediation.md) covers for the broader AIR system.

## The tuning problem this guide can't hand you a formula for

A rule that's too broad generates alert fatigue and gets ignored or disabled; a rule that's too narrow misses variants of the same technique. There's no universal answer, but a consistent process: **deploy new rules initially without automated response actions**, review what fires for a defined period, tighten or loosen the query based on real results, and only add automated response once the rule's false-positive rate is actually known rather than assumed. Treat frequency the same way — higher frequency (or NRT) buys faster detection at the cost of query quota, and isn't automatically the right choice for lower-priority rules where a 12- or 24-hour cadence is genuinely sufficient.

## How this connects to the rest of this guide

Every example in [Advanced Hunting with KQL](advanced-hunting-kql.md) is a reasonable starting candidate for a standing rule — the encoded-PowerShell query, the `comsvcs.dll` LSASS-dump query, the Office-app-spawns-shell query. So is any query built directly from [Operationalizing Threat Intelligence](../00-foundations/threat-intelligence-operationalization.md)'s workflow: a technique confirmed present in a relevant intel report is a strong candidate for promotion from "something we could hunt for" to "something that alerts us automatically," precisely because a report telling you an actor uses a technique is itself evidence the technique is worth standing detection, not just an occasional check.

## Turning this into report language

For an executive audience specifically, the distinction between "we can find this if we look" and "we're automatically alerted when this happens" is a meaningful, reportable difference in security posture — not just a technical implementation detail. "Following this incident, the detection logic used to identify the compromise (LSASS access via `comsvcs.dll`, correlated with directory replication activity) has been deployed as a standing, automated detection rule running continuously — this specific attack pattern will now generate an immediate alert rather than requiring a hunt to discover" is exactly the kind of forward-looking, decision-relevant statement [Reporting & Communication](../00-foundations/reporting-and-communication.md) calls for in an executive summary's remediation section.

<!-- BACKLINKS:START -->
## Referenced From

- [Operationalizing Threat Intelligence](../00-foundations/threat-intelligence-operationalization.md)
- [Module 7: Microsoft Defender Suite for IR](index.md)
- [Glossary](../glossary.md)

<!-- BACKLINKS:END -->

## Sources

- [Microsoft Learn — Create custom detection rules in Microsoft Defender XDR](https://learn.microsoft.com/en-us/defender-xdr/custom-detection-rules)
