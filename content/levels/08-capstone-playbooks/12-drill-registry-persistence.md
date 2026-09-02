**Scenario.** A registry export from a host suspected of compromise. Fifteen minutes. Find the persistence.

## The data

```
[HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run]
"SecurityHealth"="%windir%\\system32\\SecurityHealthSystray.exe"
"RTHDVCPL"="C:\\Program Files\\Realtek\\Audio\\HDA\\RtkNGUI64.exe -s"
"OneDrive"="C:\\Users\\jsmith\\AppData\\Local\\Microsoft\\OneDrive\\OneDrive.exe /background"

[HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run]
"Updater"="rundll32.exe C:\\Users\\jsmith\\AppData\\Roaming\\adobe\\upd.dll,Start"
     Key LastWriteTime: 2026-08-27 09:16:44

[HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon]
"Shell"="explorer.exe"
"Userinit"="C:\\Windows\\system32\\userinit.exe,C:\\Windows\\Temp\\svc.exe"

[HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\sethc.exe]
"Debugger"="C:\\Windows\\system32\\cmd.exe"

[HKLM\SYSTEM\CurrentControlSet\Services\WinDefendUpdate]
"ImagePath"="C:\\Users\\Public\\wdupd.exe"
"Start"=dword:00000002
"Type"=dword:00000010
```

## Work through it

**The `HKLM\...\Run` block is clean.** Defender's systray, Realtek audio, OneDrive from a per-user install path. All expected — this is the [baseline](#/lesson/l3-05-registry-run-keys) the rest is measured against.

**Finding 1 — the `HKCU` Run value.** `rundll32.exe` loading a DLL from `%APPDATA%\adobe\`. Three problems: an interpreter as the executable, a user-writable path, and a folder imitating a vendor name. The **key `LastWriteTime` dates the installation** — 09:16:44, which correlates directly with the other drills' timeline.

**Finding 2 — `Userinit`.** Correct value is exactly `C:\Windows\system32\userinit.exe,` — trailing comma, nothing after it. Here a second path is appended. [Winlogon runs every comma-separated entry at every logon](#/lesson/l3-13-winlogon-helper), so `C:\Windows\Temp\svc.exe` executes at each sign-in. Note `Shell` is untouched — checking only `Shell` would miss this entirely.

**Finding 3 — the IFEO `Debugger` on `sethc.exe`.** This is the [accessibility backdoor](#/lesson/l3-10-appinit-ifeo). Pressing Shift five times **at the lock screen, before authenticating**, opens a SYSTEM command prompt. On an RDP-reachable host this is a standing remote backdoor requiring no credentials at all.

**Finding 4 — the service.** `WinDefendUpdate` imitating a Defender component, `ImagePath` in `C:\Users\Public`, `Start`=2 (automatic). Note `Type`=0x10 (16) — an own-process service, not a driver, so this is [ordinary service persistence](#/lesson/l3-07-windows-services) rather than [BYOVD](#/lesson/l2-13-byovd-loldrivers).

## Four mechanisms, one host

> [!IMPORTANT]
> Redundant persistence is the norm in real intrusions, not the exception. Removing one and declaring the host clean is how reinfection happens. Each of these four survives independently — and the IFEO backdoor survives even a full credential reset, because it needs no credentials.

Correlate every `LastWriteTime` against the incident window, then check for [scheduled tasks](#/lesson/l3-06-scheduled-tasks) and [WMI subscriptions](#/lesson/l3-08-wmi-subscriptions), neither of which appears in a registry export.
