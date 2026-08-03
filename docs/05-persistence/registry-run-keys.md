---
tags:
  - Persistence
  - Endpoint
  - T1547
  - T1547.001
---

# Persistence: Registry Run / RunOnce Keys

**ATT&CK:** [T1547.001](https://attack.mitre.org/techniques/T1547/001/) — Boot or Logon Autostart Execution: Registry Run Keys / Startup Folder

## The mechanism

Anything listed under a Run key executes automatically at logon. It's the oldest, simplest, and still most commonly abused persistence mechanism on Windows — high noise tolerance for an attacker, since these keys are legitimately busy on most machines.

| Key | Scope | Runs |
|---|---|---|
| `HKLM\Software\Microsoft\Windows\CurrentVersion\Run` | All users | Every logon |
| `HKCU\Software\Microsoft\Windows\CurrentVersion\Run` | Current user | Every logon for that user |
| `...\RunOnce` (both hives) | As above | Once, then the value is deleted automatically |

## Where the evidence lives

The registry values themselves (compare against a known-good baseline — most entries are legitimate software), plus Sysmon Event ID 13 (`RegistryEvent (Value Set)`) if Sysmon is deployed and configured to watch these specific keys.

## Detection approach

Baseline what's normally present per machine image/role, then alert on any new value under these four keys. Pay particular attention to values pointing at scripts (`.vbs`, `.js`, `.ps1`) or using `rundll32.exe`/`regsvr32.exe` to launch something indirectly — legitimate installers use these keys too, but rarely to launch a script interpreter.

!!! danger "Red flag"
    A new Run-key value referencing a script interpreter, an encoded PowerShell command, or an executable in a temp/user-writable path.

## Cleanup

Remove the value, then confirm nothing re-adds it on next logon — a Run key is often a *symptom* left behind by a scheduled task or WMI subscription that's the actual root persistence, not the whole story by itself.

!!! tip "Practice this"
    [Registry Persistence Triage](../practice-drills/registry-persistence-drill.md) puts six Run key values in front of you, five legitimate and one planted — find it before revealing the answer.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 5: Persistence Catalog](index.md)
- [Practice Drills](../practice-drills/index.md)
- [Drill: Registry Persistence Triage](../practice-drills/registry-persistence-drill.md)

<!-- BACKLINKS:END -->

## Sources

- [MITRE ATT&CK — T1547.001](https://attack.mitre.org/techniques/T1547/001/)
- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — persistence hunting)
