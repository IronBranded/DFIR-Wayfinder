The `$MFT` records the **state** of a file right now. The USN journal records the **events** that happened to it. That difference is why the journal so often resolves questions the MFT alone cannot: a record can be rewritten or reused, but the journal entry describing what happened to it was already written and moved on.

## Where it lives

```
\$Extend\$UsnJrnl:$J
```

`$J` is an alternate data stream on a hidden system file. It is append-only: NTFS writes an entry for every change to every file and directory on the volume, and never edits earlier entries.

## What each entry holds

- **File or directory name** at the time of the change
- **MFT reference number** (and its sequence number), linking back to the record
- **Timestamp** of the change
- **Reason codes** — flags describing what actually happened

## The reason codes that matter

| Reason | Meaning |
|---|---|
| `FILE_CREATE` | File created |
| `FILE_DELETE` | File deleted |
| `DATA_OVERWRITE` / `DATA_EXTEND` / `DATA_TRUNCATION` | Contents written, grown, or shortened |
| `RENAME_OLD_NAME` / `RENAME_NEW_NAME` | A rename, recorded as a pair |
| `BASIC_INFO_CHANGE` | Metadata changed — **including `$SI` timestamps** |
| `SECURITY_CHANGE` | Permissions or ownership modified |
| `CLOSE` | Handle closed, usually terminating a sequence |

Two of these are disproportionately useful. **The rename pair** reveals what a file used to be called — a malicious binary renamed to something innocuous leaves both names linked in the journal. And **`BASIC_INFO_CHANGE`** is the timestomping counterpart: [modifying `$SI` timestamps](#/lesson/l4-05-mft-timestomping) generates one, at the *real* time it happened.

> [!IMPORTANT]
> Timestomping tools backdate `$SI`. They generally do not scrub the USN journal. So the journal can show `FILE_CREATE` for a file at its genuine creation time while the MFT claims the file has existed since 2009 — and that contradiction is the finding.

## The limitation: it wraps

The journal is a fixed-size circular buffer, typically tens of megabytes. On a busy volume that can mean only **days** of history. This is the opposite of the MFT's tradeoff: enormous detail about events, over a short window. Collect it early in an engagement rather than assuming it will still be there.

## Deleting it is itself evidence

`fsutil usn deletejournal /D C:` removes the journal outright. That is not something normal operation or legitimate administration does, and the absence of a journal on a volume where one should exist is a finding in its own right — the same reasoning as [Prefetch deletion](#/lesson/l4-01-prefetch).

## Normal baseline

The journal exists and is populated, with entries corresponding to ordinary system and user activity — updates, temp file churn, document saves. Sequences follow expected patterns: create, write, close.

## Red flags

- **`FILE_CREATE` in the journal at a time contradicting the file's `$SI` Born timestamp.**
- **A `BASIC_INFO_CHANGE` on a file whose timestamps now look implausibly old.**
- **Rename pairs disguising a binary's original name**, particularly renames into `System32` or out of `%TEMP%`.
- **Mass `FILE_DELETE` sequences** consistent with staging cleanup or [anti-forensic wiping](#/lesson/l5-20-vss-deletion-ransomware-precursor).
- **A missing journal** on a volume where one should exist.

## How to collect it

**MFTECmd** (Eric Zimmerman) parses `$J` directly:

```
MFTECmd.exe -f "C:\$Extend\$J" --csv <output>
```

Parse `$MFT` alongside it so reference numbers resolve to full paths — the journal stores names, not paths, and resolution requires both. Collect early, before the buffer wraps past the window of interest.

## ATT&CK mapping

Evidence-source content. Journal deletion maps to [Indicator Removal: Clear Windows Event Logs (T1070.001)](https://attack.mitre.org/techniques/T1070/001/) by analogy, and timestomping it corroborates maps to [Timestomp (T1070.006)](https://attack.mitre.org/techniques/T1070/006/).

## Sources

- [Microsoft Learn — Change Journals](https://learn.microsoft.com/en-us/windows/win32/fileio/change-journals)
- [Eric Zimmerman's tools — MFTECmd](https://ericzimmerman.github.io/)
- SANS FOR500 — Windows Forensic Analysis
- 13cubed — USN Journal analysis (YouTube)
