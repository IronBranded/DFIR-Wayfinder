---
tags:
  - Playbook
---

# Playbook: Domain Compromise / Lateral Movement

## Trigger

A Defender for Identity alert (DCSync pattern, Golden/Silver Ticket indicators, Kerberoasting), a privileged account authenticating from an unexpected host or at an unusual hour, or a pattern of one account authenticating across many hosts in a short window — the hallmark of an attacker moving laterally with a stolen credential.

## Triage questions

- Which accounts show authentication to hosts they don't normally touch?
- Is there evidence of credential access — unusual handles opened to `lsass.exe` (see [Baseline Process Trees](../01-windows-endpoint/process-trees.md))?
- Are there DCSync-pattern replication requests originating from a non-Domain-Controller host?
- Can you identify patient zero — the first host in the chain?

## Data to pull

- Security 4624/4625/4648/4672 across Domain Controllers and every host the suspect account touched
- Sysmon Event ID 10 (`ProcessAccess`) fleet-wide, filtered to `lsass.exe` as the target
- [Amcache](../01-windows-endpoint/amcache.md) and [Prefetch](../01-windows-endpoint/prefetch.md) on each affected host, for evidence of credential-theft or lateral-movement tooling
- Replication metadata from the [Active Directory module](../02-active-directory/index.md) — `repadmin` output and replication-attribute timestamps

## Analysis

Build an authentication timeline for the compromised account across every host, working backward from the most recent activity to identify patient zero. Cross-reference `lsass.exe` access events against the [baseline process tree](../01-windows-endpoint/process-trees.md) — a credential-theft tool accessing `lsass.exe` shows up as a process with no business reason to touch it, from a parent that has no business launching it. Confirm whether DCSync or ticket-forging indicators point to full domain compromise (attacker has, or can trivially get, Domain Admin-equivalent access) rather than a single-host incident.

## Contain

Isolate every confirmed-affected host from the network before doing anything else. Disable every confirmed-compromised account. **Do not immediately reset `krbtgt`** without a coordinated plan — done carelessly, a single reset creates confusion during an already-chaotic incident; done as a rushed panic action, it can also tip off an attacker still active in the environment.

## Eradicate

Reset the `krbtgt` account's password **twice**, with time for replication to converge between resets — the same underlying logic as the [password-reset-twice guidance in Module 6](../06-cloud-identity/index.md#why-the-password-gets-reset-twice-in-hybrid-environments): a single reset can leave a window where old key material is still valid somewhere in the domain, which is exactly what a Golden Ticket exploits. Remove every [persistence mechanism](../05-persistence/index.md) found on every affected host — a domain-wide incident requires a domain-wide sweep, not just cleanup of patient zero.

## Recover

Re-enable accounts and hosts in stages, with monitoring in place, rather than all at once. Rotate credentials for every account with any plausible exposure, not just the ones with confirmed misuse.

## Lessons learned

Was there a credential-tiering model in place (workstation-tier accounts never used for server or DC administration)? Where did detection actually catch this — and how much lateral movement happened before it did? That gap is usually the most actionable finding in the whole incident.

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [Automated Investigation & Remediation: What It Does, and Doesn't, Do](../07-defender-suite/automated-investigation-remediation.md)
- [Module 8: Investigation Playbooks](index.md)
- [Case Study: Domain Compromise, End to End](../case-studies/domain-compromise-case-study.md)
- [Case Studies](../case-studies/index.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — Active Directory incident response)
- NIST SP 800-61 Rev. 2 (see [Module 0](../00-foundations/ir-lifecycle.md) for the phase structure this playbook follows)
