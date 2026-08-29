Every plugin, every technique, everything else in this level assumes you already have a memory image in hand. Getting one is where memory forensics differs most sharply from disk forensics: acquiring a disk image doesn't meaningfully change the disk, but acquiring RAM necessarily runs a program *inside* the exact memory you're trying to capture — there's no way around touching the evidence to collect it. "Forensically sound" here means minimizing and documenting that footprint, not eliminating it.

> [!PLAIN]
> RAM is volatile in the literal sense — it holds its contents only while powered, and starts degrading the instant power is cut. That's the core reason memory sits above disk in the [order of volatility](#/lesson/l1-02-order-of-volatility): whatever you're going to capture from a live system, memory is usually the most urgent, not an afterthought once the "real" evidence is secured.

## What "sound" actually requires

A small, purpose-built acquisition tool — not a general-purpose forensic suite with a memory module bolted on — keeps the footprint minimal. Hash the resulting image (SHA-256) immediately after acquisition and before any analysis touches it. Write the output to external/removable media, never back onto the same volume that might later matter for disk-side artifacts. Document the exact tool, version, and command used — this becomes part of the chain of custody, and different tools have genuinely different capture completeness on the same system.

## Live acquisition tools

**WinPmem** (open source, kernel-driver-based) is the most commonly cited baseline tool in current SANS and community material — it loads a signed driver to get direct physical memory access. **Magnet RAM Capture** and **Belkasoft RAM Capturer** are free, GUI-driven alternatives with a smaller footprint and no command-line requirement, useful when a responder needs something usable without a lot of setup. **FTK Imager** includes a memory-capture feature too, convenient if it's already part of a standard triage kit, though it's a heavier tool than the purpose-built options above.

## When you can't acquire live: cold sources

Two Windows-native artifacts hold a memory snapshot even without a live capture ever happening. **`hiberfil.sys`** (the hibernation file, present whenever hibernation has been used) contains a compressed snapshot of RAM from the last time the system hibernated — Volatility can parse it directly. A **crash dump** (`MEMORY.DMP`, from a BSOD or a manually triggered dump) captures RAM at the moment of the crash, and is analyzable with the same tools and plugins as a live capture. Neither is a substitute for a fresh live acquisition when one's possible — both reflect memory state from *some point in the past*, not the moment you actually started responding — but both matter when a live capture wasn't taken, or wasn't taken soon enough.

## Virtual machines: acquiring from outside the guest

For a VM, a **snapshot or checkpoint file** — `.vmem` for VMware, the checkpoint save-state files for Hyper-V — is a third acquisition path that never touches the guest OS at all, since it's taken from the hypervisor side. This matters specifically for the endpoint types this academy covers broadly: a compromised VM can be snapshotted for memory analysis without ever running an acquisition tool inside a system an attacker may already be watching.

> [!TIP]
> A hypervisor-side snapshot is also the cleanest option when a guest is suspected of running anti-forensic or anti-debugging code that could detect and interfere with an in-guest acquisition tool — the guest OS never sees the capture happen at all.

## Normal baseline

A documented memory-acquisition procedure exists as part of the IR runbook, naming a specific tool and command, tested in advance rather than improvised mid-incident, writing to dedicated external evidence media by default.

## Red flags (in the acquisition itself)

- **An image significantly smaller than the system's installed RAM** — a strong sign of a partial or failed capture, not a small memory footprint.
- **A hash mismatch between the value recorded at acquisition time and the value calculated before analysis** — a chain-of-custody break, treated as seriously as any other evidence-integrity failure.
- **Acquiring from a system already known or suspected to run anti-forensic tooling** without considering a hypervisor-side or cold-source alternative first.

## How to collect it

Live: `winpmem_mini.exe <output-path>` for a straightforward WinPmem capture, or the equivalent GUI flow for Magnet RAM Capture / Belkasoft RAM Capturer. Cold: `hiberfil.sys` and `MEMORY.DMP` are read directly by Volatility 3 the same way a raw capture is — no separate conversion step required. Hash immediately: `Get-FileHash -Algorithm SHA256 <path>` in PowerShell, recorded before the image leaves the acquiring host.

## ATT&CK mapping

This lesson is evidence-source content rather than a specific technique — it establishes the foundation everything else in this level depends on, most directly [Process Injection (T1055)](https://attack.mitre.org/techniques/T1055/), the umbrella technique the rest of this module builds toward detecting.

> [!TIP]
> [The next lesson](#/lesson/l5-02-volatility-process-analysis) is where an acquired image actually gets read for the first time — the process-listing plugins that answer "what was running" once you have something to run them against.

## Sources

- [Volatility Foundation — Volatility 3](https://volatilityfoundation.org/)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
- 13cubed — memory acquisition and Volatility walkthroughs (YouTube)
