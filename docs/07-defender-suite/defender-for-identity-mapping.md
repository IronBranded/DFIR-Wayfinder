---
tags:
  - Defender Suite
---

# Defender for Identity: Mapping Alerts to What You Already Know

Defender for Identity (DFI) watches Domain Controller traffic and logs directly, and its named alerts map cleanly onto the [Active Directory attack techniques](../02-active-directory/index.md) already covered in this guide — knowing the mapping means an alert firing tells you exactly which reference page to pull up.

| DFI alert name | Maps to |
|---|---|
| **Suspected DCSync attack (replication of directory services)** | [DCSync Detection](../02-active-directory/dcsync-detection.md) — DFI is watching for the same replication-rights abuse this guide's manual Event ID 4662 method catches, generated automatically instead of requiring you to hunt for the GUIDs yourself |
| **Suspected Golden Ticket usage** / **Forged Kerberos certificate usage** | [Golden Ticket & Silver Ticket Indicators](../02-active-directory/golden-silver-ticket.md) — DFI flags anomalous ticket lifetimes, encryption types, and references to non-existent account attributes automatically |
| **Suspected Kerberos SPN reconnaissance** / **Possible Kerberoasting attack following a suspicious LDAP query** | [Kerberoasting](../02-active-directory/kerberoasting.md) — DFI specifically watches for the LDAP enumeration step that typically precedes a Kerberoasting run, not just the ticket requests themselves |

## A limitation worth knowing, not exploiting

DFI's DCSync detection keys primarily off **the identity a replication request is made under**, not the source IP alone — worth knowing because it shapes what "properly configured" looks like: an environment where every account with replication rights is tightly scoped and monitored closes the gap that identity-based detection alone can leave open. This is a reason to pair DFI alerting with the manual baseline-and-audit approach in [DCSync Detection](../02-active-directory/dcsync-detection.md) — regularly reviewing *who holds* Replicating Directory Changes rights — rather than relying on any single detection layer alone.

## Practical note on alert latency

DFI alerts typically surface within a few minutes of the underlying activity, not instantly — factor a short delay into timeline reconstruction when correlating a DFI alert timestamp against other logs (Security 4662, [replication metadata](../02-active-directory/replication-metadata.md)) for the same event.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 7: Microsoft Defender Suite for IR](index.md)
- [Glossary](../glossary.md)

<!-- BACKLINKS:END -->

## Sources

- Microsoft Defender for Identity alert reference (learn.microsoft.com/defender-for-identity)
- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — Active Directory detection)
