NTFS stores every file's timestamps **twice**, in two different attributes, updated by two different mechanisms. One of them is writable through a documented Windows API; the other is not. That asymmetry is the entire basis of timestomping detection, and it is why this artifact rewards understanding the structure rather than just reading a tool's output.

![The NTFS dual timestamp split: STANDARD_INFORMATION at 0x10 is writable through the Windows API while FILE_NAME at 0x30 is kernel-maintained, which is why an SI Born earlier than FN Born indicates timestomping](assets/img/diagrams/si-fn-timestamps.svg)

## The two attributes

Every `$MFT` record carries both:

- **`$STANDARD_INFORMATION`** (attribute type `0x10`, "`$SI`") — the timestamps Explorer, `dir`, and most tools display. **Settable through the Windows API** via `SetFileTime`.
- **`$FILE_NAME`** (attribute type `0x30`, "`$FN`") — maintained by the kernel, updated on file creation, rename, and move. **Not settable through normal API calls.**

## MACB

Four timestamps in each attribute:

| Letter | Meaning |
|---|---|
| **M** | Modified — file content last changed |
| **A** | Accessed — file last read |
| **C** | Changed — the MFT record itself last changed (metadata) |
| **B** | Born — file created |

Older literature uses **MACE**, where E (Entry Modified) is the same field as C. Same data, different naming convention.

## The core detection: `$SI` earlier than `$FN`

A timestomping tool calls `SetFileTime` to backdate `$SI`, making a file look like it has been present since the OS was installed. `$FN` is untouched, because the API cannot reach it. The result:

> **`$SI` Born earlier than `$FN` Born is anomalous.** A file cannot legitimately have been created before its own filename record was written.

**MFTECmd** exposes this directly as a boolean column, `SI<FN`, so you do not have to compute it by hand.

## Two false positives that matter

**Copy inheritance.** Copying a file creates a new `$FN` (timestamps of *now*) while `$SI` Modified is inherited from the source. So `$SI` Modified earlier than `$FN` Born is **completely normal for a copied file** — this is the single most common false positive, and MFTECmd flags it separately as a `Copied` column rather than folding it into `SI<FN`.

**Cross-volume moves.** Moving a file between volumes is a copy-and-delete internally, producing the same inheritance pattern.

## The sub-second tell

Windows records timestamps with 100-nanosecond precision. Many timestomping tools set times with **zeroed sub-second components**, because the API is called with second-granularity input. A file whose timestamps end in exact zeros across all four values, on a system where every other file has noisy sub-second precision, is a strong indicator. MFTECmd surfaces this as **`uSecZeros`**.

## Why `$SI` Accessed is unreliable on modern systems

```
HKLM\SYSTEM\CurrentControlSet\Control\FileSystem\NtfsDisableLastAccessUpdate
```

Since Windows 10 v1803 this flag has **four states** — two user-managed (enabled/disabled) and two system-managed. In system-managed mode Windows disables last-access updates on larger volumes, with a threshold around **128 GB**. On most modern systems, that means **`$SI` Accessed is simply not maintained**, and an absent or stale Accessed time is a configuration artifact rather than evidence about user behaviour. Check the flag before drawing any conclusion from an Accessed timestamp.

## Resident data

Files smaller than roughly 700 bytes are stored **inside the MFT record itself** rather than in separate clusters. For small scripts and configuration files, this means the `$MFT` may still hold the actual file contents after deletion — recoverable directly from the record.

## Normal baseline

`$SI` and `$FN` timestamps are broadly consistent, with `$SI` Born at or after `$FN` Born. Sub-second components are noisy rather than zeroed. System file timestamps cluster around OS install and patch dates. Copied files show the inheritance pattern described above and are identified as such rather than flagged as anomalies.

## Red flags

- **`SI<FN`** — `$SI` Born earlier than `$FN` Born, not explained by copy inheritance.
- **Zeroed sub-second precision** across all four timestamps on a file, where the surrounding files show normal precision.
- **A timestamp exactly matching a system file's** — a common timestomping approach is copying times from `kernel32.dll` or similar, producing an implausible cluster.
- **A `$SI` Born predating the volume's own creation**, or predating the OS install date.
- **Timestamps inconsistent with the [USN journal](#/lesson/l4-06-usn-journal)**, which records changes independently and is the corroborating source here.

## How to collect it

**MFTECmd** (Eric Zimmerman) parses `$MFT` and outputs both attribute sets plus the `SI<FN`, `Copied`, and `uSecZeros` boolean columns:

```
MFTECmd.exe -f C:\$MFT --csv <output>
```

Check `NtfsDisableLastAccessUpdate` before interpreting any Accessed timestamp. Corroborate anomalies against the USN journal, which timestomping tools generally do not modify.

## ATT&CK mapping

[Indicator Removal: Timestomp (T1070.006)](https://attack.mitre.org/techniques/T1070/006/).

## Sources

- [Microsoft Learn — File Times and NTFS attributes](https://learn.microsoft.com/en-us/windows/win32/sysinfo/file-times)
- [Eric Zimmerman's tools — MFTECmd](https://ericzimmerman.github.io/)
- Maxim Suhanov (dfir.ru) — NTFS timestamp research
- MITRE ATT&CK — T1070.006
