The previous two lessons covered finding and understanding hidden processes. This one is about a different, more common problem: code running *inside* a completely legitimate, fully-visible process — not hidden at the process level at all, just injected into something that was never hiding in the first place.

## malfind: the flagship injection-detection plugin

`windows.malfind` flags memory regions matching three co-occurring properties: **private** (not backed by any file on disk — a normal loaded DLL or EXE is backed by its file via a memory-mapped section; injected code typically isn't), **executable** (page protection allowing execution, often `PAGE_EXECUTE_READWRITE`), and containing **recognizable executable content** (an MZ/PE header, or code that simply looks like machine instructions rather than data). No single property is unusual on its own — plenty of legitimate memory is private, plenty is executable — but the combination of all three is rare outside of injected code, because legitimate code is almost always file-backed.

## VAD: what malfind is actually reading

Every region of a process's virtual address space has a **Virtual Address Descriptor (VAD)** entry describing its protection level, whether it's backed by a file, and related metadata. `malfind` is, underneath, a heuristic for walking the VAD tree and flagging entries matching the injection profile above. Knowing this means a region malfind's default heuristics don't flag can still be inspected manually with `windows.vadinfo` when something looks worth a second look.

## The false-positive that catches people early: JIT-compiled code

Browsers, .NET applications, and Java all legitimately allocate private, executable memory as a normal and expected part of just-in-time compilation — and `malfind` **will** flag it, correctly, as matching its heuristic. Telling this apart from actual injected shellcode comes down to two questions: **which process** (is this a browser or a .NET/Java-heavy process where JIT allocation is expected at all?) and **what does the flagged region actually contain** (does it resemble compiled bytecode from a known JIT engine, or does it look like shellcode or an embedded PE header)? A `malfind` hit on `chrome.exe` deserves a very different level of concern than the identical hit on `lsass.exe`.

> [!PLAIN]
> JIT ("just-in-time") compilation is how some languages turn code into machine instructions right before running it, rather than ahead of time — which is exactly why it needs private, executable memory to write that freshly-compiled code into. It's a completely normal thing for a browser's JavaScript engine to do constantly.

## The same fileless pattern, seen from memory instead of logs

This is the memory-forensics-side confirmation of a pattern this academy has approached from several other directions already: a download cradle from [Level 3](#/lesson/l3-04-powershell-malicious-patterns) that reflectively loads an assembly never writes a file [Level 2's LOLBins content](#/lesson/l2-12-lolbins) would catch — but it has to land *somewhere* in memory to actually run, and that somewhere is exactly the private-executable-with-content signature `malfind` is built to catch.

## Normal baseline

`malfind` findings on a clean image are rare, and when present, trace cleanly to known JIT-heavy processes with an explainable reason to be there. A documented, expected baseline (browsers, PowerShell itself, .NET-hosted applications) looks completely different from an unexplained hit in a process type with no legitimate reason for private executable memory at all.

## Red flags

- **A `malfind` hit in a process type with no legitimate JIT or dynamic-code reason to have private executable memory** — `svchost.exe`, `lsass.exe`, `explorer.exe`, and similar are the clearest cases.
- **A flagged region containing a recognizable MZ/PE header** — a full, unpacked executable sitting in memory rather than a small shellcode stub.
- **A `malfind` hit in a process whose command line or parent process** (from [the process-analysis lesson](#/lesson/l5-02-volatility-process-analysis)) **already looked suspicious** — corroboration across techniques is worth more than any single flagged region on its own.

## How to collect it

`vol -f <image> windows.malfind` for the automated pass across the whole image; `vol -f <image> windows.vadinfo --pid <PID>` to manually inspect a specific process's VAD tree when a targeted second look is warranted. Cross-reference findings against `windows.cmdline` and `windows.pstree` output from the process-analysis lesson rather than reading `malfind` output in isolation.

## ATT&CK mapping

Maps directly to [Process Injection (T1055)](https://attack.mitre.org/techniques/T1055/) — this lesson covers the artifact-level detection; [the next lesson](#/lesson/l5-05-injection-techniques) covers the specific techniques (process hollowing, DLL injection, and others) that produce what `malfind` is looking for.

> [!TIP]
> This lesson deliberately stopped at *recognizing* injected code, not *how it got there*. [The next lesson](#/lesson/l5-05-injection-techniques) is the technique catalog — process hollowing, DLL injection, and the other major methods, each with its own slightly different memory signature.

## Sources

- [Volatility 3 — Windows plugin documentation](https://volatility3.readthedocs.io/en/latest/)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
- 13cubed — memory injection detection walkthroughs (YouTube)
