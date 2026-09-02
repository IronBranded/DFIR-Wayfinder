Network-layer log sources capture what happened at the wire. This lesson is the memory-side complement: connection state that survives in RAM even after the connection itself has already closed, sometimes recoverable well after a C2 channel has gone quiet.

## Why "closed" doesn't mean "gone"

Windows doesn't necessarily overwrite freed memory the instant it's no longer in use — a closed TCP or UDP connection's kernel structure can persist for some time until that specific memory region happens to get reused for something else. A memory image acquired shortly after a C2 channel closes can still show clear evidence of it, even though nothing about that connection would appear in a live `netstat` run at the moment of acquisition.

## windows.netscan

`windows.netscan` finds TCP and UDP endpoint structures directly in a memory image — local and remote address:port pairs, connection state (`ESTABLISHED`, `CLOSED`, `LISTENING`, and others), and the owning process. Unlike a live enumeration, it isn't limited to connections that are still open at the moment you look.

> [!PLAIN]
> This is the same underlying idea as [DKOM and psscan](#/lesson/l3-03-eprocess-internals) from earlier in this level, applied to network state instead of processes: a structure can stop being "active" in the normal sense while its data is still sitting in memory, recoverable if you know to look for it directly rather than only through the API that's supposed to report current state.

## Correlating with everything else in this level

`netscan`'s owning-process field is what makes this genuinely useful rather than just a list of addresses: a connection recovered from memory, owned by a process that also showed [injection indicators](#/lesson/l3-05-injected-code-detection) or an [LSASS access pattern](#/lesson/l3-09-lsass-memory-analysis) earlier in your triage, is a materially stronger finding than either signal alone. A recovered remote address is also worth checking directly against [Level 7's C2 framework fingerprinting content](#/lesson/l6-04-c2-framework-fingerprinting) — infrastructure recovered from memory is exactly the kind of indicator that lesson's fingerprinting patterns are built to match against.

## Normal baseline

Connections recovered from memory correspond to explainable processes with a legitimate networking role, to destinations consistent with normal application behavior. Nothing here should surprise you if the process-level baseline from earlier in this level already holds.

## Red flags

- **A recovered connection owned by a process with no legitimate reason to make any outbound connection at all.**
- **A remote address or port pattern matching known C2 infrastructure or framework fingerprints.**
- **A connection whose owning process also flagged elsewhere in this level's triage** — injection, an unexplained mutex, or LSASS access — turning several moderate signals into one strong one.

## How to collect it

`vol -f <image> windows.netscan` for the full pass across the image. Cross-reference the `Owner` column directly against `windows.pslist`/`windows.psscan` output from [earlier in this level](#/lesson/l3-02-volatility-process-analysis) rather than reading connections in isolation from the processes that made them.

## ATT&CK mapping

Connects to Command and Control activity broadly (Tactic [TA0011](https://attack.mitre.org/tactics/TA0011/)) — the specific technique depends entirely on what the recovered connection turns out to be, which is exactly why correlating it against process-level findings elsewhere in this level matters more than the network artifact alone.

> [!TIP]
> This is the last individual-technique lesson in the level. [The capstone](#/lesson/l3-17-malware-triage-methodology) puts everything from Acquisition through here into an actual ordered sequence — what to check first, and when to stop doing memory triage and escalate instead.

## Sources

- [Volatility 3 — Windows plugin documentation](https://volatility3.readthedocs.io/en/latest/)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
