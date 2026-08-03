---
tags:
  - Active Directory
  - T1003
  - T1003.006
---

# DCSync Detection

## The mechanism

DCSync doesn't require code execution on a Domain Controller at all — it abuses the legitimate Directory Replication Service protocol, impersonating a DC and simply *asking* another DC to replicate data to it, including password hashes for any account, up to and including [krbtgt](krbtgt.md). It only requires an account holding specific replication rights and network access to a DC — which is exactly why it's so widely used: no exploit, no malware on a DC, just a legitimate protocol used by an account that shouldn't have been able to invoke it.

The rights required — **Replicating Directory Changes** and **Replicating Directory Changes All** — are held by Domain Admins, Enterprise Admins, and Domain Controllers themselves by default. An attacker needs to either compromise an account already holding these rights, or first grant them to an account they control (itself a [detectable AD object modification](replication-metadata.md)).

## Where the evidence lives

**Event ID 4662** on a Domain Controller, with the `Properties` field containing one of these specific extended-right GUIDs:

| GUID | Right |
|---|---|
| `1131f6aa-9c07-11d1-f79f-00c04fc2dcd2` | Replicating Directory Changes |
| `1131f6ad-9c07-11d1-f79f-00c04fc2dcd2` | Replicating Directory Changes All (the dangerous one — this is the one that actually enables secret/hash extraction) |
| `89e95b76-444d-4c62-991a-0facbeda640c` | Replicating Directory Changes In Filtered Set |

This requires **Directory Service Access auditing** enabled (`Computer Configuration → Windows Settings → Security Settings → Advanced Audit Policy Configuration → DS Access → Audit Directory Service Access`) — it is not on by default, and needs to be turned on before an incident, not during one.

## Detection approach

The critical filter: **DCs replicate with each other constantly and legitimately**, so the GUIDs alone aren't the signal — the signal is those GUIDs appearing in a 4662 event where the requesting account is *not* a legitimate Domain Controller. Baseline and exclude your actual DC machine accounts (which end in `$`) and any known legitimate non-DC replication consumer (Entra Connect's `MSOL_` service account is a common one that needs deliberate exclusion rather than triggering a false positive every time).

!!! danger "Red flag"
    A 4662 event containing the Replicating Directory Changes / Replicating Directory Changes All GUIDs where the requesting account isn't a known Domain Controller or an explicitly allow-listed sync service account.

## What to do if confirmed

Disable the source account immediately, and specifically determine whether [krbtgt](krbtgt.md) was among the accounts replicated — if it plausibly was, that drives the double-reset remediation on its own timeline, not as an afterthought.

## ATT&CK mapping

[T1003.006 (OS Credential Dumping: DCSync)](https://attack.mitre.org/techniques/T1003/006/).

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [Reporting & Communication](../00-foundations/reporting-and-communication.md)
- [Operationalizing Threat Intelligence](../00-foundations/threat-intelligence-operationalization.md)
- [Timeline Construction & Correlation](../00-foundations/timeline-construction.md)
- [AD Certificate Services (AD CS) Abuse](adcs-abuse.md)
- [Module 2: Active Directory & Domain Controllers](index.md)
- [krbtgt: What It Is, and Why It Gets Reset Twice](krbtgt.md)
- [Artifact: NTDS.dit](ntds-dit.md)
- [The Entra Connect Server: A Target in Its Own Right](../06-cloud-identity/entra-connect-as-target.md)
- [Defender for Identity: Mapping Alerts to What You Already Know](../07-defender-suite/defender-for-identity-mapping.md)
- [Case Study: Domain Compromise, End to End](../case-studies/domain-compromise-case-study.md)
- [Case Studies](../case-studies/index.md)
- [Glossary](../glossary.md)
- [Drill: Event Log Story](../practice-drills/event-log-drill.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — Active Directory attack detection)
- MITRE ATT&CK — T1003.006
