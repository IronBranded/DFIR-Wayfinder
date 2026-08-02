# Module 1: Windows Endpoint Forensics

Applies uniformly across workstations, laptops, servers, and VMs — anywhere Windows runs, on-prem or in the cloud. Domain Controller-specific artifacts (NTDS.dit, SYSVOL, replication metadata) live in [Module 2](../02-active-directory/index.md) instead, since they don't exist on a normal member server.

## What's here

This module is organized by evidence category. Every page follows the same template: **what it is → normal baseline → red flags → how to collect it → ATT&CK mapping.**

| Category | Covers |
|---|---|
| Filesystem artifacts | MFT, USN Journal, Prefetch, Amcache, Shimcache/AppCompatCache, SRUM, LNK files & Jump Lists, Volume Shadow Copies |
| Registry artifacts | SAM/SYSTEM/SOFTWARE hives, NTUSER.DAT, UsrClass.dat, ShellBags, UserAssist, BAM/DAM |
| Event logs | Security, System, Application, Sysmon, and the specific Event IDs worth alerting on |
| Process trees | What normal parent/child relationships look like for core Windows processes, and the specific deviations that indicate process spoofing or injection |

## Building now

- [x] Artifact: [Prefetch](prefetch.md)
- [ ] Artifact: MFT & USN Journal
- [ ] Artifact: Amcache & Shimcache
- [ ] Artifact: Registry Run Keys & Persistence Hives
- [ ] Artifact: ShellBags & UserAssist
- [ ] Event Log key IDs reference
- [ ] Baseline Process Trees (`svchost.exe`, `lsass.exe`, `explorer.exe` parentage)

!!! tip "Where to start"
    If you're new, read [Prefetch](prefetch.md) first — it's the template every artifact page in this guide follows — then move to Registry and Event Logs once they're built out.
