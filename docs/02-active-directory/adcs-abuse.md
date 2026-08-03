---
tags:
  - Active Directory
  - T1649
---

# AD Certificate Services (AD CS) Abuse

## Why this belongs alongside DCSync and Golden Ticket

Everything else in this module assumes Kerberos is the authentication path being attacked. AD CS abuse is different: it targets Active Directory's built-in PKI (Public Key Infrastructure) to obtain a **certificate** that authenticates as another user — including Domain Admins — without needing that user's password or Kerberos ticket material at all. It's now one of the most actively exploited AD attack surfaces precisely because it's common (most enterprise AD environments run AD CS for something) and, until recently, rarely audited.

The 2021 "Certified Pre-Owned" research catalogued these escalation paths as ESC1 through ESC8; the catalogue has grown since — as of this writing, up to ESC17. This page covers the three most commonly encountered in real engagements; the rest share the same underlying pattern (a template, a CA setting, an ACL, or the enrollment service itself is misconfigured) and the same starting detection approach.

## ESC1 — the template that lets you be anyone

**The misconfiguration:** a certificate template allows the requester to supply an arbitrary Subject Alternative Name (SAN) in their own request, carries a client-authentication-capable Extended Key Usage, and grants enrollment rights to a broad, low-privileged group (Domain Users is the common case). Put those three together and any domain user can request a certificate claiming to *be* any other account — including a Domain Admin — and that certificate will authenticate successfully.

This is the most common and most impactful AD CS misconfiguration, and often traces back to an administrator duplicating a built-in template and enabling "supply in request" for an unrelated compatibility reason, without recognizing the combination they'd just created.

## ESC4 — the stealthy path that creates ESC1 on demand

**The misconfiguration:** a low-privileged principal has been granted `Owner`, `WriteDacl`, `WriteOwner`, or `WriteProperty` rights on a certificate template *object itself* — not on what the template allows requesters to do, but on the template's own configuration. An attacker with any of these rights doesn't need to find an already-ESC1-vulnerable template; they modify a template to introduce the ESC1 misconfiguration themselves, exploit it, and can revert the change afterward.

This is why template hardening reviews that only check current template settings can miss ESC4 entirely — the template looks fine *right now*, but whoever can write to it can make it look like ESC1 whenever they choose.

## ESC8 — the one that doesn't need a template misconfiguration at all

**The mechanism:** NTLM relay against AD CS's HTTP web enrollment endpoint. An attacker coerces or waits for a high-value account's NTLM authentication (classically, a Domain Controller's own machine account) and relays it to the enrollment service, obtaining a valid certificate *as that account* — including, if the relayed identity is a DC, a certificate that can be used to authenticate as that DC and perform [DCSync](dcsync-detection.md) directly. This path requires no vulnerable template configuration at all, which is exactly why hardening templates alone doesn't close it — the enrollment service's HTTP endpoint and NTLM relay exposure are the actual problem.

## Where the evidence lives

**Event IDs 4886 and 4887** on the Certificate Authority server (certificate request submitted / certificate issued) — most organizations don't collect these by default, which is worth confirming and fixing before an incident, not during one. A surge of certificate requests referencing SANs inconsistent with the requesting account, or requests immediately followed by authentication as a completely different, higher-privileged identity, is the core pattern regardless of which specific ESC path was used.

!!! danger "Red flag"
    A certificate issued with a SAN that doesn't match the requesting account's actual identity, a certificate template modified shortly before being exploited (cross-reference [replication metadata](replication-metadata.md) for the template object), or NTLM authentication traffic directed at the AD CS web enrollment endpoint from an unexpected source.

## How you actually use this in an investigation

Certipy (the standard open-source enumeration tool for this attack surface) is worth knowing about defensively even though this guide won't walk through using it offensively: its `find` command is what most attackers — and most legitimate security assessments — use to identify which templates in an environment are actually vulnerable, and running the equivalent audit *before* an incident is the highest-leverage single action available here. If you're investigating a suspected domain compromise and haven't yet ruled out AD CS as the path in, treat "have we audited our certificate templates" as a standing question alongside checking for [DCSync](dcsync-detection.md) and [Kerberoasting](kerberoasting.md) activity, not an afterthought.

## Turning this into report language

"A certificate was misused" doesn't convey the severity. "A certificate template (`VulnTemplate`) was found configured to allow requester-supplied Subject Alternative Names combined with client authentication rights and Domain Users enrollment access (ESC1) — this template configuration alone was sufficient for any authenticated domain user to obtain a certificate impersonating a Domain Admin account, independent of any password or Kerberos compromise" gives both the technical justification (a reviewer can verify the template settings directly) and the executive-relevant point: this wasn't a sophisticated multi-stage attack, it was a standing misconfiguration that any user in the domain could have exploited at any time.

## ATT&CK mapping

[T1649 (Steal or Forge Authentication Certificates)](https://attack.mitre.org/techniques/T1649/).

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [Module 2: Active Directory & Domain Controllers](index.md)
- [Glossary](../glossary.md)

<!-- BACKLINKS:END -->

## Sources

- SpecterOps — "Certified Pre-Owned" (the original ESC1–ESC8 research)
- [Microsoft Learn — Defender for Identity certificate security posture assessments](https://learn.microsoft.com/en-us/defender-for-identity/security-posture-assessments/certificates)
- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — AD CS attack detection)
