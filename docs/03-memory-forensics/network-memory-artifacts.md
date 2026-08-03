---
tags:
  - Memory Forensics
---

# Network Artifacts in Memory

## What it captures that a live `netstat` can't

Volatility's network-scanning plugin (`windows.netstat` in Volatility 3 — commonly still referred to by its Volatility 2 name, `netscan`, in training material and checklists) scans memory for network-connection tracking structures directly, rather than querying the live OS for currently-open connections. This means it can recover **connections that have already closed** by the time of acquisition, as long as the underlying structures haven't been overwritten yet — valuable precisely because a live `netstat` on the host, run after the fact, would show nothing for a connection that already tore down.

## Detection approach

Pull the connection list and correlate every entry against its owning PID — then cross-reference that PID against [`pslist`/`psscan`](volatility-process-analysis.md) findings and any available command-line data. The two questions that matter most:

- **Does this process have any legitimate reason to be making this connection?** A connection owned by a process with no business-network function reaching an unfamiliar external address is the core signal.
- **Is the owning PID even present in `pslist`?** A network connection tied to a PID that only shows up in `psscan` — i.e., a [hidden process](volatility-process-analysis.md) — is a particularly high-confidence finding, since it means whatever's making that connection went out of its way to not be visible through normal means.

This connects directly to [Module 4](../04-powershell-forensics/index.md)'s download-and-execute patterns — a fileless `IEX (New-Object Net.WebClient).DownloadString(...)` chain produces exactly the kind of connection this plugin is built to catch, especially if the process has already exited by the time you're looking and a live `netstat` would show nothing at all.

!!! danger "Red flag"
    A network connection owned by a process with no legitimate reason to be making outbound connections, or one owned by a PID that doesn't appear in `pslist` at all.

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [Module 3: Windows Memory Forensics](index.md)
- [Malware Triage Methodology](malware-triage-methodology.md)
- [Process Analysis: Finding What's Hidden](volatility-process-analysis.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 / FOR572 — network artifact correlation)
- Volatility 3 documentation (volatility3.readthedocs.io)
