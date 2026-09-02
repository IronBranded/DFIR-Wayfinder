Clearing the Security event log is one of the loudest things an attacker can do, and one of the least effective. It generates its own record, it leaves the underlying data partially recoverable, and it does nothing at all to the dozen other artifacts that recorded the same activity from a different angle.

## It announces itself

[Event ID 1102](#/lesson/l4-11-event-log-key-ids) is written to the Security log **immediately after** it is cleared — so the first entry in the newly-empty log is a record of the clearing, including the account that did it. `104` does the same for other logs.

An attacker cannot avoid this by clearing again; each clear generates a new 1102. Suppressing it requires stopping the Event Log service or tampering below it, which produces its own detectable gaps.

## What survives: seven places to look

**1. Carved EVTX records from unallocated space.** Clearing a log does not overwrite the disk sectors its records occupied. EVTX records have recognizable structure — chunks begin with an `ElfChnk` signature and individual records with their own magic — which means **individual event records remain carvable** from unallocated space and from slack. `EVTXtract` and `bulk_extractor` are built for this.

**2. The logs they didn't clear.** Attackers overwhelmingly target the Security log. `Application`, `System`, and the Operational channels — `Microsoft-Windows-TaskScheduler/Operational`, `Microsoft-Windows-Bits-Client/Operational`, `Microsoft-Windows-PowerShell/Operational`, `Microsoft-Windows-Windows Defender/Operational` — are frequently untouched, and much of this academy's detection content lives in exactly those channels.

**3. Forwarded events.** Where Windows Event Forwarding is configured, a copy already exists on the collector, beyond the attacker's reach on that host. This is the strongest argument for WEF that exists: it converts log clearing from an evidence-destruction technique into an evidence-*creation* one.

**4. The SIEM.** Same principle. Anything already shipped is already gone from the attacker's control.

**5. Volume Shadow Copies.** A shadow copy predating the clear contains the intact `.evtx` file. See [VSS recovery](#/lesson/l4-13-vss-recovery).

**6. Memory.** Recently-written records may still be in the Event Log service's working set, recoverable from a memory image — another reason [memory acquisition comes first](#/lesson/l3-01-acquisition).

**7. Everything that isn't a log.** This is the largest category and the most often overlooked. Clearing the Security log does nothing to:

- [`$MFT` and `$FN` timestamps](#/lesson/l4-05-mft-timestomping)
- [The USN journal](#/lesson/l4-06-usn-journal)
- [Prefetch](#/lesson/l4-01-prefetch), [Amcache](#/lesson/l4-02-amcache), [ShimCache](#/lesson/l4-03-shimcache)
- [Registry key `LastWriteTime` values](#/lesson/l4-08-registry-hives)
- [ShellBags](#/lesson/l4-09-shellbags) and [UserAssist](#/lesson/l4-04-userassist)
- [AD replication metadata](#/lesson/l7-03-replication-metadata)

> [!IMPORTANT]
> The strategic point worth carrying: **log clearing is an anti-forensic action that generates evidence rather than removing it**. It is loud, incomplete, and leaves the entire non-log artifact set intact. An attacker who clears logs has told you when they were there and that they cared about being seen.

## Normal baseline

Logs are not cleared as routine administration. Where log rotation or archival is a scheduled operation, it is documented and does not produce 1102. Forwarding to a collector is configured fleet-wide.

## Red flags

- **1102 or 104 with no corresponding change record.**
- **A log whose earliest entry is suspiciously recent** relative to the system's uptime and install date.
- **A gap in a log that was not cleared**, which suggests targeted deletion or service tampering rather than a full clear.
- **The Event Log service stopped or restarted** outside patching, which is the quieter alternative to clearing.

## How to collect it

Recover with `EVTXtract` or `bulk_extractor` against unallocated space from a disk image; **EvtxECmd** parses both intact files and recovered fragments into normalized output. Pull the same window from the SIEM or WEF collector first, since that is faster and more complete than carving. Enumerate shadow copies for pre-clear `.evtx` files. Then reconstruct from the non-log artifacts above — frequently that alone answers the question.

## ATT&CK mapping

[Indicator Removal: Clear Windows Event Logs (T1070.001)](https://attack.mitre.org/techniques/T1070/001/).

## Sources

- MITRE ATT&CK — T1070.001
- [Eric Zimmerman's tools — EvtxECmd](https://ericzimmerman.github.io/)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
