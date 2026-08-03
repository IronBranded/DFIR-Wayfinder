---
tags:
  - Cloud Identity
---

# Sign-In Logs vs. Audit Logs (and the Retention Trap Between Them)

## Two different questions, two different logs

- **Sign-in logs** answer "did someone get in, and how?" — every authentication attempt (successful or failed), the location, device, client app, which Conditional Access policies were evaluated and their result, and — with Identity Protection licensed — a risk assessment for that specific sign-in.
- **Audit logs** answer "what changed in the directory?" — administrative and object-level events: a user created, a role assigned, an app registration modified, a group membership changed.

A real investigation usually needs both, in sequence: the sign-in log to find *when and how* an attacker got in, the audit log to find *what they did once they were there* — a new mailbox rule, a new app registration, a new Conditional Access exclusion.

## The retention trap: these are not the same system as the Unified Audit Log

This is a genuinely common point of confusion worth stating plainly: **Entra ID's own native sign-in and audit logs are a completely separate system from the Microsoft Purview Unified Audit Log (UAL)**, with independent retention governed differently.

| System | Default retention | Governed by |
|---|---|---|
| Entra ID sign-in logs (native) | 7 days (Free) / 30 days (P1 or P2) | Entra ID license tier |
| Entra ID audit logs (native) | 7 days (Free) / 30 days (P1 or P2) | Entra ID license tier |
| Identity Protection risky sign-in data (P2) | An additional ~60 days on top of the above | Entra ID P2 license |
| Microsoft Purview Unified Audit Log | 180 days (Standard) / 1 year+ (Premium, E5) | Microsoft Purview Audit, independent of Entra ID licensing |

The practical implication: **if you're only relying on the Entra admin center's built-in log views, you may have as little as 7 days of visibility** — nowhere near enough for investigations that start well after initial compromise, which is most of them. Extending native Entra log retention requires configuring Diagnostic Settings to export to a Log Analytics workspace, Microsoft Sentinel, or a storage account *before* an incident — this cannot be backfilled retroactively once the native retention window has already passed.

!!! danger "Red flag (operational, not investigative)"
    Discovering during an active incident that Diagnostic Settings export was never configured, and the relevant sign-in activity is already outside the native 7/30-day window. This is a preparation gap, not a detection one — fix it before you need it, not during.

<!-- BACKLINKS:START -->
## Referenced From

- [Timeline Construction & Correlation](../00-foundations/timeline-construction.md)
- [Module 6: Cloud Identity (Entra ID / Hybrid)](index.md)
- [Module 7: Microsoft Defender Suite for IR](../07-defender-suite/index.md)
- [Case Study: Business Email Compromise, End to End](../case-studies/bec-case-study.md)
- [Case Studies](../case-studies/index.md)
- [Glossary](../glossary.md)

<!-- BACKLINKS:END -->

## Sources

- [Microsoft Learn — Microsoft Entra data retention](https://learn.microsoft.com/en-us/entra/identity/monitoring-health/reference-reports-data-retention)
- [Microsoft Learn — Manage audit log retention policies with Microsoft Purview](https://learn.microsoft.com/en-us/purview/audit-log-retention-policies)
