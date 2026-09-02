The previous lesson taught recognition — what injected code looks like once it's sitting in memory. This one is the catalog of techniques that actually produce it, each leaving a slightly different signature worth knowing individually rather than treating "injection" as one undifferentiated thing.

## Classic DLL injection

The oldest, most straightforward technique: `VirtualAllocEx` allocates memory in a target process, `WriteProcessMemory` writes a DLL path into that memory, and `CreateRemoteThread` starts a new thread in the target whose start address points at `LoadLibraryA`/`LoadLibraryW` in `kernel32.dll`, with the allocated memory as its argument — the target process ends up loading and running the attacker's DLL itself. The signature: a remote thread whose start address is a legitimate `LoadLibrary` export, paired with a small allocated region containing a plausible file path string.

## Process hollowing

A legitimate binary is started in a **suspended** state, its original executable image is unmapped from memory (`NtUnmapViewOfSection`), and a different PE is written into that same address space before the process is resumed. The result *looks* like the legitimate binary at the process level — same name, sometimes even the same original path reported in places — while the code actually mapped at its image base is something else entirely. The signature: a mismatch between what a process claims to be running (its reported image path) and what's actually mapped at its image base address, visible with `windows.vadinfo` from [the previous lesson](#/lesson/l5-04-injected-code-detection).

## Reflective DLL injection

A DLL that implements its own PE-loading logic — parsing its own headers, resolving its own imports, relocating itself — rather than relying on the OS's normal `LoadLibrary` mechanism. Because it never calls `LoadLibrary`, it never needs to touch disk, and it never appears in a process's module list the normal way. This is exactly the case [the process-analysis lesson's](#/lesson/l5-02-volatility-process-analysis) `ldrmodules` comparison is built to catch: code mapped in memory with no corresponding entry in the process's self-reported module list.

## APC injection, including "Early Bird"

Queuing an Asynchronous Procedure Call to a target thread — often one created specifically in a suspended state for this purpose — so that when the thread resumes and processes its APC queue, it executes attacker code instead of (or before) its own intended work. The **"Early Bird"** variant queues the APC before a newly-created process's main thread has even started running, specifically to execute before security tooling that hooks into normal startup has a chance to engage.

## Thread execution hijacking

Rather than creating anything new, this technique suspends an **already-running** thread in a target process, uses `SetThreadContext` to redirect its instruction pointer to attacker-controlled code, then resumes it. No new thread ever appears — an existing, previously-legitimate thread is simply redirected mid-flight.

> [!WARNING]
> Every technique above eventually has to create or redirect an actual thread to run. [The next lesson](#/lesson/l5-06-thread-analysis) covers reading thread state directly — often a cleaner signal than any of the process-level artifacts these techniques leave behind.

## Normal baseline

No unexpected remote-thread-creation activity between unrelated processes; process image bases match their actual VAD-mapped content in every case; suspended threads exist only transiently as part of ordinary process startup, not as a persistent, unexplained state.

## Red flags

- **A remote thread whose start address is another process's `LoadLibrary` export**, created by a process with no legitimate reason to be injecting DLLs into anything.
- **A process's reported image path not matching what's actually mapped at its image base** — process hollowing's core signature.
- **A reflectively-loaded module present in memory with no corresponding `dlllist` entry.**
- **A thread sitting in a persistently suspended state with no normal-lifecycle explanation**, especially immediately after process creation — the setup both APC injection and thread hijacking depend on.

## How to collect it

`windows.malfind` and `windows.vadinfo` from the previous lesson remain the starting point for spotting the memory regions these techniques produce. `windows.threads` (detailed in the next lesson) adds thread-level start-address and state analysis on top. `windows.ldrmodules` specifically catches reflective loading by comparing self-reported and actual module lists.

## ATT&CK mapping

All of the above sit under [Process Injection (T1055)](https://attack.mitre.org/techniques/T1055/), with specific sub-techniques for each: [Dynamic-link Library Injection (T1055.001)](https://attack.mitre.org/techniques/T1055/001/), [Process Hollowing (T1055.012)](https://attack.mitre.org/techniques/T1055/012/), [Thread Execution Hijacking (T1055.003)](https://attack.mitre.org/techniques/T1055/003/), and [Asynchronous Procedure Call (T1055.004)](https://attack.mitre.org/techniques/T1055/004/).

## Sources

- MITRE ATT&CK — T1055 and sub-techniques
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
- 13cubed — process injection technique walkthroughs (YouTube)
- Windows Internals (Russinovich, Solomon, Ionescu) — virtual address space, sections, and thread creation
