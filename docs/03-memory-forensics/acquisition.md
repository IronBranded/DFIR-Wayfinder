---
tags:
  - Memory Forensics
---

# Memory Acquisition

## Why this comes first

Everything else in this module depends on getting a usable memory image in the first place, and [Order of Volatility](../00-foundations/order-of-volatility.md) already established the core principle: memory sits above disk and just about everything else in urgency, because it disappears on reboot or power loss and nothing recovers it after that.

## Live acquisition (physical or traditional VM hosts)

Tools like Magnet RAM Capture, WinPMEM, and FTK Imager's memory-capture mode run *on* the live, potentially-compromised host and write RAM contents out to a file.

- **Footprint matters.** The acquisition tool itself uses memory and CPU while running, which is an unavoidable, small amount of contamination — prefer lightweight, purpose-built tools over anything heavier, and document exactly what you ran and when as part of your [evidence handling](../00-foundations/evidence-handling.md) record.
- **Requires administrative/SYSTEM-level privileges** to access physical memory directly.
- **The data is a snapshot of something still moving.** Unlike a disk image, a memory capture represents a system that was actively changing state during acquisition — this is normal and expected, not a flaw in the capture.

## Offline acquisition (virtualized/cloud hosts)

This is where cloud and hybrid environments have a real advantage over physical hardware: if the host is a VM, **suspending or snapshotting it captures memory state directly** — the hypervisor-level snapshot file (`.vmem` for VMware, or the equivalent for other platforms) *is* a memory image, with zero acquisition-tool footprint on the guest OS at all. Where available, this is generally preferable to live in-guest acquisition.

## Supplementary sources worth knowing about

- **Hibernation file (`hiberfil.sys`)** — a compressed snapshot of memory at the moment the system last hibernated. Useful if a live capture wasn't possible and the system was hibernated at some point in the relevant window; requires decompression before analysis.
- **Page/swap file** — not a complete memory image, but can hold pages evicted from RAM that are no longer present in a live capture, making it a useful supplementary source rather than a primary one.

## Format notes

Raw/DD format is the most broadly compatible with [Volatility 3](volatility-process-analysis.md) and most other tooling; proprietary forensic formats (AFF4, EWF/E01) exist and carry useful embedded metadata but may need conversion depending on your toolchain.

!!! success "Baseline habit"
    Before running anything else on a live, suspected-compromised host — acquire memory first, using the lightest-footprint method available for that host's actual platform (hypervisor snapshot where possible, a purpose-built live tool otherwise).

<!-- BACKLINKS:START -->
## Referenced From

- [Module 3: Windows Memory Forensics](index.md)
- [Memory-Based File Recovery](../anti-forensics/memory-based-file-recovery.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — memory acquisition methodology)
