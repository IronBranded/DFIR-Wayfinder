---
tags:
  - Persistence
  - Endpoint
  - T1546
  - T1546.015
  - T1574
  - T1574.001
---

# Persistence: COM Hijacking & DLL Search-Order Hijacking

Two different mechanisms, grouped here because both exploit the same underlying weakness: Windows trusting a lookup (a registry pointer, or a search path) without verifying what it resolves to actually belongs to the legitimate vendor.

## COM Hijacking

**ATT&CK:** [T1546.015](https://attack.mitre.org/techniques/T1546/015/)

Every registered COM object has a `CLSID` entry pointing to the DLL or EXE that implements it. Overwrite that pointer — usually in `HKCU\Software\Classes\CLSID\{GUID}\InprocServer32`, which a standard user can write to without any elevation — and any application that instantiates that COM object runs the attacker's code instead of the legitimate one, often completely silently.

- **Where the evidence lives:** the `InprocServer32` default value under the hijacked CLSID — compare against the legitimate value registered under `HKLM` for the same CLSID, which normal software doesn't override at the per-user level.
- **Red flag:** an `HKCU`-scoped `CLSID` override that shadows a legitimate `HKLM` COM registration, pointing at a DLL outside the normal `System32`/`Program Files` locations.

## DLL Search-Order Hijacking

**ATT&CK:** [T1574.001](https://attack.mitre.org/techniques/T1574/001/)

When an application loads a DLL by name rather than full path, Windows searches a defined order of locations. Drop a malicious DLL with the exact same name as a legitimate one into a directory that's searched *before* the real DLL's location — often simply the application's own working directory — and the application loads the attacker's version instead, typically without any error or warning.

- **Where the evidence lives:** a DLL in an application's working directory that duplicates the name of a DLL normally loaded from `System32`, especially if its digital signature is missing or doesn't match the legitimate vendor. Sysmon Event ID 7 (`ImageLoad`) shows the actual load path when configured to log it.
- **Red flag:** an unsigned or mismatched-signature DLL loaded from a non-standard path, with a filename matching a well-known system DLL.

!!! danger "Red flag (both mechanisms)"
    Code executing under the identity of a trusted application without that application's binary itself having changed — check what it *loaded*, not just what launched it.

## Cleanup

Remove the hijacked `CLSID` override or the planted DLL, and verify the legitimate `HKLM` COM registration or system DLL is intact and unmodified before considering the host clean.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 5: Persistence Catalog](index.md)

<!-- BACKLINKS:END -->

## Sources

- [MITRE ATT&CK — T1546.015](https://attack.mitre.org/techniques/T1546/015/) / [T1574.001](https://attack.mitre.org/techniques/T1574/001/)
- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — persistence and defense-evasion hunting)
