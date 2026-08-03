---
tags:
  - Defender Suite
---

# Automated Investigation & Remediation: What It Does, and Doesn't, Do

Defender for Endpoint's Automated Investigation and Remediation (AIR) automatically investigates supported alert types, determines a verdict, and — depending on your configured automation level — can act on that verdict without waiting for an analyst.

## What it actually does

- **Investigates automatically** when a supported alert fires: examining the entity involved (a file, a process, a persistence mechanism), pivoting to related artifacts, and reaching a verdict — malicious, suspicious, or no threat found.
- **Can remediate automatically** for clear-cut, high-confidence verdicts: quarantining a malicious file, killing a malicious process, removing a confirmed-malicious persistence mechanism (a Run key, a scheduled task) — the kind of remediation this guide's [Persistence Catalog](../05-persistence/index.md) documents manually.
- **Remediation level is configurable** — from fully automatic for high-confidence verdicts, down to requiring approval for every action, depending on how much you trust the automation for your environment and how much analyst bandwidth you have to review its recommendations instead.

## Where it stops, and a human needs to pick up

- **Ambiguous verdicts still require a human.** Anything short of high confidence surfaces as a pending action for an analyst to approve or reject rather than executing automatically — this guide's [Investigation Playbooks](../08-playbooks/index.md) are exactly the reference material for that human judgment call.
- **It's strongest on file-based, single-host threats** — a malicious binary, a clearly identifiable persistence mechanism on one machine. It's meaningfully weaker at the kind of multi-stage, cross-system reasoning this guide's [Domain Compromise](../08-playbooks/domain-compromise.md) or [BEC](../08-playbooks/business-email-compromise.md) playbooks walk through — connecting a cloud sign-in anomaly to an on-prem lateral-movement chain isn't the kind of single-entity verdict AIR is built to reach on its own.
- **It doesn't replace the containment/eradication/recovery sequencing** this guide emphasizes throughout (see [Module 0](../00-foundations/ir-lifecycle.md)) — AIR can execute a remediation step, but deciding *when* in an incident's lifecycle that step belongs, and what else needs to happen alongside it, stays a human call.

!!! tip "How to think about AIR in practice"
    Treat it as a force multiplier for the clear cases, not a substitute for the playbooks in this guide — it buys back analyst time on high-confidence, single-host findings specifically so there's more bandwidth for the ambiguous, cross-system investigations that still need a person walking through them deliberately.

<!-- BACKLINKS:START -->
## Referenced From

- [Detection Engineering: From Hunt Query to Standing Detection](detection-engineering.md)
- [Module 7: Microsoft Defender Suite for IR](index.md)
- [Glossary](../glossary.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — automation's role in modern IR workflows)
