---
tags:
  - Foundations
  - T1547.001
---

# Module 0: Foundations

Before touching a single artifact, every investigator needs shared vocabulary and shared frameworks. This module is short by design — six ideas, each of which gets used constantly in every module that follows.

| Page | What it gives you |
|---|---|
| [IR Lifecycle](ir-lifecycle.md) | The phases every incident moves through, and why "lessons learned" is a phase, not an afterthought |
| [Order of Volatility](order-of-volatility.md) | Why you image memory before disk, and disk before network logs |
| [MITRE ATT&CK Primer](attack-primer.md) | The tagging system used on every artifact and persistence page in this guide |
| [Pyramid of Pain](pyramid-of-pain.md) | Why hunting for behaviors beats hunting for IOCs |
| [Diamond Model](diamond-model.md) | A four-part frame for structuring what you know about an intrusion |
| [Evidence Handling & Chain of Custody](evidence-handling.md) | What rigor looks like when the goal is containment and recovery, not court |
| [Timeline Construction & Correlation](timeline-construction.md) | How to turn several individually-suspicious findings into one defensible, correctly-ordered story — clock skew, ingestion latency, and the `plaso` workflow |
| [Operationalizing Threat Intelligence](threat-intelligence-operationalization.md) | Turning an intel report's IOCs and TTPs into actual hunts and standing detections, not just a blocklist |
| [ATT&CK Coverage Map](attack-coverage-map.md) | Every tactic in the Enterprise matrix, mapped to what this guide covers — and an honest list of what it doesn't yet |
| [Reporting & Communication](reporting-and-communication.md) | How to turn a confirmed finding into a report that satisfies both a technical reviewer and an executive decision-maker — from the same facts |

!!! tip "How to use this module"
    Skim it once end to end, then treat it as a reference. When a later page says "tagged T1547.001" or "this is a Pyramid-of-Pain TTP-level detection," come back here if the shorthand doesn't click yet.

<!-- BACKLINKS:START -->
## Referenced From

- [Enterprise DFIR Field Guide](../index.md)

<!-- BACKLINKS:END -->

