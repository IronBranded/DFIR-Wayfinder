---
tags:
  - PowerShell
  - T1059
  - T1059.001
---

# PowerShell Forensics: Malicious Cmdlet Patterns

A reference list of PowerShell patterns worth alerting on directly — not because any single one is inherently malicious (most have legitimate administrative uses), but because their combination, context, or specific usage pattern is a reliable tell. Use this alongside [decoded](obfuscation-decoding.md) command-line and Script Block Logging content, since these patterns are exactly what's typically hiding underneath an obfuscation layer.

## Download-and-execute chains

| Pattern | Why it matters |
|---|---|
| `IEX (New-Object Net.WebClient).DownloadString(...)` | The single most common one-liner in commodity malware and post-exploitation frameworks — download a script as a string and execute it immediately, entirely in memory, with nothing ever written to disk |
| `Invoke-WebRequest` / `iwr` piped into `Invoke-Expression` / `iex` | Functionally identical to the above using more modern cmdlets |
| `Invoke-Expression` (`IEX`) fed by *any* dynamically constructed string | The common thread across nearly every pattern on this page — `IEX` is what turns "downloaded or decoded text" into "running code" |

Destination worth checking against: raw IP addresses rather than domain names, non-standard ports, and paste-bin-style or code-hosting-raw-file URLs are all disproportionately represented in real malicious traffic compared to legitimate administrative scripting.

## In-memory / reflective loading

| Pattern | Why it matters |
|---|---|
| `[System.Reflection.Assembly]::Load(...)` | Loads a .NET assembly directly from a byte array in memory, without ever touching disk — the .NET equivalent of the fileless execution PowerShell itself enables at the script level |
| `[System.Reflection.Assembly]::LoadWithPartialName(...)` | Same intent, an older/alternate API |
| `Add-Type` with inline C# source | Compiles and loads arbitrary code at runtime — legitimate in some administrative tooling, but worth reviewing the actual inline source when it appears |

## Credential and memory access

| Pattern | Why it matters |
|---|---|
| Any script invoking `MiniDumpWriteDump` via P/Invoke, or calling out to `procdump.exe`/`comsvcs.dll` targeting `lsass.exe` | Credential-dumping via LSASS memory access, initiated from PowerShell rather than a standalone tool — cross-reference with [LSA Provider / SSP abuse](../05-persistence/lsa-ssp.md) and the [baseline process tree](../01-windows-endpoint/process-trees.md) expectations for `lsass.exe` |

## Discovery and reconnaissance chains

| Pattern | Why it matters |
|---|---|
| `Get-ADUser`/`Get-ADComputer` with broad, unfiltered queries, especially run from a workstation rather than a management host | Domain enumeration — legitimate on an admin's jump box, unusual from a regular user endpoint |
| `nltest`, `Get-NetTCPConnection`, or similar invoked in quick succession from a single session | Consistent with an attacker's situational-awareness phase immediately after gaining a foothold |

## What ties all of this together

None of these are reliable in isolation — the same cmdlets show up constantly in legitimate IT automation. What matters is context: an unexpected account or host running them, an unusual destination, a cluster of several of these patterns in one session rather than one in isolation, or any of them appearing in a [decoded](obfuscation-decoding.md) script block that was deliberately hidden behind Base64, compression, or character-code obfuscation in the first place. That last one is the strongest signal on this entire page — legitimate administrative scripts have no reason to hide what they're doing from the person running them.

!!! danger "Red flag"
    Any pattern on this page found inside a script block that was obfuscated to reach that point.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 4: PowerShell Forensics](index.md)
- [PowerShell Forensics: Obfuscation & Decoding](obfuscation-decoding.md)
- [PowerShell Forensics: Logging](powershell-logging.md)
- [Drill: PowerShell Decode](../practice-drills/powershell-decode-drill.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 / FOR610 — PowerShell attack tradecraft)
- MITRE ATT&CK — [T1059.001 (PowerShell)](https://attack.mitre.org/techniques/T1059/001/)
