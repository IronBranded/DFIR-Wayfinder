The last three lessons covered where the evidence lives, how to read it once obfuscated, and how to recognize an attempt to evade logging entirely. This one is the pattern-matching reference — specific cmdlets and argument combinations that show up in real intrusions often enough to be worth recognizing on sight, the same treatment [Level 2 gives to LOLBins](#/lesson/l5-14-lolbins), but for PowerShell's own cmdlets.

## Download cradles

The classic fileless delivery pattern fetches a payload and executes it in the same breath, without ever writing it to disk: `IEX (New-Object Net.WebClient).DownloadString(...)`, or the more modern `Invoke-WebRequest`/`iwr` piped into `Invoke-Expression`/`iex`. `IEX` alone is worth treating as a keyword of interest — it's PowerShell's expression-evaluation cmdlet, and pairing it with anything that fetches remote content is close to definitionally a download-and-run-in-memory chain.

## Reflective and in-memory execution

`[System.Reflection.Assembly]::Load()` (loading a .NET assembly directly from a byte array in memory, rather than `LoadFrom()` reading a file from disk) is the general shape behind most "in-memory" PowerShell tooling — a payload fetched as bytes, loaded as an assembly, and invoked, with nothing ever written to the filesystem for a scanner to catch.

## Defender-tampering cmdlets

A cluster worth knowing by name, since it's one of the highest-signal patterns in this whole lesson: `Set-MpPreference -DisableRealtimeMonitoring $true`, and `Add-MpPreference -ExclusionPath`/`-ExclusionProcess`. These are legitimate, documented cmdlets for managing Microsoft Defender — which is exactly what makes them effective when abused: an attacker (or their dropper) clearing a path or disabling real-time scanning immediately before staging the actual payload. See Level 6 for the Defender-side event IDs these calls generate.

## Hidden-execution flag clusters

`-WindowStyle Hidden`, `-NoProfile`, `-NonInteractive`, and `-NoLogo` are all individually unremarkable — legitimate unattended automation (SCCM, Intune, scheduled maintenance scripts) uses several of them routinely. Seeing them clustered together, especially `-WindowStyle Hidden` specifically, on a process whose parent wasn't itself an automation/deployment tool, is the actual signal — the combination and the context, not any single flag.

## Execution without `powershell.exe`

The most advanced pattern here, and the one that best explains why Level 3 opened with logging rather than process monitoring: PowerShell's automation engine is a .NET library (`System.Management.Automation`), not something that requires `powershell.exe` or `pwsh.exe` specifically to run. Code hosted inside a completely different process — one that embeds the PowerShell engine directly via .NET — can execute full PowerShell functionality without a `powershell.exe` process ever appearing in a process tree at all. Process-creation monitoring alone misses this entirely; engine-level logging (Script Block Logging, from the first lesson in this level) does not, because it operates wherever the engine runs, regardless of which process hosts it.

> [!WARNING]
> "No `powershell.exe` in the process tree" is not the same as "no PowerShell ran." This is the single best argument in this entire level for why Script Block Logging matters more than process-creation monitoring alone.

## Normal baseline

Every cmdlet named above has routine, legitimate uses — `Invoke-WebRequest` is a completely ordinary way to pull an update file, and `-NoProfile -NonInteractive` is close to a best practice for unattended scripts specifically because it avoids loading a user's custom profile in an automation context. None of these are reliable signals in isolation. What's abnormal is the combination, the parent process, the account, and the destination — a familiar theme across this entire academy.

## Red flags

- **`IEX` combined with `DownloadString`/`DownloadFile`/`Invoke-WebRequest`** in the same pipeline — the download-cradle shape.
- **`Add-MpPreference`/`Set-MpPreference` tampering calls from anything other than a known, documented endpoint-management tool.**
- **`-WindowStyle Hidden` on a process spawned by Office, a browser, or another non-administrative parent**, rather than a user-initiated terminal or a recognized deployment tool.
- **Reflective assembly loading immediately following a download cradle in the same script block** — the fileless chain end to end, from fetch to execution, with nothing written to disk at any point.

## How to collect it

The [Script Block Logging event (4104)](#/lesson/l3-13-powershell-logging) is the ground truth for the full pipeline text, including cases where no `powershell.exe` process exists to generate a 4688/Sysmon Event ID 1 in the first place. Sysmon Event ID 3 (network connection) confirms whether a download cradle actually reached its destination. For the Defender-tampering cluster specifically, the tampering itself generates its own events in `Microsoft-Windows-Windows Defender/Operational` — covered in Level 6.

## ATT&CK mapping

[PowerShell (T1059.001)](https://attack.mitre.org/techniques/T1059/001/) as the execution technique throughout; [Ingress Tool Transfer (T1105)](https://attack.mitre.org/techniques/T1105/) for the download-cradle pattern specifically; [Impair Defenses: Disable or Modify Tools (T1562.001)](https://attack.mitre.org/techniques/T1562/001/) for the Defender-tampering cluster.

> [!TIP]
> This closes out PowerShell Forensics as a set. The [Endpoint Persistence](#/lesson/l5-01-registry-run-keys) module that follows covers what an attacker who's successfully executed code does next to make sure a reboot doesn't undo their work.

## Sources

- [Microsoft Learn — Set-MpPreference](https://learn.microsoft.com/en-us/powershell/module/defender/set-mppreference)
- [Microsoft Learn — Add-MpPreference](https://learn.microsoft.com/en-us/powershell/module/defender/add-mppreference)
- [MITRE ATT&CK — T1059.001: PowerShell](https://attack.mitre.org/techniques/T1059/001/)
