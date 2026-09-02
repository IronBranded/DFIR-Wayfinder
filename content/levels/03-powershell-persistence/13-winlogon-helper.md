Two registry values run at every single logon, before the desktop appears and before most endpoint agents have finished initializing. They have short, exact, well-known correct contents — which makes this simultaneously one of the earliest-executing persistence mechanisms and one of the easiest to check.

## The two values

```
HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon
```

**`Userinit`** — correct value is exactly:

```
C:\Windows\system32\userinit.exe,
```

The trailing comma is genuine, not a typo. `Userinit` accepts a **comma-separated list**, and Windows runs every entry in it. An attacker appends a second path after the comma, and their binary runs at every logon alongside the real `userinit.exe`. Nothing breaks, nothing looks obviously wrong, and the original value is still present at the front of the string.

**`Shell`** — correct value is exactly:

```
explorer.exe
```

Same pattern: append a comma and a second path, and it runs at logon. Replacing `explorer.exe` outright is possible but conspicuous, since the desktop would fail to load; appending is the durable version.

Equivalent `HKCU` values exist and take effect for that user only, which makes them reachable without administrative rights.

## Why the timing matters

Winlogon's helpers fire early in the logon sequence — [before some security tooling has fully initialized](#/lesson/l6-18-defender-av-mechanics). Code that runs at this point may execute in a window where behavioural monitoring is not yet fully active, which is the same reasoning behind the "Early Bird" [APC injection](#/lesson/l5-05-injection-techniques) variant covered in Level 5.

## Notify

Older Windows versions supported a `Notify` subkey registering DLLs for logon event callbacks. It was removed after Windows Vista/7 and does not function on modern systems — but its presence on a legacy host, or in an old forensic image, is worth recognizing rather than dismissing as unknown.

> [!TIP]
> This is the artifact where an exact string comparison beats any heuristic. Two known-good values, both short, both memorizable. Anything appended after the comma is the finding — no baselining exercise required.

## Normal baseline

`Userinit` is `C:\Windows\system32\userinit.exe,` and nothing more. `Shell` is `explorer.exe` and nothing more. Some managed environments legitimately customize `Shell` for kiosk configurations — a real exception, but a documented and deliberate one, not something to discover during an investigation.

## Red flags

- **Anything appended after the comma in `Userinit`** — the single check that matters most here.
- **`Shell` set to anything other than `explorer.exe`**, absent a documented kiosk configuration.
- **A path under `%APPDATA%`, `%TEMP%`, or `C:\Users\Public`** in either value.
- **A `HKCU` Winlogon override** where the machine-wide value is untouched — persistence for one user, invisible to a `HKLM`-only check.
- **A `Winlogon` key `LastWriteTime`** falling inside a suspected intrusion window, even if the values currently look correct.

## How to collect it

```
Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon" |
  Select-Object Userinit, Shell
```

Check the `HKCU` equivalent for each user profile as well as `HKLM`. Offline, read `SOFTWARE` and each `NTUSER.DAT` with Registry Explorer. Autoruns covers Winlogon entries in its Logon tab.

## ATT&CK mapping

[Boot or Logon Autostart Execution: Winlogon Helper DLL (T1547.004)](https://attack.mitre.org/techniques/T1547/004/).

> [!TIP]
> This completes the endpoint persistence catalog. The [cloud persistence module](#/lesson/l3-14-oauth-consent-grants) that follows covers the same objective — surviving a reboot, a password reset, or a rebuild — against identity infrastructure rather than a Windows host.

## Sources

- MITRE ATT&CK — T1547.004
- [Microsoft Learn — Winlogon registry entries](https://learn.microsoft.com/en-us/windows-hardware/drivers/install/hklm-software-microsoft-windows-nt-currentversion-winlogon-registry-tree)
