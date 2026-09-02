Every recovery technique in this level assumes the data is still physically present. Secure deletion is the countermeasure — and the useful insight for an investigator is that **wiping is loud**. It destroys content while creating a distinctive, durable record that it happened.

## What wiping actually does

Ordinary deletion unlinks a file and marks its clusters available, leaving content [recoverable by carving](#/lesson/l4-12-file-carving). Secure deletion overwrites the clusters first, so there is nothing to recover.

Common tools: **SDelete** (Sysinternals, legitimate and signed — which is why it appears in intrusions), **BCWipe**, **Eraser**, and `cipher /w`, which is built into Windows.

> [!IMPORTANT]
> On SSDs, none of this works the way its authors intended. Wear levelling and the TRIM command mean the drive controller, not the OS, decides which physical cells hold data — an overwrite may land somewhere entirely different from the original. That cuts both ways forensically: wiped data may survive in unmapped cells the OS cannot address, and normally-deleted data may be genuinely gone the instant TRIM fires.

## The evidence wiping leaves

**Filename patterns.** Most wiping tools rename a file repeatedly before deleting it, often to sequences of a single repeated character. Those renames appear as [USN journal](#/lesson/l4-06-usn-journal) `RENAME_OLD_NAME`/`RENAME_NEW_NAME` pairs and in [`$I30` index slack](#/lesson/l4-07-ntfs-advanced-artifacts) — so the *original filename* is frequently recoverable even though the content is not.

**Execution evidence.** The tool itself ran. [Prefetch](#/lesson/l4-01-prefetch), [Amcache](#/lesson/l4-02-amcache), [UserAssist](#/lesson/l4-04-userassist), and SDelete's own registry key under `HKCU\Software\Sysinternals\SDelete` (an EULA-accepted value written on first run) all record it.

**Volume-level anomalies.** A large contiguous region of uniform bytes — zeros, `0xFF`, or a repeating pattern — in unallocated space is not what normal deletion produces. Normal free space is a mixture of old file fragments.

**Timeline gaps.** A period in which [USN](#/lesson/l4-06-usn-journal) and [`$LogFile`](#/lesson/l4-07-ntfs-advanced-artifacts) activity is dense with deletions and renames, with nothing else, is a wiping window.

## What this means practically

An attacker who wipes their tooling has destroyed the binaries and created, in exchange: an execution record of the wiping tool, a set of recoverable original filenames, a datable window of activity, and a volume-level artifact that is hard to explain innocently.

That trade is almost always bad for them — the same dynamic as [log clearing](#/lesson/l5-18-log-artifact-recovery), which announces itself via 1102 while leaving the entire non-log artifact set intact.

## Normal baseline

Secure-deletion tools are absent, or present and used by a documented process — a decommissioning workflow, a data-handling policy for sensitive material. `cipher /w` may appear in legitimate sanitization procedures. Free space shows the mixed, fragmentary content normal deletion produces.

## Red flags

- **SDelete, BCWipe, or Eraser execution evidence** on a workstation with no sanitization role.
- **The `HKCU\Software\Sysinternals\SDelete` EULA key** on a host where nobody should have run it.
- **Large uniform-byte regions in unallocated space.**
- **USN rename sequences to repeated-character filenames**, immediately followed by deletion.
- **`cipher /w` in [process creation logs](#/lesson/l4-11-event-log-key-ids)** outside a documented procedure.
- **A dense deletion window in the USN journal** with no corresponding business activity.

## How to collect it

Check execution artifacts for the tool names first — that is faster and more conclusive than filesystem analysis. Parse the USN journal for rename-then-delete sequences and recover original filenames from index slack. Examine unallocated space for uniform patterns. Where the volume is an SSD, note that limitation explicitly in reporting rather than treating overwrite as proof of destruction.

## ATT&CK mapping

[Indicator Removal: File Deletion (T1070.004)](https://attack.mitre.org/techniques/T1070/004/) and [Data Destruction (T1485)](https://attack.mitre.org/techniques/T1485/).

## Sources

- [Microsoft Learn — SDelete (Sysinternals)](https://learn.microsoft.com/en-us/sysinternals/downloads/sdelete)
- [NIST SP 800-88 Rev. 1 — Guidelines for Media Sanitization](https://csrc.nist.gov/publications/detail/sp/800-88/rev-1/final)
- MITRE ATT&CK — T1070.004, T1485
