---
tags:
  - Memory Forensics
  - T1057
---

# Mutex (Mutant) Analysis

## What it is, and why malware authors create them

A mutex (Windows kernel object type `Mutant`) exists to prevent race conditions — normally, one piece of software using it to make sure two threads don't touch the same resource at once. Malware authors use the exact same mechanism for a different reason: **to make sure their own malware doesn't run twice on the same host.** On startup, malware commonly checks for a specific, hardcoded mutex name; if it already exists, a prior copy is already running, and the new instance exits without doing anything (avoiding the resource contention and increased visibility of multiple copies fighting over the same host).

That hardcoded name is the forensic payoff. Unlike a file hash, which changes with every recompile, a malware family's mutex name is often part of its actual source code and stays consistent across samples and campaigns — making it a more durable fingerprint than the binary itself.

## Where the evidence lives, and how to pull it

Named mutexes a process holds show up in its open handle table (the same EPROCESS-level structure referenced in [EPROCESS Internals](eprocess-internals.md)).

- **`windows.mutantscan`** — scans memory directly for mutex/`Mutant` objects, independent of any process's handle list — the mutex-object equivalent of `psscan`, and the better starting point when you don't yet know which process to look at.
- **`windows.handles`**, filtered to handle type `Mutant` and a specific PID — once you already have a process of interest (from [Process Analysis](volatility-process-analysis.md) or [Thread Analysis](thread-analysis.md)), this shows exactly which named mutexes that process is holding.

## How you actually use this in an investigation

Two distinct uses, and they answer different questions:

- **Fingerprinting.** A mutex name that's distinctive, non-default, and not something Windows itself or known-legitimate software creates is worth searching against threat intelligence sources — a matching, previously-reported name can identify a malware family directly, which is a much faster path to understanding scope and behavior than reverse-engineering a sample from scratch.
- **Cross-host hunting.** Once you have a suspected malicious mutex name from one host, it becomes a searchable indicator across the rest of the environment — pull `windows.mutantscan` output from every host's memory capture (or deploy an EDR custom-detection rule keyed on the same name) to find every other machine the same infection touched, which is often faster and more reliable than searching for the file itself, since the file may have been renamed or deleted while the mutex-creation behavior stays constant.

## What normal looks like, so you don't chase your own tail

Plenty of legitimate software creates named mutexes for entirely mundane reasons — single-instance application locks (many consumer apps use a mutex specifically to prevent a user from accidentally launching themselves twice) are extremely common and not inherently suspicious. The distinguishing question isn't "does this process hold a mutex" — almost everything does — it's whether the *name* is generic-and-explainable (often containing the vendor or product name plainly) versus deliberately obfuscated, random-looking, or already associated with known malicious activity elsewhere.

!!! danger "Red flag"
    A mutex name held by a process already flagged by other means (an [injected thread](thread-analysis.md), a [process-tree anomaly](../01-windows-endpoint/process-trees.md)) — especially one that's randomized-looking or that a threat-intel search returns hits for.

## Turning this into report language

A mutex name is one of the more report-friendly findings in memory forensics precisely because it doubles as an attribution data point: *"The compromised host's memory image contained a `Mutant` object named `Global\\{8F3A2C10-...}` held by the process at PID 4412; this mutex name is not associated with any known legitimate software installed on this host and is consistent with malware using it as a single-instance marker. The same mutex name was subsequently found on two additional hosts during the environment-wide sweep, establishing common-cause infection across all three."* That's a finding that directly supports a scope statement in an executive summary — see [Reporting & Communication](../00-foundations/reporting-and-communication.md) — without needing the reader to understand anything about memory forensics to grasp its significance: *the same infection was found on three machines, not one.*

## ATT&CK mapping

Most directly a data source supporting [T1057 (Process Discovery)](https://attack.mitre.org/techniques/T1057/) and general malware-family attribution rather than mapping to a single technique itself — it's an artifact of *how* malware avoids re-infection, not a technique in its own right.

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [EPROCESS Internals](eprocess-internals.md)
- [Module 3: Windows Memory Forensics](index.md)
- [Malware Triage Methodology](malware-triage-methodology.md)

<!-- BACKLINKS:END -->

## Sources

- Volatility 3 documentation (volatility3.readthedocs.io) — `windows.mutantscan`, `windows.handles`
- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508/FOR610 — malware artifact analysis in memory)
