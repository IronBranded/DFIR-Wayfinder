---
tags:
  - Active Directory
  - T1098
  - T1098.001
  - T1098.007
  - T1484
  - T1484.002
---

# ACL & Delegation Abuse

## Why this is bigger than AdminSDHolder

[AdminSDHolder](adminsdholder.md) is one specific, well-known example of a broader category: Active Directory's entire permission model is built on Access Control Lists (ACLs) granting specific rights to specific principals over specific objects, and **any** object with an over-permissive ACL is a potential attack path, not just the one this guide already named. This is the category BloodHound-style attack-path mapping tools exist specifically to visualize — because the individual misconfigurations are often boring and easy to miss one at a time, but chain together into a full path to Domain Admin when viewed as a graph.

## The rights that matter most

| Right | What it actually lets you do |
|---|---|
| `GenericAll` | Full control over the object — equivalent to owning it |
| `GenericWrite` | Modify most attributes, including ones with security implications |
| `WriteDacl` | Modify the object's own ACL — grant yourself (or anyone) further rights, including `GenericAll`, afterward |
| `WriteOwner` | Take ownership of the object, which implicitly grants the ability to modify its ACL next |
| `ForceChangePassword` | Reset a user's password without knowing their current one |
| `AddMember` | Add a principal (including yourself) to a group |

The dangerous pattern isn't any single right in isolation — plenty of delegated rights are legitimate (a help-desk group with `ForceChangePassword` over regular users is completely normal). It's a **low-privileged principal holding one of these rights over a high-value target**: a regular user with `GenericAll` over a Domain Admin's user object, or `WriteDacl` over a group that's itself a member of a protected group.

## How the chain works

None of these rights need to be exploited directly against the ultimate target. A common chain: attacker compromises a low-privileged account → that account has `GenericWrite` over Service Account A (unrelated, seemingly low-value) → Service Account A has `AddMember` rights on Group B → Group B is nested inside Domain Admins. Each individual hop looks unremarkable reviewed on its own; the chain is only visible when the full graph is mapped end to end.

## Where the evidence lives

Direct ACL modifications generate **Event ID 5136** (directory service object modified) if Directory Service Access auditing is enabled — the same event already used elsewhere in this module for [SYSVOL/GPO](sysvol-gpo.md) and [AdminSDHolder](adminsdholder.md) changes. For historical reconstruction regardless of what auditing was active at the time, [replication metadata](replication-metadata.md) (`repadmin /showobjmeta`) shows exactly when a given object's ACL last changed and from which DC.

## How you actually use this in an investigation

Auditing this proactively (before an incident) means periodically mapping the actual attack-path graph — who holds dangerous rights over what — rather than only reviewing changes reactively. During an active investigation, once you've confirmed a specific low-privileged account is compromised, the actual next question is "what does this account's ACL-derived reach actually extend to" — not just its explicit group memberships, but every object it holds `GenericAll`/`GenericWrite`/`WriteDacl`/`ForceChangePassword` over, since any of those is a viable next hop for an attacker who's done the same mapping you're doing now, likely well before you started.

!!! danger "Red flag"
    A low-privileged account holding any of the rights above over an object with materially higher privilege than the account itself — the mismatch, not any single right, is the signal.

## Turning this into report language

"The account had excessive permissions" doesn't give a reader anything to act on. "The compromised account `svc-report` held `GenericAll` rights over the `Tier0-Admins` security group, a nesting inconsistent with its function and not attributable to any documented delegation — this single misconfigured ACL meant compromise of a low-privileged service account was structurally equivalent to compromising Domain Admin directly" states the finding, cites the specific mechanism, and makes the severity self-evident without requiring the reader to already understand AD ACLs.

## ATT&CK mapping

[T1098.001–T1098.007 (Account Manipulation)](https://attack.mitre.org/techniques/T1098/) broadly, and [T1484.002 (Domain Trust Modification)](https://attack.mitre.org/techniques/T1484/) where the abused object relates to trust configuration specifically.

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [Module 2: Active Directory & Domain Controllers](index.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — Active Directory attack-path analysis)
- MITRE ATT&CK — T1098, T1484
