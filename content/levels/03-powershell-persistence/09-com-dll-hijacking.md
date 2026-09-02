Every mechanism so far in this module plants something that runs on its own. This one doesn't — it redirects a lookup that legitimate software was already going to perform, so the attacker's code executes inside a signed, trusted process that started for entirely normal reasons. That is what makes it so hard to see from a [process tree](#/lesson/l2-10-process-trees): there is no anomalous process, because the process is genuine.

## COM hijacking

COM objects are registered by CLSID, and a process instantiating one looks up its DLL under:

```
HKLM\SOFTWARE\Classes\CLSID\{GUID}\InprocServer32
HKCU\SOFTWARE\Classes\CLSID\{GUID}\InprocServer32
```

**`HKCU` takes precedence over `HKLM`.** An attacker who writes a `HKCU` CLSID entry shadowing a machine-wide one causes every process running as that user to load the attacker's DLL instead of the real one — with no administrative rights required anywhere in the chain.

The favoured targets are **abandoned CLSIDs**: GUIDs that software or a scheduled task still requests but that are no longer registered. Hijacking one produces no functional change a user would notice, because nothing was successfully loading before.

## DLL search order hijacking and side-loading

Windows resolves a DLL name by searching a defined sequence of directories, beginning with the application's own directory. Two abuses follow:

- **Search order hijacking** — placing a malicious DLL, named as one the application legitimately loads, in a directory searched earlier than the real one's location.
- **Phantom DLL hijacking** — supplying a DLL that the application looks for but that does not exist on the system, so the search reaches the attacker's copy unopposed.
- **Side-loading** — dropping a legitimate, correctly-signed executable into a writable directory alongside a malicious DLL it will load. The binary passes signature checks because it genuinely is the vendor's; the DLL beside it is not.

## Why process-creation logging misses all of it

Event ID 4688 and Sysmon Event ID 1 record processes starting. Nothing here starts an anomalous process. The detection has to come from **image load** events instead — Sysmon **Event ID 7 (ImageLoaded)**, which records each module a process loads along with its signature status.

That is the practical takeaway: an environment monitoring process creation but not image loads is effectively blind to this whole class, which is a point worth revisiting in [the Sysmon deployment lesson](#/lesson/l1-11-sysmon-deployment).

## Normal baseline

COM CLSID registrations live in `HKLM` and point at signed DLLs in `System32` or a vendor directory. `HKCU\Software\Classes\CLSID` contains few entries, and those that exist correspond to per-user software installs. Signed processes load signed DLLs from Program Files or System32, not from user-writable directories.

## Red flags

- **A `HKCU` CLSID entry shadowing an existing `HKLM` registration** — there is rarely a legitimate reason for this.
- **An `InprocServer32` value pointing at `%APPDATA%`, `%TEMP%`, or another user-writable path.**
- **A signed process loading an unsigned DLL from a user-writable directory** — the highest-value Sysmon Event ID 7 pattern in this lesson.
- **A legitimate signed executable running from an unusual directory**, particularly one containing a DLL with a matching expected name — the side-loading signature.
- **A CLSID registry key whose `LastWriteTime` falls inside a suspected intrusion window.**

## How to collect it

Sysmon Event ID 7, filtered for unsigned modules loading into signed processes, or for any module loading from a user-writable path. Autoruns covers COM registrations across several of its tabs and flags unsigned entries. For the `HKCU`-shadowing case specifically, enumerate `HKCU\Software\Classes\CLSID` and compare each GUID against `HKLM` — any GUID present in both deserves explanation.

## ATT&CK mapping

[Event Triggered Execution: Component Object Model Hijacking (T1546.015)](https://attack.mitre.org/techniques/T1546/015/), [Hijack Execution Flow: DLL Search Order Hijacking (T1574.001)](https://attack.mitre.org/techniques/T1574/001/), and [DLL Side-Loading (T1574.002)](https://attack.mitre.org/techniques/T1574/002/).

## Sources

- MITRE ATT&CK — T1546.015, T1574.001, T1574.002
- [Microsoft Learn — Dynamic-link library search order](https://learn.microsoft.com/en-us/windows/win32/dlls/dynamic-link-library-search-order)
