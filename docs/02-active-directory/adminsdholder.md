---
tags:
  - Active Directory
  - T1098
---

# AdminSDHolder / SDProp Abuse

## The mechanism

`AdminSDHolder` is a special AD container object holding a template security descriptor (ACL). A background process called **SDProp** (Security Descriptor Propagator), running on the PDC Emulator every **60 minutes by default**, compares that template against every member of AD's "protected groups" (Domain Admins, Enterprise Admins, Schema Admins, Administrators, Account Operators, Backup Operators, and several others) and overwrites any protected object's ACL that doesn't match.

This legitimate protective feature — designed to stop accidental permission drift on your most sensitive accounts — becomes a persistence mechanism the moment an attacker with sufficient privilege modifies the `AdminSDHolder` object's ACL directly. Within the next SDProp cycle, that modified ACL propagates automatically to **every current and former protected-group member** domain-wide. Worse for defenders: if you notice and strip the attacker's added permissions from one compromised admin account, SDProp simply **reapplies them again** on its next 60-minute cycle, because the actual source — `AdminSDHolder` itself — is still poisoned. Cleaning the symptom without cleaning the source guarantees the backdoor comes back within the hour.

## Where the evidence lives

Direct modification of the `AdminSDHolder` object's ACL, capturable via Event ID 5136 (directory service object modified) if Directory Service Access auditing is enabled, or via [replication metadata](replication-metadata.md) (`repadmin /showobjmeta` against the `AdminSDHolder` object specifically) regardless of what auditing was configured at the time.

## Detection approach

The strongest behavioral signal isn't the initial ACL change — it's the *pattern* of an account's permissions reappearing after they were removed. If a protected-group member (or former member — `adminCount=1` persists even after someone leaves a protected group, and SDProp keeps enforcing against them) keeps "regaining" unexpected permissions roughly every hour despite being cleaned up, stop re-cleaning the individual account and check `AdminSDHolder`'s own ACL directly.

!!! danger "Red flag"
    Any modification to `AdminSDHolder`'s ACL outside planned administrative changes, or a protected account whose stripped permissions keep reappearing on a roughly 60-minute cadence.

## Cleanup

Restore `AdminSDHolder`'s ACL to its correct baseline — not just the individual accounts SDProp already propagated the malicious entry to, since those will simply be re-poisoned on the next cycle if the source object itself isn't fixed first.

## ATT&CK mapping

[T1098 (Account Manipulation)](https://attack.mitre.org/techniques/T1098/), specifically as a domain-persistence technique building on privileged-group membership.

!!! tip "Practice this"
    [Event Log Story](../practice-drills/event-log-drill.md) chains a DCSync event straight into an AdminSDHolder modification — reconstruct the full sequence from six raw events before checking the answer.

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [ACL & Delegation Abuse](acl-delegation-abuse.md)
- [Module 2: Active Directory & Domain Controllers](index.md)
- [The Entra Connect Server: A Target in Its Own Right](../06-cloud-identity/entra-connect-as-target.md)
- [Drill: Event Log Story](../practice-drills/event-log-drill.md)
- [Practice Drills](../practice-drills/index.md)
- [Drill: PowerShell Decode](../practice-drills/powershell-decode-drill.md)

<!-- BACKLINKS:END -->

## Sources

- [Microsoft Learn — Appendix C: Protected Accounts and Groups in Active Directory](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/security-best-practices/appendix-c--protected-accounts-and-groups-in-active-directory)
- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — Active Directory persistence)
