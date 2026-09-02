Most modern intrusions never write an executable to disk at all — the payload runs as a block of PowerShell text, interpreted in memory, and gone the moment the process exits. That's what "fileless" actually means in practice, and it's exactly why logging, not static file scanning, is the primary way this activity gets caught. Three separate log sources capture three different slices of what ran, and knowing which one you actually have — and which one you're missing — is the first skill this level builds on.

> [!PLAIN]
> "Fileless" doesn't mean nothing is ever written anywhere — it means the *malicious logic itself* never exists as a standalone file an antivirus product can scan before it runs. The code arrives as text (in a command line, a script block, a registry value, a scheduled task action) and PowerShell's own interpreter turns it into running code directly.

## The three sources, and what each one actually captures

**Module Logging (Event ID 4103)** records pipeline execution details for each PowerShell module invoked — which cmdlets ran and the parameters bound to them, logged to the `Microsoft-Windows-PowerShell/Operational` channel. It's useful for a "what commands ran" summary, but it doesn't reliably capture full script text, especially for dynamically-built commands.

**Script Block Logging (Event ID 4104, with 4105/4106 marking the start and stop of a script block's invocation)** records the actual code PowerShell's parser evaluated — the full text of every script block, function, and dynamically-generated command, written to the same `Microsoft-Windows-PowerShell/Operational` channel. This is the source that matters most, for a reason covered below.

**Transcription** writes a full, human-readable session transcript to a text file on disk — every command typed and every result returned, with timestamps — either started manually (`Start-Transcript`) or enforced system-wide via policy. Unlike the first two, this isn't an event log at all; it's a flat file, which means it collects and ages differently and needs its own retention/forwarding plan.

| Source | Event ID(s) | Captures | Where it lives |
|---|---|---|---|
| Module Logging | 4103 | Cmdlets run and bound parameters | `Microsoft-Windows-PowerShell/Operational` |
| Script Block Logging | 4104 (4105/4106 start/stop) | Full script text, post-parse | `Microsoft-Windows-PowerShell/Operational` |
| Transcription | — (file, not an event) | Full session transcript | A configured file path on disk |

## The console history nobody remembers to check

**PSReadLine** — the module behind PowerShell's modern tab-completion and command history — writes every interactively-typed command to a plain text file, `ConsoleHost_history.txt`, under `%APPDATA%\Microsoft\Windows\PowerShell\PSReadLine\`, per user, persisting across sessions and reboots by default. It requires no logging policy at all to exist, which makes it one of the highest-value, most consistently-overlooked artifacts in this entire level: if an attacker typed commands interactively rather than running a script, this file has them, verbatim, even if every other log source above was off.

## Why Script Block Logging is the one that matters most

Here's the detail that makes 4104 worth prioritizing above the other two: it logs the script *after* PowerShell's own parser has fully evaluated and reconstructed it — meaning Base64 encoding, string concatenation, and most other obfuscation techniques covered in the next lesson are already unwound by the time the event is written. An attacker who obfuscates a command to defeat a human reading the raw command line, or a naive string-matching detection rule, still hands you the readable version for free the moment Script Block Logging is enabled.

## Turning it on

None of the above is enabled by default on an unhardened system. All three are controlled under Group Policy at **Computer Configuration → Administrative Templates → Windows Components → Windows PowerShell** — "Turn on Module Logging," "Turn on PowerShell Script Block Logging," and "Turn on PowerShell Transcription" respectively — or the equivalent Intune configuration profile settings in a cloud-managed fleet.

> [!IMPORTANT]
> This can't be enabled retroactively. If Script Block Logging wasn't turned on before an intrusion started, that evidence simply doesn't exist for the period before someone turned it on — which makes confirming logging is enabled, fleet-wide, part of preparation rather than something to discover mid-incident.

## Normal baseline

Module Logging and Script Block Logging are enabled fleet-wide through Group Policy or Intune, not host-by-host, and forwarded to central collection rather than left on local disk — the same principle as [Sysmon deployment](#/lesson/l1-12-sysmon-deployment). Volume is genuinely high: PowerShell runs constantly for legitimate administration, scheduled automation, and management-tool activity, so a healthy baseline has a *lot* of 4104 events, not a handful. That volume is why knowing which scripts, paths, and signing certificates are expected in your environment matters more than treating every script block as worth reading individually.

## Red flags

- **Script Block Logging (4104) not enabled anywhere in the environment.** This is worth flagging as a finding in its own right, separate from any specific intrusion — it's a permanent blind spot until fixed.
- **`powershell -version 2` invoked explicitly**, especially on a host where the legacy PowerShell 2.0 engine shouldn't normally be exercised — see the evasion lesson for why this specifically matters.
- **`ConsoleHost_history.txt` missing, unusually short, or with a gap in its timestamps** where GPO would otherwise guarantee its presence — deleting or avoiding this file is itself a deliberate evasion step.
- **A 4103 module-logging event with no corresponding 4104 script-block event for the same activity window** — logging enabled at one layer but effectively blind at the other, on the same host, at the same time.

> [!WARNING]
> Don't assume a quiet PowerShell log means a quiet host. It may just mean the logging was never turned on — check that the policy is actually applied before drawing any conclusion from an empty result.

## How to collect it

Live, on a running host: `Get-WinEvent -LogName "Microsoft-Windows-PowerShell/Operational"`, filtered to Event ID 4104 for script content. Offline, against an exported or triaged `.evtx`, the same channel parses the same way with any standard event log viewer or KAPE-collected artifact set. PSReadLine's history file is a plain text file — no special parser required, just `%APPDATA%\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt` per user profile. Transcription output paths are whatever the enforcing policy configured; check the Group Policy or Intune setting itself to find where a given environment writes them.

## ATT&CK mapping

This lesson is evidence-source content supporting detection of [PowerShell (T1059.001)](https://attack.mitre.org/techniques/T1059/001/) broadly. Deliberate tampering with the logging itself — disabling it, clearing `ConsoleHost_history.txt`, or the version-downgrade pattern above — maps to [Impair Defenses: Disable Windows Event Logging (T1562.002)](https://attack.mitre.org/techniques/T1562/002/).

> [!TIP]
> This lesson tells you where the evidence lives. The [next lesson](#/lesson/l3-14-powershell-obfuscation) covers what to do with it once you have it — reading a 4104 script block that's still obfuscated even after PowerShell's own parser has touched it.

## Sources

- [Microsoft Learn — about Logging Windows](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_logging_windows)
- [Microsoft Learn — PSReadLine](https://learn.microsoft.com/en-us/powershell/module/psreadline/)
- [SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics](https://www.sans.org/cyber-security-courses/advanced-incident-response-threat-hunting-training/)
