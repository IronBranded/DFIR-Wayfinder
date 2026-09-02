Some evidence is gone the moment you make the wrong move, and the wrong move is often the instinctive one. Order of volatility is the discipline that decides what you collect first — a decision made once, early, under pressure, with no opportunity to revisit it.

## The classic ordering

RFC 3227 lays out the sequence, from most volatile to least:

1. **CPU registers and cache**
2. **Routing table, ARP cache, process table, kernel statistics, RAM**
3. **Temporary file systems**
4. **Disk**
5. **Remote logging and monitoring data**
6. **Physical configuration and network topology**
7. **Archival media**

## What that means in practice

Registers and cache are effectively unobtainable in enterprise IR, so the working order collapses to something shorter:

**Memory → volatile system state → disk → logs.**

[Memory acquisition](#/lesson/l3-01-acquisition) comes first because it is the only source that disappears completely on power loss. Volatile state — active connections, running processes, logged-on users, open handles — next, because much of it is reconstructible from memory but faster to capture directly. Disk after, because it survives. Logs last, because they persist longest on the host itself.

## The decision that actually matters

The instinct on discovering a compromised host is to **power it off**. That single action destroys everything at the top of the list.

**Network isolation achieves containment without that cost.** Disconnect the host from the network — physically, by VLAN, or through EDR-based isolation — and the attacker loses access while memory stays intact for collection. This is the reasoning behind the containment guidance in [the ransomware playbook](#/lesson/l8-05-playbook-ransomware), and it applies far beyond ransomware.

> [!WARNING]
> There are cases where immediate power-off is correct — active destruction of data, or encryption in progress that isolation cannot stop fast enough. The point is not that power-off is always wrong. It is that it must be a **deliberate decision** with the cost understood, not a reflex.

## Volatility is not only about power

The classic list is built around a physical host, and it misses a second kind of volatility that dominates modern investigations: **retention windows**.

Proxy logs, NetFlow, cloud audit logs, and mailbox audit data all expire on a schedule — sometimes days, sometimes months, and almost never on the timeline an investigation would prefer. A log that will be deleted next Tuesday is every bit as volatile as RAM, just on a different clock. [The exfiltration playbook](#/lesson/l8-07-playbook-data-exfiltration) treats short-retention egress logs as a first-hour collection item for exactly this reason.

The generalized principle: **collect first whatever will exist for the shortest time**, regardless of whether the mechanism is power loss or a retention policy.

## Applied to a live response

1. Capture memory before anything else runs on the host.
2. Capture volatile state — connections, processes, sessions.
3. Run a triage collection (KAPE or equivalent) for key artifacts.
4. Pull short-retention logs from wherever they live — proxy, cloud, network.
5. Take a full disk image if the case warrants it.

Steps 1 and 4 are the ones most often skipped, and they are the two that cannot be repeated later.

## Red flags in your own process

- **A host powered off before memory capture** with no documented justification.
- **A triage collection run before memory acquisition** — the collection tool itself modifies the memory you were about to capture.
- **Short-retention log sources identified during scoping rather than in the first hour**, by which point they may be gone.
- **No record of collection order**, which makes it impossible to explain later why something is missing.

## Sources

- [RFC 3227 — Guidelines for Evidence Collection and Archiving](https://www.rfc-editor.org/rfc/rfc3227)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
