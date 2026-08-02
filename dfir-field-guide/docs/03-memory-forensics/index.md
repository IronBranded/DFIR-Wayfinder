# Module 3: Windows Memory Forensics

Memory is the most volatile evidence tier that's still practical to capture in full (see [Order of Volatility](../00-foundations/order-of-volatility.md)) — and it's often the *only* place fileless techniques (see [Module 4](../04-powershell-forensics/index.md)) ever leave a trace, precisely because they never touch disk.

## Building now

- [ ] Acquisition: tools and live-vs-offline tradeoffs
- [ ] Volatility 3 workflow — `pslist` / `pstree` / `psscan`, and why the difference between them matters for hidden processes
- [ ] Detecting unlinked/hidden processes
- [ ] `malfind`, `ldrmodules`, `vadinfo` — finding injected code
- [ ] LSASS access patterns and credential-theft artifacts in memory
- [ ] Injection techniques: process hollowing, process doppelgänging, reflective DLL injection — what each looks like in a memory capture
- [ ] `netscan` and in-memory network indicators

This module pairs directly with [Module 4: PowerShell Forensics](../04-powershell-forensics/index.md) — most of what makes fileless PowerShell dangerous is precisely that it only ever exists in the region this module covers.
