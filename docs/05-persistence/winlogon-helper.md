---
tags:
  - Persistence
  - Endpoint
  - T1547
  - T1547.004
---

# Persistence: Winlogon Shell / Userinit Modification

**ATT&CK:** [T1547.004](https://attack.mitre.org/techniques/T1547/004/) — Boot or Logon Autostart Execution: Winlogon Helper DLL

## The mechanism

`winlogon.exe` reads a small number of registry values to know what to launch as a session starts. Two are the classic abuse targets:

- **`Shell`** — normally just `explorer.exe`. Anything appended here (Windows accepts a comma-separated list) launches alongside the user's actual shell.
- **`Userinit`** — normally `C:\Windows\system32\userinit.exe,` (note the trailing comma — normal). `userinit.exe` runs logon scripts and then launches whatever `Shell` points to; appending an additional path here runs it before the shell even starts.

Both live at `HKLM\Software\Microsoft\Windows NT\CurrentVersion\Winlogon`.

## Where the evidence lives

The registry values themselves — this is a small, stable baseline (essentially two known-good strings), which makes any deviation trivial to spot once you're actually checking. Sysmon Event ID 13 (`RegistryEvent (Value Set)`) if configured to watch this specific key.

## Detection approach

Check `Shell` and `Userinit` against their known-good values on every host in scope — there's no legitimate reason for most environments to see variation here at all. Anything beyond `explorer.exe` in `Shell`, or anything beyond the standard `userinit.exe` path (with its trailing comma) in `Userinit`, warrants investigation.

!!! success "Baseline"
    `Shell` = `explorer.exe`. `Userinit` = `C:\Windows\system32\userinit.exe,` — trailing comma included.

!!! danger "Red flag"
    Any additional executable path appended to either value.

## Cleanup

Restore both values to their standard defaults exactly — a typo or extra character left behind during remediation can itself break normal logon for every user on the host, so verify the restored value character-for-character rather than assuming it's back to normal.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 5: Persistence Catalog](index.md)

<!-- BACKLINKS:END -->

## Sources

- [MITRE ATT&CK — T1547.004](https://attack.mitre.org/techniques/T1547/004/)
- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — persistence hunting)
