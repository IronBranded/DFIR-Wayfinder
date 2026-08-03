---
tags:
  - Practice Drill
---

# Drill: Registry Persistence Triage

## The scenario

`HKCU\Software\Microsoft\Windows\CurrentVersion\Run` exported from a user's profile during triage. Before expanding the answer: which value would you flag, and why?

| Value name | Data |
|---|---|
| OneDriveSetup | `"C:\Program Files\Microsoft OneDrive\OneDriveSetup.exe" /background` |
| SecurityHealth | `%windir%\system32\SecurityHealthSystray.exe` |
| Teams | `C:\Users\jsmith\AppData\Local\Microsoft\Teams\Update.exe --processStart "Teams.exe"` |
| Adobe Updater | `"C:\Program Files (x86)\Common Files\Adobe\ARM\1.0\AdobeARM.exe"` |
| WindowsSecurityUpdate | `wscript.exe //B "C:\Users\jsmith\AppData\Roaming\svchosthelper\update.vbs"` |
| RtkAudUService | `"C:\Program Files\Realtek\Audio\HDA\RtkAudUService64.exe" -s` |

??? question "Reveal the answer"
    **`WindowsSecurityUpdate`.**

    Three things stack up against it:

    - **The value name is a generic, official-sounding decoy** ("WindowsSecurityUpdate") — real Windows Update mechanics don't work through a user's Run key at all, which makes the name itself a mismatch between what it claims to be and how Windows actually applies updates.
    - **It launches `wscript.exe`, not an executable.** Every other legitimate entry in this list points directly at a signed `.exe`. A Run key value invoking a script interpreter is exactly the pattern flagged in [Registry Run / RunOnce Keys](../05-persistence/registry-run-keys.md).
    - **The script lives under `AppData\Roaming\svchosthelper\`** — a folder name designed to look like it's related to `svchost.exe` (a legitimate system process) while actually sitting in a user-writable location no legitimate system component would use.

    The other five entries are all real, recognizable software (OneDrive, Windows Security, Teams, Adobe, Realtek audio) launching their own signed executables directly from standard install paths — exactly the baseline described in [Registry Run / RunOnce Keys](../05-persistence/registry-run-keys.md).

    **What to do next:** pull and read `update.vbs` itself, and check [Event Log](../01-windows-endpoint/event-log-key-ids.md) Sysmon Event ID 13 (registry value set) for when this Run key value was actually created — that timestamp is your anchor for scoping how long this persistence has been active.

<!-- BACKLINKS:START -->
## Referenced From

- [Persistence: Registry Run / RunOnce Keys](../05-persistence/registry-run-keys.md)
- [Practice Drills](index.md)

<!-- BACKLINKS:END -->

