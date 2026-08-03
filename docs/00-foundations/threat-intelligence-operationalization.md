---
tags:
  - Foundations
---

# Operationalizing Threat Intelligence

## The gap this closes

This guide has referenced MSTIC (Microsoft's Threat Intelligence Center) as a source since the very first page, and [MITRE ATT&CK](attack-primer.md) is the tagging system running through every module — but nowhere does this guide actually walk through *using* a threat intelligence report once you have one. Reading an intel report and hunting your own environment against it are different skills, and the gap between them is where a lot of genuinely good threat intelligence goes unused.

## What a usable report actually gives you

A well-written intel report (MSTIC's own actor profiles are a good example of the genre) typically contains three tiers of information, and they translate into your environment differently:

| Tier | Example | How durable it is |
|---|---|---|
| **Indicators (IOCs)** | A specific C2 domain, file hash, IP address | Least durable — per the [Pyramid of Pain](pyramid-of-pain.md), trivial for the actor to change |
| **Techniques (TTPs)** | "This actor uses DCSync after initial access," mapped to an ATT&CK ID | Far more durable — changing an entire technique is expensive for an actor |
| **Behavioral narrative** | The actual sequence: initial access vector, how they escalate, what they target | Most durable of all, and the hardest to translate directly into a query |

The common mistake is treating a report as only Tier 1 — extracting the IOC list, loading it into a blocklist, and calling the report "actioned." That's real value, but it's the least durable value in the document, and it's usually not what makes a good report actually good.

## The actual workflow

1. **Extract every ATT&CK ID the report cites.** Most quality intel reporting maps its narrative to technique IDs directly; if it doesn't, do this mapping yourself as you read.
2. **Check each technique against what this guide (or your own detection stack) already covers.** A report citing DCSync, Kerberoasting, and a specific PowerShell obfuscation pattern maps directly onto existing pages in this guide — [DCSync Detection](../02-active-directory/dcsync-detection.md), [Kerberoasting](../02-active-directory/kerberoasting.md), [Obfuscation & Decoding](../04-powershell-forensics/obfuscation-decoding.md) — meaning the detection logic likely already exists; the work is confirming it's actually deployed and tuned, not building it from scratch.
3. **For techniques with no existing coverage, that's your build list** — and it's a more valuable list than the IOC list, because it represents a genuine detection gap rather than a single expiring indicator.
4. **Use the IOCs as a starting hunt, not an ending point.** Search for the specific indicators first (fast, cheap, sometimes immediately conclusive), but don't stop there — pivot from any hit into the behavioral pattern around it, using this guide's own [Timeline Construction](timeline-construction.md) approach to build out what else happened near that indicator, not just confirm its presence.

## A concrete example

A report states: *"The actor gains initial access via phishing, uses `comsvcs.dll` to dump LSASS, and pivots to Domain Controllers via DCSync within the same session."* Turned into action:

- IOC-level: any specific hashes/domains from the report, searched immediately.
- TTP-level: this maps directly to [LSASS Memory Analysis](../03-memory-forensics/lsass-memory-analysis.md)'s `comsvcs.dll` detection and [DCSync Detection](../02-active-directory/dcsync-detection.md)'s GUID-based hunt — confirm both are actually deployed as standing detections (see [Detection Engineering](../07-defender-suite/detection-engineering.md)), not just documented as possible.
- Behavioral-level: the *speed* of the reported chain (single session, phishing to DCSync) becomes its own detection opportunity — a [correlation rule](../07-defender-suite/detection-engineering.md) alerting specifically on LSASS access followed by DCSync activity from the same host within a short window is a stronger, more specific detection than either technique alone, and it's a rule this specific report just told you is worth building.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 0: Foundations](index.md)
- [Detection Engineering: From Hunt Query to Standing Detection](../07-defender-suite/detection-engineering.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — threat intelligence-driven hunting)
- [Pyramid of Pain](pyramid-of-pain.md) — the durability framing this page builds on
