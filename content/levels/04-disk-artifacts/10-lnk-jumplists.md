A shortcut file is a small binary structure Windows writes automatically whenever a user opens a document — and it records more about the target than the target itself does. Jump Lists aggregate the same data per-application. Together they answer a question few other artifacts can: **what files did this user open, from where, including from drives and shares that are no longer attached.**

## LNK files

Windows creates a `.lnk` automatically in the recent-items folder when a file is opened through Explorer or a common dialog:

```
%APPDATA%\Microsoft\Windows\Recent\
%APPDATA%\Microsoft\Office\Recent\
```

Each one carries:

- **Target full path**, including the original drive letter or UNC path
- **Target file size**
- **Target MAC timestamps as they were when the LNK was last updated** — a second, independent copy of the target's `$SI` times
- **Volume serial number** and volume label of the drive the target lived on
- **The originating machine's NetBIOS name** in the distributed link tracker fields
- **Its own** creation and modification times — first and most recent access

> [!IMPORTANT]
> A LNK survives its target. Delete the file, wipe the folder, unplug the USB drive, disconnect the share — the shortcut remains with the full path, the file size, the target's timestamps, and the volume serial number. That combination frequently proves a specific file existed on a specific removable device at a specific time, when nothing else on the system references it at all.

## The two timestamps that answer different questions

A LNK holds two timestamp sets, and confusing them is the common error:

| Timestamp set | Answers |
|---|---|
| The LNK file's own created/modified times | **When the user first and most recently opened the target** |
| The embedded target MAC times | **What the target's own timestamps were at that moment** |

The second set is a snapshot. Compared against the file's current `$MFT` values, a mismatch is [timestomping evidence](#/lesson/l4-05-mft-timestomping) captured incidentally — the LNK preserved the original times before they were altered.

## Jump Lists

Jump Lists store the same information per-application, in two places:

```
%APPDATA%\Microsoft\Windows\Recent\AutomaticDestinations\
%APPDATA%\Microsoft\Windows\Recent\CustomDestinations\
```

**AutomaticDestinations** files are OLE compound files containing embedded LNK structures plus a DestList stream that records **access order and access count** — how many times each entry was opened, and in what sequence. **CustomDestinations** hold application-defined entries (an app's own "recent" or "pinned" lists).

Each file is named with the application's **AppID**, a hash identifying the program. Published AppID lists map these to applications, which is how you know a given Jump List belongs to Word, Notepad, or a specific version of a browser.

## Where this beats ShellBags

[ShellBags](#/lesson/l4-09-shellbags) prove a **folder** was browsed in Explorer. LNK files and Jump Lists prove a **file** was opened, by which application, how many times, and from which volume. They are complementary rather than redundant — and Jump Lists additionally capture files opened through an application's own File-Open dialog, which never generates a ShellBag at all.

## The adjacent artifact set: browsers

Browser history, downloads, cache, and form data live in **SQLite databases** in each browser's profile directory — `History` and `Web Data` for Chromium-based browsers, `places.sqlite` and `formhistory.sqlite` for Firefox. They answer the same class of question as LNK files (what did this user open, and when) for web-delivered content specifically, and the **downloads table is frequently the record of how a malicious file first arrived**.

Two practical notes: deleted rows often remain recoverable from SQLite freelist pages and WAL journals, so "cleared history" is rarely fully cleared; and `Plaso` parses all of these automatically as part of a [super timeline](#/lesson/l1-08-super-timeline-plaso), which is usually the least effortful way to include them.

## Normal baseline

Recent-items entries correspond to documents the user's role explains, on local drives and mapped shares they legitimately use. Volume serial numbers match known internal disks and approved removable media.

## Red flags

- **A LNK with a volume serial number matching no known internal or approved device** — a file opened from unauthorized removable media, central to [insider](#/lesson/l8-06-playbook-insider-threat) and [exfiltration](#/lesson/l8-07-playbook-data-exfiltration) work.
- **A target path under `%TEMP%`, `C:\Users\Public`, or an administrative share** (`\\host\C$`).
- **Embedded target MAC times disagreeing with the current `$MFT` values** for a file that still exists.
- **A high DestList access count** on a sensitive document by a user with no business reason to open it repeatedly.
- **LNKs referencing files on a share the user has never been assigned.**

## How to collect it

**LECmd** (Eric Zimmerman) parses `.lnk` files including all embedded target metadata and the volume/machine fields. **JLECmd** (also Zimmerman) parses both AutomaticDestinations and CustomDestinations, resolving AppIDs and exposing the DestList access counts and ordering. Collect the whole `Recent` tree per user profile — the aggregate ordering is often more informative than any individual entry.

## ATT&CK mapping

Evidence-source content supporting [Data from Removable Media (T1025)](https://attack.mitre.org/techniques/T1025/), [Exfiltration Over Physical Medium (T1052)](https://attack.mitre.org/techniques/T1052/), and [File and Directory Discovery (T1083)](https://attack.mitre.org/techniques/T1083/).

## Sources

- [Microsoft Learn — MS-SHLLINK: Shell Link (.LNK) Binary File Format](https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-shllink/)
- [Eric Zimmerman's tools — LECmd and JLECmd](https://ericzimmerman.github.io/)
- 13cubed — LNK file and Jump List analysis (YouTube)
- SANS FOR500 — Windows Forensic Analysis
