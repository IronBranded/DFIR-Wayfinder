Once an image exists, almost every triage starts the same way: what processes were running. Volatility gives several different ways to ask that question, and they don't always agree — the disagreement itself is often the finding.

## pslist vs. psscan: the same question, two different answers

**`windows.pslist`** walks the same doubly-linked list (`ActiveProcessLinks`) that Task Manager and every standard Windows API ultimately reads — fast, and correct for anything actually linked into that list. **`windows.psscan`** doesn't walk any list at all: it scans the raw memory image for the pool-tag signature the kernel stamps on every EPROCESS allocation, finding every process-shaped structure in memory whether or not it's linked. [The next lesson](#/lesson/l5-03-eprocess-internals) covers exactly why that difference exists at the structure level; for now, the practical rule is simple — **run both, every time**, and treat any process psscan finds that pslist doesn't as the single highest-priority finding in the image.

## pstree: the same data, shaped like a tree

`windows.pstree` renders process/parent relationships as a tree rather than a flat list — directly useful for spotting the parent-child red flags [Level 2](#/lesson/l2-12-lolbins) already trained you to recognize (`mshta.exe` under `winword.exe`, `svchost.exe` with the wrong parent), except now recovered from a memory snapshot instead of a live system or an event log that may not have been enabled.

## dlllist and ldrmodules: what a process says vs. what's actually there

`windows.dlllist` reads a process's own self-reported module list, from its PEB. `windows.ldrmodules` cross-references that self-report against the actual mapped memory regions (the VAD). A DLL mapped in memory but **absent** from the process's own module list — or the reverse — is a strong signal of reflective loading or manual unlinking, the same pattern this academy's [BYOVD](#/lesson/l2-13-byovd-loldrivers) and [obfuscation](#/lesson/l3-02-powershell-obfuscation) lessons approach from the endpoint-log side.

## cmdline: recovering command lines from memory itself

`windows.cmdline` recovers the full command line for each process directly from memory — the same information Sysmon Event ID 1 or Event ID 4688 would show, but pulled from RAM rather than a log. This matters specifically when process-creation logging wasn't enabled, has since rotated out of retention, or when confirming that a log entry and the live memory state actually agree.

## handles: what a process had open

`windows.handles` lists what a process held open at the moment of acquisition — files, registry keys, other processes, mutexes (the last of these picked up again in [the mutex-analysis lesson](#/lesson/l5-07-mutex-analysis)). A process holding an open handle to `lsass.exe` is exactly the kind of thing this list surfaces directly.

## Normal baseline

`pslist` and `psscan` return the same process count and the same set of PIDs on a clean image — that agreement *is* the baseline, not just a nice-to-have. Command lines recovered via `cmdline` match what any available log source shows for the same PID. Module lists from `dlllist` and `ldrmodules` agree with each other for the overwhelming majority of processes.

## Red flags

- **`psscan` finds a process `pslist` doesn't.** Confirmed hidden or unlinked — treat as the top priority in the image, not one finding among many.
- **`ldrmodules` shows a DLL mapped in memory that's absent from the process's own `dlllist` output** (or the reverse) — reflective loading or deliberate module-list tampering.
- **A `cmdline` recovery that doesn't match any available log entry for that PID** — possible spoofing, or confirmation that logging genuinely missed this execution.
- **A process holding a handle to `lsass.exe` with no legitimate reason to** — a live-memory version of the same signal [Level 5's LSASS lesson](#/lesson/l5-08-lsass-memory-analysis) and [Level 6's ASR lesson](#/lesson/l6-19-attack-surface-reduction) both cover from other angles.

## How to collect it

`vol -f <image> windows.pslist` and `vol -f <image> windows.psscan`, run as a pair every time — never one without the other. `vol -f <image> windows.pstree` for the parent-child view, `vol -f <image> windows.cmdline` for recovered command lines, `vol -f <image> windows.dlllist --pid <PID>` and `windows.ldrmodules --pid <PID>` for the module-list cross-check on a specific process of interest.

## ATT&CK mapping

Supports detection of [Process Injection (T1055)](https://attack.mitre.org/techniques/T1055/) broadly, with the hidden-process pattern specifically mapping to [Rootkit (T1014)](https://attack.mitre.org/techniques/T1014/) — the ATT&CK technique for exactly the kind of enumeration-evasion `psscan` is built to defeat.

> [!TIP]
> Why `psscan` can find what `pslist` structurally cannot is the subject of [the next lesson](#/lesson/l5-03-eprocess-internals) — worth reading even if the plugin usage above already makes sense on its own, since it's the same underlying concept that explains several other memory-forensics techniques later in this level.

## Sources

- [Volatility 3 — Windows plugin documentation](https://volatility3.readthedocs.io/en/latest/)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
