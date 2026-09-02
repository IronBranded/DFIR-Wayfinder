NTFS lets a single file hold **more than one data stream**. Everything you normally see — Explorer, `dir`, file size, most triage tooling — shows only the default, unnamed one. The others are there, they are readable, they are executable, and by default nothing tells you they exist.

## The syntax

```
filename.txt:streamname:$DATA
```

The default stream is `filename.txt::$DATA`. A named stream attached to it is invisible to ordinary listing, and — the detail that matters most — **its size does not count toward the file size Explorer reports**. A 2 KB text file can carry a 5 MB executable in a named stream and still show as 2 KB.

## The legitimate one you already have: Zone.Identifier

Every file downloaded through a browser or extracted from a marked archive carries a `Zone.Identifier` stream — the **Mark of the Web**. Its contents look like:

```
[ZoneTransfer]
ZoneId=3
ReferrerUrl=https://...
HostUrl=https://...
```

`ZoneId=3` means Internet. Newer Windows versions also record `HostUrl` and `ReferrerUrl`, which means this stream frequently **proves where a file came from** — a genuinely valuable artifact, and one that survives the file being renamed or moved.

## Why MOTW matters defensively

Office refuses to enable macros in files marked with MOTW. That single control drove a real shift in attacker delivery: **container formats** — ISO, VHD, and (until Microsoft changed the behaviour) some archive handling — historically did not propagate MOTW to the files they contained. Delivering a malicious document inside an ISO stripped the mark and restored macro execution.

> [!TIP]
> A `Zone.Identifier` stream is evidence *for* the investigator, and its **absence** on a file that clearly came from outside is itself informative — it suggests a delivery path that stripped the mark, which narrows how the file arrived.

## The abuse

Hiding payloads. An executable, script, or archive written into a named stream on an innocuous host file — including on a **directory**, which can also carry streams. Execution paths vary by Windows version, but reading content back out via `Get-Content -Stream` and executing it in memory sidesteps the file-on-disk model that most scanning assumes.

## Detection

| Method | Notes |
|---|---|
| `dir /R` | Built in, shows all streams. Nothing else in `dir` does. |
| `Get-Item -Path <file> -Stream *` | PowerShell, scriptable across a tree |
| **Sysmon Event ID 15** | **FileCreateStreamHash — logs ADS creation with a hash** |
| `streams.exe` | Sysinternals, recursive |

Sysmon Event ID 15 is the proactive one: it fires when a stream is created, records the hash, and turns an artifact you have to go looking for into an event that arrives on its own.

## Normal baseline

`Zone.Identifier` streams on downloaded files, and very little else. A small number of applications use named streams legitimately, but they are few enough to enumerate and whitelist by name.

## Red flags

- **A named stream other than `Zone.Identifier`** on a user-profile or temp-directory file.
- **A stream containing an `MZ` header** — a PE file hiding in a stream.
- **A stream on a directory**, which has no ordinary use.
- **A stream whose size is disproportionate to its host file.**
- **Sysmon Event ID 15 for a stream created by a scripting interpreter.**
- **A file with no `Zone.Identifier`** that evidence says arrived from outside — a MOTW-stripping delivery path.

## How to collect it

`dir /R` on directories of interest, or `Get-ChildItem -Recurse | Get-Item -Stream *` for a scripted sweep. Enable Sysmon Event ID 15 for ongoing coverage. In offline analysis, forensic suites expose streams as separate objects — but confirm your tooling does so rather than assuming, because plenty of general-purpose file tooling silently ignores them.

## ATT&CK mapping

[Hide Artifacts: NTFS File Attributes (T1564.004)](https://attack.mitre.org/techniques/T1564/004/), with MOTW bypass relating to [Subvert Trust Controls: Mark-of-the-Web Bypass (T1553.005)](https://attack.mitre.org/techniques/T1553/005/).

## Sources

- MITRE ATT&CK — T1564.004, T1553.005
- [Microsoft Learn — File Streams](https://learn.microsoft.com/en-us/windows/win32/fileio/file-streams)
