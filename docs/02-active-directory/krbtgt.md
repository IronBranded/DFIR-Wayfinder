---
tags:
  - Active Directory
  - T1558
  - T1558.001
---

# krbtgt: What It Is, and Why It Gets Reset Twice

## What it is

`krbtgt` is a built-in domain account that exists purely to make Kerberos work — its password hash is the key every Domain Controller's Key Distribution Center (KDC) uses to encrypt and sign every Ticket Granting Ticket (TGT) it issues. It's never used to log in anywhere directly; its only job is being that cryptographic anchor.

## Why compromising it is catastrophic: the Golden Ticket

If an attacker obtains the `krbtgt` password hash — typically via [DCSync](dcsync-detection.md) or direct [NTDS.dit](ntds-dit.md) extraction — they can forge a completely valid TGT for **any account, including ones that don't exist, with arbitrary group memberships**, entirely offline, without ever authenticating as that account or touching a Domain Controller to do it. This is a Golden Ticket.

The reason this is so severe: a TGT's validity is checked cryptographically against the `krbtgt` key it was signed with, not by confirming anything about the target account's actual current state. A forged ticket stays valid for as long as that `krbtgt` key remains valid — **independent of the target account's password being reset, the account being disabled, or even being deleted.** This is what makes Golden Ticket one of the most durable persistence mechanisms available against a domain, and why remediating it requires touching `krbtgt` directly rather than just cleaning up individual compromised accounts.

## Why one password reset isn't enough

Active Directory retains a password **history of two** specifically for `krbtgt` — the current hash and the immediately previous one both remain valid, by design, so that TGTs issued in the moments just before a routine reset don't instantly break every active session domain-wide.

This is exactly the mechanism that defeats a single reset as remediation: resetting `krbtgt` once moves the *current* hash into the *previous* slot — the slot that's still trusted. If that's the hash the attacker actually captured, their Golden Ticket keeps working right through your first reset. **A second reset is what actually pushes the compromised hash out of both slots entirely.**

!!! success "The correct remediation sequence"
    1. Reset `krbtgt`'s password once.
    2. Wait for full replication convergence across every Domain Controller — a change that hasn't yet reached every DC leaves a window where a ticket forged with the old key still validates against whichever DC hasn't caught up yet.
    3. Wait roughly the length of the default Kerberos ticket lifetime (10 hours) before the second reset, so that any legitimately-issued tickets from before the first reset have naturally expired rather than being caught mid-flight.
    4. Reset `krbtgt` a second time, and again allow full replication convergence.

Skipping the wait between resets, or resetting only once, are the two most common ways organizations believe they've remediated a Golden Ticket incident and are wrong.

<!-- BACKLINKS:START -->
## Referenced From

- [DCSync Detection](dcsync-detection.md)
- [Golden Ticket & Silver Ticket Indicators](golden-silver-ticket.md)
- [Module 2: Active Directory & Domain Controllers](index.md)
- [Case Study: Domain Compromise, End to End](../case-studies/domain-compromise-case-study.md)
- [Drill: Event Log Story](../practice-drills/event-log-drill.md)
- [Windows IR Quick Reference](../quick-reference/windows-ir-poster.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — Active Directory incident response)
- MITRE ATT&CK — [T1558.001 (Golden Ticket)](https://attack.mitre.org/techniques/T1558/001/)
