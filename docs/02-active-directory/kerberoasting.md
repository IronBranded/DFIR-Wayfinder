---
tags:
  - Active Directory
  - T1558
  - T1558.003
---

# Kerberoasting

## The mechanism

Any authenticated domain user can legitimately request a Kerberos service ticket (TGS) for any registered Service Principal Name — this is normal, necessary Kerberos behavior, not a vulnerability by itself. The TGS is encrypted using the **target service account's** password hash, not the requesting user's. If that service account still allows RC4 encryption and has a weak or old password, an attacker can request the ticket, take it away, and crack it completely offline — no further contact with the Domain Controller, no lockout risk, no additional network noise after the single initial request.

Service accounts are disproportionately good targets: they're often set up once, given a password that's never rotated, frequently over-provisioned with privilege, and — unlike interactive user accounts — rarely subject to the same password-complexity scrutiny in older environments.

## Where the evidence lives

**Event ID 4769** (Kerberos service ticket requested), specifically instances where the **Ticket Encryption Type is `0x17`** (RC4-HMAC) requested against a service account.

## Detection approach

A single 4769 for a single service a user is about to legitimately access is completely normal — that's what Kerberos does constantly. The signature that matters is **volume and breadth from one requesting account in a short window**: a normal user requesting service tickets for dozens of different SPNs within seconds or minutes has no legitimate reason to be doing that, and is consistent with an automated tool enumerating every roastable service account it can find.

!!! danger "Red flag"
    A single account requesting RC4-encrypted (`0x17`) service tickets against an unusually large number of distinct SPNs in a short time window.

## Longer-term mitigation (worth flagging even outside an active incident)

- Enforce AES-only Kerberos encryption domain-wide where every service supports it, which removes the RC4 weak-crypto option Kerberoasting tooling depends on by default.
- Move service accounts to Group Managed Service Accounts (gMSAs), which use long, random, automatically-rotated passwords that are impractical to crack even if roasted.
- Periodically audit for and remove unnecessary or stale SPNs — every registered SPN is a potential roasting target.

## ATT&CK mapping

[T1558.003 (Kerberoasting)](https://attack.mitre.org/techniques/T1558/003/).

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [Operationalizing Threat Intelligence](../00-foundations/threat-intelligence-operationalization.md)
- [AD Certificate Services (AD CS) Abuse](adcs-abuse.md)
- [Module 2: Active Directory & Domain Controllers](index.md)
- [Advanced Hunting with KQL](../07-defender-suite/advanced-hunting-kql.md)
- [Defender for Identity: Mapping Alerts to What You Already Know](../07-defender-suite/defender-for-identity-mapping.md)
- [Glossary](../glossary.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — Kerberos attack detection)
- MITRE ATT&CK — T1558.003
