---
tags:
  - Foundations
  - T1003.001
  - T1003.006
---

# Reporting & Communication

Everything else in this guide ends at the moment of understanding — you've found the artifact, built the timeline, confirmed the compromise. None of that helps the organization until it's written down in a form someone can act on. This page is about that last step, and it's treated as its own skill deliberately: technically flawless investigative work, communicated badly, gets the wrong response from leadership just as reliably as bad investigative work does.

## Why this needs its own page

An incident report has to satisfy two readers who need almost opposite things from the same set of facts:

- A **technical reader** (another analyst, an auditor, future-you six months from now) needs enough specificity to independently verify every claim — event IDs, timestamps, exact artifact locations, the reasoning chain from evidence to conclusion.
- An **executive reader** (leadership, legal, the board) needs to understand impact and make a decision — fast, in plain language, without needing to know what a VAD tree is — and generally cannot act on a document that makes them wade through technical detail to find out what they're actually being asked to decide.

Writing one document that serves both means structuring it so each reader can get what they need without the other's needs getting in the way — not writing two unrelated documents, and not writing one watered-down document that fully serves neither.

## The shape of a single finding

Before assembling a full report, every individual finding should be constructable in four parts, in this order:

1. **Observation** — the raw, verifiable fact. "Event ID 4662 was logged at 03:16:55 UTC on DC-01, containing GUID `1131f6ad-9c07-11d1-f79f-00c04fc2dcd2`, sourced from account `svc-backup`."
2. **Interpretation** — what that fact means, using this guide's own reference pages as the justification. "This GUID corresponds to the Replicating Directory Changes All extended right; `svc-backup` is not a Domain Controller. Per [DCSync Detection](../02-active-directory/dcsync-detection.md), this is the signature of a DCSync attack."
3. **Confidence** — how sure you are, and why, per [Timeline Construction & Correlation](../00-foundations/timeline-construction.md)'s standard: is this corroborated by an independent source, or standing alone?
4. **Implication** — so what. What does this mean for scope, for remediation, for risk.

Skipping straight from Observation to Implication — "we saw a DCSync event, so the whole domain is compromised" — is how technical readers lose trust in a report: the missing Interpretation and Confidence steps are exactly what they're checking for. Skipping straight to Observation and stopping there — dumping event IDs with no Implication — is how executive readers stop reading.

## A vocabulary for confidence, used consistently

Pick a small, fixed set of confidence terms and use them the same way every time in a given report, rather than varying the language finding-to-finding in ways that accidentally imply different confidence levels:

| Term | Use when |
|---|---|
| **Confirmed** | Corroborated by two or more independent sources — the [Timeline Construction](../00-foundations/timeline-construction.md) bar |
| **Assessed / Likely** | Strong single-source evidence, consistent with known technique, but not independently corroborated |
| **Possible / Under investigation** | A lead worth stating, not yet strong enough to act on alone |

Consistency here matters more than the exact words chosen — a reader who sees "Confirmed" used loosely early in a report will discount it everywhere else, including where it's genuinely earned.

## Worked example: the same finding, two ways

This uses the confirmed finding from the [Domain Compromise case study](../case-studies/domain-compromise-case-study.md) — `svc-backup`'s credential compromise, traced back through a corrected timeline to a specific workstation.

### Technical section (for the analyst appendix)

> **Finding 3 — Credential Theft and Directory Replication Abuse (Confirmed)**
>
> At 02:58:14 UTC (corrected for an established +14-minute local clock offset — see Methodology, §2), `WKS-4471` executed `SVCHOST_HELPER.EXE` (Prefetch: `SVCHOST_HELPER.EXE-9B2A7C41.pf`, RunCount 1, launched from `%LOCALAPPDATA%\Temp\`). Sysmon Event ID 1 on the same host shows this process spawning `rundll32.exe comsvcs.dll,MiniDump` against PID 892 (`lsass.exe`) at approximately 02:58:41 UTC, consistent with the credential-dumping technique documented in T1003.001. At 03:14:02–03:14:41 UTC, the harvested `svc-backup` credential was used to authenticate to `DC-01` (Security 4624/4625). At 03:16:55 UTC, `DC-01` logged Event ID 4662 containing extended-right GUID `1131f6ad-9c07-11d1-f79f-00c04fc2dcd2` (Replicating Directory Changes All) sourced from `svc-backup` — a non-Domain-Controller account requesting directory replication, the signature of T1003.006 (DCSync). This finding is corroborated across three independent sources (host-based Prefetch/Sysmon, network firewall logs used to establish clock correction, and Domain Controller Security event logs) and is assessed as **Confirmed**.

### Executive summary section (for leadership)

> An attacker gained access to a workstation and used a built-in Windows credential-recovery feature — the same one legitimate administrators use for troubleshooting — to steal a service account's login credentials. That account had permission to copy sensitive information from our central directory system, including the master key used to issue employee login sessions. **This means the attacker could potentially have logged in as any employee, including senior leadership, without needing their actual password.** We've confirmed this happened through three separate, independently-verified sources of evidence. We are resetting the affected master key (twice, per standard procedure, to fully close the exposure) and isolating the affected workstation. We recommend [specific decision — e.g., mandatory password resets for X population, or engaging outside counsel given the scope] by [date].

### What changed between the two, and what didn't

The **facts are identical** — same timestamps, same confidence level, same conclusion. What changed: event IDs and GUIDs became "a built-in Windows credential-recovery feature" and "the master key used to issue employee login sessions"; the DCSync technical significance became "the attacker could potentially have logged in as any employee." Nothing in the executive version is technically inaccurate — it's the same finding at a different, appropriate level of abstraction, ending in a concrete decision request rather than trailing off after the technical description.

!!! danger "The most common failure in both directions"
    Writing the executive summary as a shortened version of the technical section (still full of event IDs and GUIDs, just fewer of them) fails the executive reader just as surely as omitting the technical section entirely fails the analyst who has to act on the report six months later. They are not the same document at different lengths — they're the same facts, restructured for what each reader needs to do with them.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 0: Foundations](index.md)
- [EPROCESS Internals](../03-memory-forensics/eprocess-internals.md)
- [Malware Triage Methodology](../03-memory-forensics/malware-triage-methodology.md)
- [Mutex (Mutant) Analysis](../03-memory-forensics/mutex-analysis.md)
- [Thread Analysis](../03-memory-forensics/thread-analysis.md)
- [Detection Engineering: From Hunt Query to Standing Detection](../07-defender-suite/detection-engineering.md)
- [File Carving](../anti-forensics/file-carving.md)
- [Log & Artifact Recovery](../anti-forensics/log-artifact-recovery.md)
- [Windows IR Quick Reference](../quick-reference/windows-ir-poster.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — incident report writing and executive communication)
- [Diamond Model](diamond-model.md) and [Timeline Construction & Correlation](timeline-construction.md) — the analytical structures this page's reporting method is built on top of
