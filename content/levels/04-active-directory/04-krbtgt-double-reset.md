The previous lesson established that a Golden Ticket survives password resets, account disablement, and endpoint rebuilds. This lesson covers the one thing that actually kills it — and why doing it wrong either fails to remediate or takes down authentication across the domain.

## Why once isn't enough

Active Directory deliberately retains **two** krbtgt password hashes: the current one and the immediately previous one. When a DC receives a TGT it can't decrypt with the current key, it retries with the previous key. This exists for a good reason — it prevents tickets issued moments before a password change from instantly breaking.

The consequence for incident response is direct: <cite index="6-1">resetting the password once leaves the previous hash functional, so any Golden Tickets created with that hash keep working — only after the second reset is the original compromised hash fully removed from active use</cite>.

> [!IMPORTANT]
> This is the same "reset twice" principle as the [hybrid identity runbook](#/lesson/l6-01-hybrid-runbook), but for a completely different underlying reason. There, the second reset addresses password-hash sync back to on-premises AD. Here, it's about flushing AD's own two-hash history buffer. Same instruction, different mechanism — worth keeping straight.

## The wait between resets, and the two strategies

<cite index="6-1">Both resets cannot be performed in rapid succession without risking authentication failures across the domain; Microsoft's own script enforces a mandatory waiting period of at least 10 hours between the first and second reset, allowing all domain controllers to replicate the change</cite>. That 10 hours is not arbitrary — <cite index="2-1">it corresponds to the default Maximum lifetime for user ticket and Maximum lifetime for service ticket policy settings, so where those have been altered, the minimum wait should be greater than the configured value</cite>.

There are genuinely two approaches, and the right one depends on the situation:

**Maintenance / hygiene:** reset once, wait for full replication and ticket expiry, reset again. Lowest disruption. This is the correct approach for routine rotation.

**Emergency breach recovery:** <cite index="7-1">resetting twice in rapid succession, before AD replication completes, invalidates all existing TGTs and forces every client to re-authenticate</cite> — <cite index="4-1">which will likely require restarting application services to get them speaking Kerberos correctly again</cite>. Deliberately disruptive, and sometimes exactly what a confirmed Golden Ticket demands.

> [!WARNING]
> Choosing between these is an incident-command decision, not a technical one. The tradeoff is real: the safe path leaves a forged ticket valid for at least another 10 hours; the fast path causes domain-wide authentication disruption. Decide deliberately, with the business, rather than defaulting.

## Multi-domain forests

In a forest with child domains, sequence matters. Reset the child domain's krbtgt first, verify stability, then proceed to the parent — this limits the blast radius if something goes wrong, rather than destabilizing the forest root first.

## Before you start

Verify domain controller replication health *before* the first reset. A reset that doesn't replicate cleanly to every DC is worse than not having started: some DCs will hold the new key while others hold the old one, producing intermittent, hard-to-diagnose authentication failures on top of an active incident.

## Normal baseline

krbtgt `pwdLastSet` reflects either a documented rotation or a completed incident-recovery action. Replication health is green across all DCs. Any reset is performed with the Microsoft-provided script rather than an ad-hoc password change, because the script handles RODC krbtgt accounts and validation that a manual reset does not.

## Red flags

- **A krbtgt `pwdLastSet` value that has never changed since domain creation** — meaning any historical compromise remains exploitable indefinitely.
- **A single reset performed during incident response with no second reset scheduled** — remediation that stopped halfway and left the attacker's key valid.
- **A krbtgt password change with no corresponding change ticket or incident record** — an attacker performing the reset themselves is a way to lock defenders out of forged-ticket detection while retaining other access.

## How to collect it

Check `Get-ADUser krbtgt -Property pwdLastSet, msDS-KeyVersionNumber` to establish when the account was last reset and its current key version. Verify replication health with `repadmin /replsummary` and `repadmin /showrepl` before beginning. Use the community-maintained `Reset-KrbTgt-Password-For-RWDCs-And-RODCs.ps1` script — originally authored at Microsoft and since maintained publicly — which enforces the wait period and handles read-only DC krbtgt accounts correctly.

## ATT&CK mapping

This lesson is remediation content for [Golden Ticket (T1558.001)](https://attack.mitre.org/techniques/T1558/001/) — the countermeasure to the technique the previous lesson covered.

## Sources

- [Microsoft Learn — AD Forest Recovery: Reset the krbtgt password](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/forest-recovery-guide/ad-forest-recovery-reset-the-krbtgt-password)
- [Microsoft Q&A — krbtgt password reset guidance](https://learn.microsoft.com/en-us/answers/questions/87978/reset-krbtgt-password)
- MITRE ATT&CK — T1558.001: Golden Ticket
