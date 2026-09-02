Prefetch exists for performance, not forensics. Windows watches what files and DLLs a program loads during its first ten seconds of execution, writes that list to disk, and uses it to preload the same content next time so the program starts faster. The forensic value is entirely a side effect — and it is one of the strongest execution artifacts Windows produces.

## What a `.pf` file contains

Files live at `C:\Windows\Prefetch\<EXECUTABLE>-<HASH>.pf` and hold:

- **The last eight execution timestamps** (Windows 8 and later; Windows 7 and earlier kept only the most recent one).
- **A run count** — how many times the executable has been launched.
- **A list of files and directories referenced** during the first ten seconds of execution — up to 1,024 entries on Windows 8+, 128 on earlier versions.

That referenced-file list is frequently the most valuable part. It can reveal what a since-deleted binary touched: the DLLs it loaded, the paths it read, the directories it walked.

## The hash suffix carries meaning

The `-<HASH>` portion is derived from the **full path** of the executable. Two consequences follow directly:

- The same filename executed from two different directories produces **two separate `.pf` files**. Seeing `SVCHOST.EXE-1A2B3C4D.pf` and `SVCHOST.EXE-5E6F7A8B.pf` means `svchost.exe` ran from two distinct paths, and only one of those is `System32`.
- Renaming a binary and running it again generates a new `.pf` while the old one persists — so the artifact survives simple renaming.

## The registry key that silently turns it off

```
HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management\PrefetchParameters\EnablePrefetcher
```

Values: `0` disabled, `1` application prefetching, `2` boot prefetching, `3` both.

> [!IMPORTANT]
> **Prefetch is disabled by default on Windows Server.** An empty or absent `C:\Windows\Prefetch` on a server is normal, not evidence of anti-forensics — and an investigator who treats a missing `.pf` as proof a program never ran will reach a wrong conclusion on every server they touch. Check `EnablePrefetcher` before interpreting absence.

## What it actually proves

Prefetch is **strong execution evidence**. A `.pf` file means the named executable, from that specific path, was launched — with a count and up to eight timestamps. That is a stronger claim than either [Amcache](#/lesson/l4-02-amcache) or [ShimCache](#/lesson/l4-03-shimcache) supports, which is why the three are read together rather than interchangeably.

## Normal baseline

Prefetch is populated on workstations, with entries corresponding to installed software running from Program Files and System32. Run counts are consistent with normal use. Executable names map to recognizable software.

## Red flags

- **A `.pf` for a binary in `%TEMP%`, `%APPDATA%`, or `C:\Users\Public`** — the hash confirms the path, so this is direct evidence of execution from an unusual location.
- **Two `.pf` files for the same system executable name**, indicating execution from a non-standard path.
- **A `.pf` whose referenced-file list includes paths inconsistent with the binary's claimed purpose.**
- **A `.pf` for a binary that no longer exists on disk** — the program ran and was deleted, and the referenced-file list may be your only record of what it touched.
- **A wiped Prefetch directory on a workstation** where `EnablePrefetcher` is enabled — deletion is itself an anti-forensic action.

## How to collect it

**PECmd** (Eric Zimmerman) parses `.pf` files including all eight timestamps and the full referenced-file list; `-d C:\Windows\Prefetch --csv <out>` processes the whole directory. Check `EnablePrefetcher` first so absence can be interpreted correctly. Prefetch files also carry filesystem timestamps of their own, which corroborate the internal execution times.

## ATT&CK mapping

Evidence-source content rather than a technique. Deliberate removal maps to [Indicator Removal: File Deletion (T1070.004)](https://attack.mitre.org/techniques/T1070/004/).

> [!TIP]
> Prefetch answers "did it run, from where, how often." [Amcache](#/lesson/l4-02-amcache) answers "was it here, and what was its hash." [ShimCache](#/lesson/l4-03-shimcache) answers something weaker than either. Reading all three and reconciling their disagreements is the actual technique.

## Sources

- [Eric Zimmerman's tools — PECmd](https://ericzimmerman.github.io/)
- 13cubed — Prefetch analysis walkthroughs (YouTube)
- SANS FOR500 — Windows Forensic Analysis
