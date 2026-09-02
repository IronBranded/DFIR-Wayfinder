ShellBags exist so Explorer can remember that you like a particular folder shown as large icons, sorted by date, in a window of a certain size. To do that, Windows has to record **that you opened that folder at all** — and it keeps that record long after the folder itself is gone.

## Where they live

```
UsrClass.dat  →  Local Settings\Software\Microsoft\Windows\Shell\BagMRU
UsrClass.dat  →  Local Settings\Software\Microsoft\Windows\Shell\Bags
NTUSER.DAT    →  Software\Microsoft\Windows\Shell\BagMRU  and  \Bags
```

On modern Windows the bulk sits in **`UsrClass.dat`**, which is easy to miss because it lives in `AppData\Local\Microsoft\Windows\` rather than alongside `NTUSER.DAT` in the profile root. `BagMRU` holds the folder hierarchy as a nested tree; `Bags` holds the view settings for each.

## What makes them valuable

**ShellBags survive the folder.** Delete a directory, wipe it, unplug the removable drive it was on, disconnect the network share — the ShellBag entry remains in the user's hive. It is evidence that a specific path existed and was browsed to, recoverable when nothing else on the system references that path at all.

They cover more than local folders:

- **Network shares** — `\\server\share\...`, proving a user navigated a remote path
- **Removable media** — including volume identifiers, pairing with [USB device history](#/lesson/l2-06-registry-hives)
- **ZIP archives opened in Explorer**, which appear as browsable folders
- **Deleted directories**, long after the fact

## The limitation that defines interpretation

ShellBags are created by **Explorer GUI browsing**. A folder accessed via `cd` in a command prompt, a PowerShell script, or a program opening a file path directly generates **no ShellBag**.

> [!IMPORTANT]
> Absence proves nothing. "There is no ShellBag for that directory" does not mean the directory was never accessed — it means nobody browsed to it in Explorer. Presence is strong evidence; absence is not evidence at all. This asymmetry is the single most important thing to state correctly when ShellBags appear in a report.

## Attribution nuance

A ShellBag records that *this user's session* browsed a path. If an attacker is operating inside a hijacked session — via RDP, or with stolen credentials — the resulting ShellBags land in that legitimate user's hive. The artifact attributes activity to an account, not to a person, which matters in [insider threat](#/lesson/l8-06-playbook-insider-threat) work particularly.

## Normal baseline

Entries correspond to folders the user plausibly browsed: documents, downloads, network shares they work with, external drives they use. The tree reflects normal navigation patterns for that role.

## Red flags

- **Paths under `%TEMP%`, `C:\Users\Public`, or other staging locations.**
- **Network share paths the user has no business reason to browse**, particularly administrative shares like `\\host\C$`.
- **Removable media entries** where policy prohibits them, or in an [exfiltration](#/lesson/l8-07-playbook-data-exfiltration) investigation.
- **Paths that no longer exist**, corroborated against [USN journal](#/lesson/l2-03-usn-journal) deletion entries.
- **ShellBags created during a window when the account's owner was demonstrably not working** — session hijacking or credential misuse.

## How to collect it

**ShellBagsExplorer** (GUI) and **SBECmd** (command line), both Eric Zimmerman tools, reconstruct the full folder tree with timestamps. Parse **both** `UsrClass.dat` and `NTUSER.DAT` per user — checking only one gives a partial picture. Collect the transaction logs alongside each hive, as covered in [registry hives](#/lesson/l2-06-registry-hives).

## ATT&CK mapping

Evidence-source content, supporting investigation of [File and Directory Discovery (T1083)](https://attack.mitre.org/techniques/T1083/) and exfiltration staging.

## Sources

- [Eric Zimmerman's tools — ShellBagsExplorer](https://ericzimmerman.github.io/)
- 13cubed — ShellBag analysis (YouTube)
- SANS FOR500 — Windows Forensic Analysis
