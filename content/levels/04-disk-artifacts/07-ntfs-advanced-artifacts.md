[The `$MFT`](#/lesson/l4-05-mft-timestomping) records what exists and [the USN journal](#/lesson/l4-06-usn-journal) records what changed. Two further NTFS metafiles sit underneath both, and they recover things neither can: filenames of deleted files whose MFT records are already reused, and a transaction-level record of filesystem operations.

## `$LogFile` — the NTFS transaction log

NTFS is a journaling filesystem. Before committing a metadata change it writes a record to `$LogFile` describing both the operation and how to undo it, so an interrupted write can be rolled back at mount time.

For an investigator that means `$LogFile` holds **redo and undo records** for recent filesystem operations — file creation, deletion, rename, attribute change — often with enough detail to reconstruct the previous state of a record, not just the fact that it changed.

The tradeoff against the USN journal:

| | `$UsnJrnl:$J` | `$LogFile` |
|---|---|---|
| Records | A summary per change, with reason codes | Full transaction detail, redo + undo |
| Coverage window | Longer (larger buffer) | **Much shorter** — heavy write volume |
| Best for | Establishing that and roughly when | Reconstructing exactly what a record looked like |

`$LogFile` typically covers **hours** on a busy volume. It is the highest-resolution filesystem artifact available and the most perishable, which puts it near the top of the [order of volatility](#/lesson/l1-02-order-of-volatility) for disk-side evidence.

## `$I30` — directory index entries

Every NTFS directory maintains a B-tree index of its contents, stored in `$I30` attributes (`$INDEX_ROOT` and `$INDEX_ALLOCATION`). Each entry holds a filename plus a **copy of that file's `$FILE_NAME` timestamps**.

The forensically important property: when a file is deleted, its index entry is unlinked from the active tree but **the entry data frequently remains in index slack** — the unused space in the allocated index pages. Parsing that slack recovers **filenames and `$FN` timestamps of deleted files even after their MFT records have been reused and overwritten**.

> [!TIP]
> This is the recovery path when everything else has failed. The MFT record is gone, the USN journal has wrapped, carving found nothing — and a directory's index slack still names the file that used to be there, with its original creation time. It will not recover content, but proving a specifically-named file existed in a specific directory is frequently the whole question.

## Practical use together

A staging directory an attacker created, filled, archived, and deleted may leave: nothing in the current `$MFT`, nothing in a wrapped USN journal, no carvable content — and a complete list of the filenames it once held in `$I30` slack, with `$FN` timestamps that timestomping never touched.

## Normal baseline

Both are internal filesystem structures with no user-visible normal state. The baseline is analytical rather than observational: index slack entries should correspond to files legitimately deleted through normal use, and `$LogFile` transactions should reflect ordinary application activity.

## Red flags

- **Filenames in `$I30` slack that appear nowhere in the current filesystem**, particularly archives, dump files, or tooling names.
- **A deleted directory's index slack listing many files created and removed inside a short window** — staging behaviour.
- **`$LogFile` records showing a rename from a suspicious name to an innocuous one**, corroborating the [USN rename pair](#/lesson/l4-06-usn-journal).
- **`$FN` timestamps in index slack contradicting the `$SI` times** of a file that still exists — [timestomping](#/lesson/l4-05-mft-timestomping) caught by a copy the attacker did not know existed.

## How to collect it

Both are NTFS metafiles requiring raw volume access — acquire from a forensic image rather than a live copy. **MFTECmd** parses `$Boot`, `$J`, and `$SDS`; for `$I30` specifically, **INDXRipper** and **indx-parse** extract index entries including slack. `$LogFile` is parsed by **LogFileParser** and by several commercial suites. Collect `$LogFile` early — its window is measured in hours.

## ATT&CK mapping

Recovery technique countering [Indicator Removal: File Deletion (T1070.004)](https://attack.mitre.org/techniques/T1070/004/) and corroborating [Timestomp (T1070.006)](https://attack.mitre.org/techniques/T1070/006/).

## Sources

- [Microsoft Learn — Master File Table and NTFS metafiles](https://learn.microsoft.com/en-us/windows/win32/fileio/master-file-table)
- Maxim Suhanov (dfir.ru) — NTFS internals and `$LogFile` research
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
