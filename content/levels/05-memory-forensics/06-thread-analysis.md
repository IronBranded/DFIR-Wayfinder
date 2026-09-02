Every injection technique in the previous lesson eventually has to create or redirect an actual thread to run its code. This lesson reads threads directly, rather than inferring injection only from the process-level artifacts covered so far.

## Start address: the question that matters most

Every thread has a **start address** — the address of the function it began executing at. For a normal thread, that address falls inside a loaded, file-backed module: `kernel32.dll`, `ntdll.dll`, the application's own executable, or similar. For an injected thread, the start address frequently falls in **private memory with no backing module at all** — the same private-and-executable signature [malfind](#/lesson/l5-04-injected-code-detection) looks for in a memory region, examined instead at the level of an individual thread.

## windows.threads

The `windows.threads` plugin lists every thread with its owning process, start address, and current state. Cross-referencing that start address against a process's loaded modules — via `vadinfo` or the module list from [process analysis](#/lesson/l5-02-volatility-process-analysis) — reveals directly whether the address a thread claims to have started at corresponds to real, mapped code or to unbacked memory.

## Suspended threads as their own tell

A thread sitting in a **suspended** state is not inherently suspicious — plenty of normal Windows operation briefly suspends threads. What's worth flagging is a thread that was created suspended and stays that way with no clear lifecycle explanation, since that's precisely the setup [APC injection and "Early Bird," and thread execution hijacking](#/lesson/l5-05-injection-techniques) both depend on: get a thread into a controllable state before redirecting or hijacking it.

> [!PLAIN]
> A thread's "state" here just means what it's currently doing — running, waiting, or suspended (deliberately paused, not currently executing at all). Legitimate code suspends threads briefly and routinely; what matters is whether a suspension has an obvious, explainable reason or just sits there indefinitely.

## Normal baseline

Thread start addresses resolve to legitimate, loaded modules for the overwhelming majority of threads on a clean image. Suspended threads exist only transiently, tied to identifiable, ordinary process-lifecycle events — never as a persistent, unexplained state sitting in the image at the moment of acquisition.

## Red flags

- **A thread start address in private, unbacked memory** — no corresponding loaded module at that address at all.
- **A start address that falls within a legitimate module, but at an offset that doesn't correspond to any real exported function** — a mid-function injection point rather than a normal entry point.
- **A persistently suspended thread with no normal-lifecycle explanation**, particularly one created immediately after its owning process itself started.
- **A thread whose start address, module, and owning process combination doesn't match anything in a documented application-behavior baseline.**

## How to collect it

`vol -f <image> windows.threads` for the full thread listing across the image; cross-reference start addresses against `windows.vadinfo --pid <PID>` output for the owning process to confirm whether a given address actually falls within mapped, file-backed memory.

## ATT&CK mapping

Supports detection of the [Process Injection (T1055)](https://attack.mitre.org/techniques/T1055/) sub-techniques covered in [the previous lesson](#/lesson/l5-05-injection-techniques) — thread-level analysis is often the cleanest single confirmation once a process-level or memory-region-level finding already looks suspicious.

> [!TIP]
> This closes out the injection-focused thread of Level 5. [The next lesson](#/lesson/l5-07-mutex-analysis) shifts to a different kind of memory artifact entirely — one that turns out to be one of the most durable indicators available for identifying a specific malware family, not just recognizing that something malicious is present.

## Sources

- [Volatility 3 — Windows plugin documentation](https://volatility3.readthedocs.io/en/latest/)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
- Windows Internals (Russinovich, Solomon, Ionescu) — thread objects, scheduling, and start addresses
