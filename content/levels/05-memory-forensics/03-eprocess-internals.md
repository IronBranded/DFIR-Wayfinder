The previous lesson used `pslist` and `psscan` without fully explaining why they can disagree. That gap is worth closing properly — it's the same underlying concept that explains several other techniques later in this level, not just one plugin pair.

## EPROCESS: the kernel's own record of a process

**EPROCESS** is the kernel structure Windows maintains, one per process, holding everything the kernel itself tracks about it. A few fields matter directly for this academy's purposes: `UniqueProcessId` (the PID itself), `InheritedFromUniqueProcessId` (the parent's PID — recorded once at process creation, as a **stored value**, not a live pointer), a pointer to the **PEB** (Process Environment Block — user-mode-accessible memory holding the process's own view of its loaded modules and command line, which is exactly what `dlllist` and `cmdline` from the previous lesson are reading), and a pointer to the process's security **Token**.

> [!WARNING]
> `InheritedFromUniqueProcessId` being a stored value, not a live pointer, matters more than it looks like it should: it tells you which PID *created* this process, but nothing about whether that PID still exists, or whether it was ever the process you'd assume from the number alone — PIDs get reused constantly, and a stored parent PID that no longer maps to any running process is expected, not automatically suspicious on its own.

## ActiveProcessLinks: the list every enumeration API walks

Every EPROCESS also contains an entry in **`ActiveProcessLinks`** — a doubly-linked list connecting every running process's EPROCESS to the next. This is the specific list `pslist`, Task Manager, `tasklist`, and effectively every standard "enumerate running processes" API ultimately walk.

## DKOM: unlinking without stopping

**Direct Kernel Object Manipulation (DKOM)** hides a process by patching the `Flink`/`Blink` pointers of the entries immediately before and after it in `ActiveProcessLinks`, so they point around it — skipping it entirely on any walk of that list. Critically, the Windows scheduler doesn't use `ActiveProcessLinks` to decide what actually gets CPU time; that's a separate mechanism entirely. **Unlinking a process from this list hides it from enumeration without stopping it from running** — the process keeps executing normally, invisible only to tools that ask the kernel "list your processes" the standard way.

## Why psscan defeats it

`psscan` doesn't walk `ActiveProcessLinks` at all. It scans the raw memory image directly for the specific byte-pattern (pool tag) the kernel's pool allocator stamps on every EPROCESS allocation, finding every EPROCESS-shaped structure in memory regardless of whether anything currently links to it. A DKOM-hidden process is unlinked from the list `pslist` reads — but its EPROCESS structure is still sitting in memory with the same pool tag as any other, which is exactly what `psscan` is looking for.

## Normal baseline

This is concept content rather than something with its own collection step — the practical baseline is what [the previous lesson](#/lesson/l5-02-volatility-process-analysis) already established: `pslist` and `psscan` agreeing on the same process set. Every legitimate process has a plausible `InheritedFromUniqueProcessId` chain consistent with [Level 2's baseline process trees](#/lesson/l2-10-process-trees).

## Red flags

- **An EPROCESS found by `psscan` with no corresponding entry in `pslist`** — the direct signature of DKOM.
- **`ActiveProcessLinks` pointers that don't form a valid closed loop when walked manually** — a corrupted or actively-tampered list, beyond just one unlinked entry.
- **A PEB pointer that's null or points to an implausible address** — worth flagging even outside a DKOM context, since it's also a tell for process hollowing, covered in [the injection-techniques lesson](#/lesson/l5-05-injection-techniques).

## How to collect it

`vol -f <image> windows.psscan` compared directly against `vol -f <image> windows.pslist` — the comparison itself is the technique, not a single plugin's output in isolation. For manually inspecting a specific EPROCESS's raw fields when automated output isn't enough, `vol -f <image> windows.info` confirms the Windows build in use first, since exact EPROCESS field offsets are version-dependent.

## ATT&CK mapping

Maps to [Rootkit (T1014)](https://attack.mitre.org/techniques/T1014/) specifically — DKOM is a textbook example of the technique this ATT&CK entry describes — sitting underneath the broader [Process Injection (T1055)](https://attack.mitre.org/techniques/T1055/) umbrella this level builds toward.

> [!TIP]
> Understanding EPROCESS also sets up [the injected-code-detection lesson](#/lesson/l5-04-injected-code-detection): the same "what does the kernel's own structure actually say, versus what a simple enumeration API reports" question reappears there in a different form.

## Sources

- Windows Internals (Russinovich, Solomon, Ionescu) — EPROCESS and process internals
- [Volatility 3 — Windows plugin documentation](https://volatility3.readthedocs.io/en/latest/)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
