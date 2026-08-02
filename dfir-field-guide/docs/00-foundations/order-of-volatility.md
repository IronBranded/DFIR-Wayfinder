# Order of Volatility

The principle, defined in [RFC 3227](https://www.rfc-editor.org/rfc/rfc3227), is simple: collect evidence starting with what disappears fastest. Get the acquisition order wrong and you can permanently lose the exact data that would have explained the incident.

## The ordering

| Tier | Evidence | Rough lifespan |
|---|---|---|
| 1 (most volatile) | CPU registers, cache | Nanoseconds |
| 2 | Routing table, ARP cache, process table, kernel statistics, RAM | Until reboot or power loss |
| 3 | Temporary file systems, swap/page file | Minutes to hours |
| 4 | Disk (the filesystem itself) | Until overwritten |
| 5 | Remote logging and monitoring data related to the target system | Governed by log retention policy |
| 6 | Physical configuration, network topology | Until changed |
| 7 (least volatile) | Archival media, backups | Years |

## What this actually drives, in this guide

- **Memory before disk, always, on a live compromised host.** A malicious PowerShell payload that only ever existed inside a `powershell.exe` process's memory (see [Module 4](../04-powershell-forensics/index.md)) is gone the moment that process exits or the box reboots — before that happens is the only window to capture it.
- **Don't run extra tools on a host before imaging it, if you can avoid it.** Every process you launch to "check something" allocates memory, evicts cache, and can overwrite the exact volatile evidence you're trying to preserve — forensic tooling itself has a footprint.
- **Log retention windows are a volatility tier, not an afterthought.** A sign-in log aging out of Microsoft Purview at a fixed retention period is functionally the same problem as RAM clearing on reboot — the data disappears on a timer regardless of whether you were ready. See [Module 6](../06-cloud-identity/index.md) for current Entra ID/Purview retention specifics.

!!! success "Baseline habit"
    Before touching a live host, ask: "What's the most volatile evidence I still need, and have I captured it yet?" Then work down the table in order.

## Sources

- RFC 3227, *Guidelines for Evidence Collection and Archiving*
- [SANS FOR508: Advanced Incident Response, Threat Hunting, and Digital Forensics](https://www.sans.org/cyber-security-courses/advanced-incident-response-threat-hunting-training) — live-response methodology
