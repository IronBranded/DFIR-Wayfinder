---
tags:
  - Windows Endpoint
---

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

## Module status: complete

- [x] Artifact: [Prefetch](prefetch.md)
- [x] Artifact: [$MFT & Timestomping](mft.md)
- [x] Artifact: [USN Journal](usn-journal.md)
- [x] Artifact: [Amcache](amcache.md)
- [x] Artifact: [Shimcache](shimcache.md)
- [x] Artifact: [Registry Hives](registry-hives.md) — Run-key persistence specifically lives in the [Persistence Catalog](../05-persistence/index.md), not here
- [x] Artifact: [ShellBags](shellbags.md)
- [x] Artifact: [UserAssist](userassist.md)
- [x] [Event Log Key IDs Reference](event-log-key-ids.md)
- [x] [Baseline Process Trees](process-trees.md)

!!! tip "Where to start"
    New to this guide? Read [Prefetch](prefetch.md) first — it's the template every artifact page here follows. Then [Baseline Process Trees](process-trees.md) is arguably the single highest-value page in this module: most investigations start with "is this process tree normal?"

<!-- BACKLINKS:START -->
## Referenced From

- [Module 2: Active Directory & Domain Controllers](../02-active-directory/index.md)
- [Module 4: PowerShell Forensics](../04-powershell-forensics/index.md)
- [Enterprise DFIR Field Guide](../index.md)

<!-- BACKLINKS:END -->

