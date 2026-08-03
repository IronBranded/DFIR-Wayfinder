---
tags:
  - Active Directory
  - T1558
  - T1558.001
  - T1558.002
---

# Golden Ticket & Silver Ticket Indicators

Both techniques forge a Kerberos ticket rather than obtaining one through legitimate authentication — the difference is which key signs the forgery, and that difference changes both the blast radius and how visible the forgery is.

## Golden Ticket: forged TGT

Signed with the [krbtgt](krbtgt.md) key, so a Golden Ticket works against **any service in the domain** — full explanation of the mechanism and remediation lives on the krbtgt page. This page covers what a forged ticket tends to look like once it's in use:

- **An implausible ticket lifetime.** Default Kerberos TGT lifetime is 10 hours. Less careful Golden Ticket tooling defaults to absurd lifetimes (years), which stands out immediately once you know to look for it — though sophisticated attackers deliberately set realistic lifetimes specifically to blend in, so a normal-looking lifetime doesn't clear a ticket, it just means this particular tell doesn't apply.
- **Encryption type mismatches.** Some Golden Ticket generation tooling defaults to RC4 encryption even in environments that enforce AES — a TGT using RC4 where AES should be mandatory is worth investigating on that basis alone.
- **A TGT for an account that's disabled, doesn't exist, or has group memberships inconsistent with its real AD state** — since the forged ticket's claims don't have to correspond to anything real, mismatches here are a strong signal once you cross-reference the ticket's claims against the actual directory.

## Silver Ticket: forged service (TGS) ticket

Signed with a **target service's own account/computer hash** rather than `krbtgt` — narrower in scope (it only works against that one service) but doesn't require compromising `krbtgt` at all, and has a distinct detection challenge: some services validate the ticket locally using their own key without checking back with the KDC, meaning Silver Ticket use may **never generate the Event ID 4769 you'd normally expect on a Domain Controller.**

## The detection pattern that works for both

Look for **Event ID 4769 (Kerberos service ticket requested) with no corresponding earlier Event ID 4768 (TGT requested)** from the same logon session. A legitimate service ticket request always follows a legitimate TGT request in normal Kerberos flow; a TGS appearing with no preceding TGT in the same session is inconsistent with how genuine authentication actually happens, and is one of the more reliable forgery signals available regardless of which specific ticket type is in play.

!!! danger "Red flag"
    A 4769 with no correlating 4768 in the same session, a TGT/TGS lifetime or encryption type inconsistent with domain policy, or ticket claims (group membership, account state) inconsistent with the real directory.

## ATT&CK mapping

[T1558.001 (Golden Ticket)](https://attack.mitre.org/techniques/T1558/001/) / [T1558.002 (Silver Ticket)](https://attack.mitre.org/techniques/T1558/002/).

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [Module 2: Active Directory & Domain Controllers](index.md)
- [Defender for Identity: Mapping Alerts to What You Already Know](../07-defender-suite/defender-for-identity-mapping.md)
- [Glossary](../glossary.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — Kerberos attack detection)
- MITRE ATT&CK — T1558.001 / T1558.002
