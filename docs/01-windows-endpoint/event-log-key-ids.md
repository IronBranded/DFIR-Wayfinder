---
tags:
  - Windows Endpoint
---

# Event Log Key IDs Reference

Windows generates enormous log volume; almost none of it matters most of the time. This page is the short list worth knowing by number, organized by what question each ID answers. Native Security/System log auditing requires the right audit policy (or GPO) to be enabled — several of these are silent by default. Sysmon requires deliberate installation and configuration but, once present, is usually richer than the native equivalent.

## Logon activity (Security log)

| Event ID | Meaning | Why it matters |
|---|---|---|
| 4624 | Successful logon | Baseline for all access; check the Logon Type field (2=interactive, 3=network, 10=RDP, etc.) |
| 4625 | Failed logon | Volume/pattern matters more than any single event — spikes indicate spraying/brute force |
| 4648 | Logon using explicit credentials | Classic `runas` signature; also appears in lateral movement with alternate creds |
| 4672 | Special privileges assigned to new logon | Fires alongside 4624 when an admin-equivalent account logs on |
| 4634 / 4647 | Logoff | Useful for bounding a session's actual duration |

## Process activity

| Event ID | Source | Meaning |
|---|---|---|
| 4688 | Security | Process creation — needs "Audit Process Creation" enabled, and a separate setting to capture the full command line |
| Sysmon 1 | Sysmon | Process creation with hash, full command line, and parent process by default — richer than 4688 out of the box |
| Sysmon 5 | Sysmon | Process terminated |
| Sysmon 8 | Sysmon | `CreateRemoteThread` — a strong injection indicator worth alerting on directly |
| Sysmon 10 | Sysmon | `ProcessAccess` — critical for catching unusual handles opened to `lsass.exe` |

## Persistence & account changes (Security log)

| Event ID | Meaning |
|---|---|
| 4697 | A service was installed on the system |
| 7045 (System log) | New service installed — logged in the **System** log, so it's often available even without Security-log Object Access auditing turned on |
| 4698 | Scheduled task created |
| 4720 | User account created |
| 4738 | User account changed |
| 4732 / 4728 / 4756 | Member added to a local / global / universal security group |
| 4719 | System audit policy changed — an attacker disabling logging shows up here |

## Log tampering (treat as a top-priority alert)

| Event ID | Meaning |
|---|---|
| 1102 | The Security log was cleared |
| 104 (System log) | The System log was cleared |

An attacker clearing logs is one of the loudest possible signals precisely because it's rare for anything legitimate to do it. Both of these deserve automatic, immediate alerting rather than routine review.

## Filesystem & network (Sysmon)

| Event ID | Meaning |
|---|---|
| Sysmon 3 | Network connection |
| Sysmon 7 | Image/DLL loaded |
| Sysmon 11 | File created |
| Sysmon 13 | Registry value set |
| Sysmon 22 | DNS query |

!!! tip "Native logs vs. Sysmon"
    Native Windows event logs are always present but often need specific audit policy configured to be useful (particularly 4688's command-line field). Sysmon requires deliberate deployment but generally logs more, and more usefully, out of the box — most mature environments run both.

!!! tip "Practice this"
    [Event Log Story](../practice-drills/event-log-drill.md) gives you six raw event IDs, no narration — reconstruct what happened before revealing the answer.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 1: Windows Endpoint Forensics](index.md)
- [Log & Artifact Recovery](../anti-forensics/log-artifact-recovery.md)
- [Glossary](../glossary.md)
- [DNS Analysis](../network-analysis/dns-analysis.md)
- [Practice Drills](../practice-drills/index.md)
- [Drill: PowerShell Decode](../practice-drills/powershell-decode-drill.md)
- [Drill: Prefetch Triage](../practice-drills/prefetch-drill.md)
- [Drill: Registry Persistence Triage](../practice-drills/registry-persistence-drill.md)
- [Windows IR Quick Reference](../quick-reference/windows-ir-poster.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR500 / FOR508 — Windows event log analysis; see also the SANS Windows Logging Cheat Sheet)
- Sysmon documentation (Microsoft Sysinternals)
