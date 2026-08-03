---
tags:
  - Persistence
  - Endpoint
  - T1547
  - T1547.005
---

# Persistence: LSA Provider / Security Support Provider Abuse

**ATT&CK:** [T1547.005](https://attack.mitre.org/techniques/T1547/005/) — Boot or Logon Autostart Execution: Security Support Provider

## The mechanism

Security Support Providers (SSPs) are DLLs loaded directly into `lsass.exe` to handle authentication packages (Kerberos, NTLM, and so on). Registering a malicious DLL as an SSP gets it loaded into the single most credential-rich process on the entire host, on every boot, with no additional exploitation needed — this is exactly the technique behind Mimikatz's `misc::memssp` module, which installs a rogue SSP that logs every plaintext credential passed through LSA from that point forward.

- **Registry:** `HKLM\SYSTEM\CurrentControlSet\Control\Lsa\Security Packages` (and the related `Authentication Packages` value)

## Where the evidence lives

The registry value itself — compare the list of loaded packages against a known-good baseline; legitimate SSP lists are short and stable. Because this loads a new DLL into `lsass.exe`, it also shows up as a module load against `lsass.exe` — Sysmon Event ID 7 (`ImageLoad`) if configured to log LSASS specifically, or via [memory analysis](../03-memory-forensics/index.md) (`ldrmodules` in Volatility).

## Detection approach

Any addition to the `Security Packages` value outside of a documented change (a new third-party authentication product being deployed) deserves immediate investigation — this list changes rarely on a healthy host. Given the direct tie to `lsass.exe`, this pairs naturally with the [baseline process tree](../01-windows-endpoint/process-trees.md) discipline: an unexpected DLL loaded into the one process that should always have exactly one instance, with exactly one legitimate parent, is a high-confidence signal.

!!! danger "Red flag"
    Any unrecognized entry in `Security Packages`, or an unexpected DLL load event against `lsass.exe`.

## Cleanup

Remove the malicious entry from `Security Packages`, then reboot — the SSP is loaded at boot, so removing the registry reference alone doesn't unload it from an already-running `lsass.exe`. Treat any host with a confirmed rogue SSP as having had credentials for every account that authenticated since installation potentially exposed.

<!-- BACKLINKS:START -->
## Referenced From

- [PowerShell Forensics: Malicious Cmdlet Patterns](../04-powershell-forensics/powershell-malicious-patterns.md)
- [Module 5: Persistence Catalog](index.md)
- [Glossary](../glossary.md)

<!-- BACKLINKS:END -->

## Sources

- [MITRE ATT&CK — T1547.005](https://attack.mitre.org/techniques/T1547/005/)
- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — credential-theft persistence)
