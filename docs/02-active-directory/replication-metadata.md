---
tags:
  - Active Directory
  - T1207
---

# Artifact: Replication Metadata

## What it is / where it lives

Every attribute on every Active Directory object carries its own hidden change history — which Domain Controller last modified it, when, and what version number that change represents. This is core AD replication plumbing, not a security feature, which is exactly what makes it valuable: it's very difficult for an attacker to suppress or fake without breaking replication itself.

- **The attribute:** `msDS-ReplAttributeMetaData`, queryable via LDAP on any AD object, holding a per-attribute record of the originating DC, timestamp, and version/USN for every change ever made.
- **The tool:** `repadmin.exe` (built into Windows Server) — `repadmin /showobjmeta <object DN>` shows this history for a specific object directly; `repadmin /showrepl` and `/replsummary` show overall replication health and topology.

## Normal baseline

Attribute changes originating from the small set of DCs actually in your environment, at times consistent with known administrative activity, with replication converging normally across all DCs within your environment's expected latency window.

## Red flags

- **An attribute change attributed to a DC that doesn't exist in your known DC inventory.** This is the signature of a **DCShadow** attack — where an attacker temporarily registers a rogue system as if it were a legitimate DC (via specific SPN and configuration manipulation), pushes a malicious replicated change, then de-registers it. Because the change arrives via the legitimate replication protocol, it doesn't generate the usual administrative-action event log entries a direct AD modification would — the replication metadata itself is often the clearest remaining evidence.
- **A change timestamp inconsistent with the object's other activity**, or a version-number gap suggesting a change occurred that isn't otherwise accounted for in your logging.

!!! danger "Red flag"
    Replication metadata attributing a change to any system not on your known, current list of Domain Controllers.

## How to collect it

```
repadmin /showobjmeta "CN=<object>,DC=<domain>,DC=<tld>"
```

Run against a suspect object to get its full per-attribute change history directly, independent of whatever Security-log auditing was or wasn't enabled at the time the change occurred.

## ATT&CK mapping

Primary detection method for [T1207 (Rogue Domain Controller / DCShadow)](https://attack.mitre.org/techniques/T1207/), and a general forensic backstop for reconstructing AD object history when standard event logging wasn't configured or has since rolled off retention.

<!-- BACKLINKS:START -->
## Referenced From

- [ACL & Delegation Abuse](acl-delegation-abuse.md)
- [AD Certificate Services (AD CS) Abuse](adcs-abuse.md)
- [AdminSDHolder / SDProp Abuse](adminsdholder.md)
- [DCSync Detection](dcsync-detection.md)
- [Module 2: Active Directory & Domain Controllers](index.md)
- [Artifact: SYSVOL & Group Policy Abuse](sysvol-gpo.md)
- [Defender for Identity: Mapping Alerts to What You Already Know](../07-defender-suite/defender-for-identity-mapping.md)
- [Drill: Event Log Story](../practice-drills/event-log-drill.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — Active Directory forensics)
- MITRE ATT&CK — T1207
