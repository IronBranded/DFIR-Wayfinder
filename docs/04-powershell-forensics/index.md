---
tags:
  - PowerShell
---

# Module 4: PowerShell Forensics

PowerShell is the single highest-leverage execution surface on modern Windows: it's trusted, pre-installed, deeply capable, and — critically — able to run entirely in memory. A script that never touches disk never generates a [Prefetch](../01-windows-endpoint/prefetch.md) entry, never gets an AV file-scan hit, and leaves no artifact for [Module 1](../01-windows-endpoint/index.md)'s filesystem techniques to find. This module is about the logging and analysis techniques that work anyway.

## Module status: complete

- [x] [PowerShell Logging](powershell-logging.md) — the four logging mechanisms, why Script Block Logging (4104) matters most, what normal volume looks like
- [x] [Obfuscation & Decoding](obfuscation-decoding.md) — the hands-on walkthrough, with verified worked examples: `-EncodedCommand`, compression, character codes, string reassembly, backticks
- [x] [Evasion Detection](evasion-detection.md) — AMSI, version-downgrade attacks, Constrained Language Mode escape, all at the detection level
- [x] [Malicious Cmdlet Patterns](powershell-malicious-patterns.md) — the reference list of what to alert on, and why context matters more than any single pattern

!!! tip "How this module is scoped"
    Everything here is written for the defender reading logs and memory captures after the fact, or building detections ahead of time — not for writing evasive PowerShell. Where offensive technique *categories* are named (AMSI bypass, downgrade attacks), the content stops at "here's the detection signature," consistent with every other module in this guide.

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [Order of Volatility](../00-foundations/order-of-volatility.md)
- [Module 3: Windows Memory Forensics](../03-memory-forensics/index.md)
- [Network Artifacts in Memory](../03-memory-forensics/network-memory-artifacts.md)
- [Enterprise DFIR Field Guide](../index.md)

<!-- BACKLINKS:END -->

