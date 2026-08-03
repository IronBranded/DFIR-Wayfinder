---
tags:
  - Persistence
  - Endpoint
  - T1546
  - T1546.010
  - T1546.012
---

# Persistence: AppInit_DLLs & Image File Execution Options

Two more mechanisms grouped together — both are Windows compatibility features from an earlier, more trusting era of the OS, both are still functional, and both give an attacker code execution tied to legitimate processes rather than a standalone process of their own.

## AppInit_DLLs

**ATT&CK:** [T1546.010](https://attack.mitre.org/techniques/T1546/010/)

Any DLL listed here gets loaded by `user32.dll` into essentially every process that has a GUI — which in practice is most processes on the system.

- **Registry:** `HKLM\Software\Microsoft\Windows NT\CurrentVersion\Windows` (and the `Wow6432Node` equivalent on 64-bit systems)
    - `LoadAppInit_DLLs` must be `1` for the mechanism to be active at all — it's `0` by default
    - `AppInit_DLLs` holds the path(s) to load
    - `RequireSignedAppInit_DLLs` — if `0`, unsigned DLLs are accepted; this is the setting that turns the mechanism from "annoying to abuse" into "trivial to abuse"
- **Important modern caveat:** this mechanism is disabled outright on Windows 8 and later when Secure Boot is enabled, which meaningfully narrows where it's a realistic threat today.
- **Red flag:** `LoadAppInit_DLLs` set to `1` with a populated `AppInit_DLLs` value on a system where nothing legitimately needs this — real-world use of this legitimate feature is rare enough that its mere presence, active, is worth investigating.

## Image File Execution Options (IFEO) Debugger Hijack

**ATT&CK:** [T1546.012](https://attack.mitre.org/techniques/T1546/012/)

IFEO exists so developers can attach a debugger to a specific executable automatically. Set a `Debugger` value for a target executable, and Windows launches *that* debugger instead of the target — with the target's name passed as an argument the "debugger" is free to ignore entirely.

- **Registry:** `HKLM\Software\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\<target.exe>\Debugger`
- **The canonical example:** the "sticky keys backdoor" — setting `Debugger` for `sethc.exe` (the Accessibility shortcut triggered by pressing Shift five times) to `cmd.exe` gives anyone at the physical or RDP login screen a `SYSTEM`-level command prompt, no credentials required, before Windows even logs anyone in. The same pattern works against `utilman.exe` (the Ease of Access button on the login screen).
- **Red flag:** any `Debugger` value under IFEO for an accessibility tool (`sethc.exe`, `utilman.exe`, `osk.exe`, `magnify.exe`, `narrator.exe`) or for a security/monitoring tool an attacker might want to silently disable.

!!! danger "Red flag"
    A `Debugger` value on an accessibility executable, or an active `AppInit_DLLs` configuration with no legitimate business justification.

## Cleanup

Delete the offending registry value(s) entirely — `Debugger`, `AppInit_DLLs`, or reset `LoadAppInit_DLLs` to `0`. For the sticky-keys pattern specifically, verify no other accessibility executable was similarly hijacked; attackers who use one often set up two or three as redundant footholds.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 5: Persistence Catalog](index.md)

<!-- BACKLINKS:END -->

## Sources

- [MITRE ATT&CK — T1546.010](https://attack.mitre.org/techniques/T1546/010/) / [T1546.012](https://attack.mitre.org/techniques/T1546/012/)
- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — persistence hunting)
