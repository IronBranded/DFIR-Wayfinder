---
tags:
  - Windows Endpoint
  - T1070
  - T1070.006
  - T1204
---

# Artifact: Shimcache (AppCompatCache)

## What it is / where it lives

Shimcache — formally the Application Compatibility Cache — tracks executables Windows has evaluated for compatibility shimming. It's one of the most frequently cited Windows artifacts in DFIR, and also one of the most frequently misused, because what it actually proves has changed across Windows versions.

- **Location:** `HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\AppCompatCache`
- **Capacity:** roughly 1,024 entries on modern Windows; oldest entries are evicted once full.
- **Persistence timing:** the cache lives in memory while the system runs and is only flushed to the registry **at shutdown**. A hard power-off or an abrupt VM termination can lose the most recent entries entirely.
- **Contents:** file path, file size, and a timestamp — and this is where the misunderstanding usually starts.

## The nuance that matters most

The recorded timestamp is the executable's **last-modified time** (its `$STANDARD_INFORMATION` mtime), not the time it ran. A Shimcache entry from three years ago doesn't mean an attacker had access three years ago — it means the file's on-disk modified timestamp reads three years ago.

The bigger issue is the **execution flag**. Windows XP's Shimcache reliably indicated actual execution. Vista through 8.1 kept a usable-but-weaker "insert flag." **Starting with Windows 10, the execution flag was removed entirely** — a Shimcache entry on a Windows 10/11 host tells you a file was *examined* (which, in practice, often but not always means it ran — even being viewed in File Explorer can trigger an entry), not that it was confirmed to execute.

## Normal baseline

A large, steadily-populated cache reflecting normal software installed and used on the host, with modified timestamps that track sensibly against when that software was actually deployed.

## Red flags

- The same filename appearing with **multiple different modified timestamps** — a strong renaming/re-staging indicator, since re-modifying or renaming a binary forces a fresh Shimcache entry.
- A **recorded modified timestamp that doesn't match the actual file's current metadata** on disk — evidence the file's timestamps were altered after the Shimcache entry was written (a timestomping signal, cross-check against [`$MFT`](mft.md)).
- Known offensive tooling present in the cache at all, regardless of what the (unreliable) execution flag says — treat presence as "worth investigating further," never dismiss it just because Windows 10/11 won't confirm execution for you.

!!! success "Baseline"
    Entries consistent with known-installed software, with modified timestamps that make sense against deployment history.

!!! danger "Red flag"
    The same executable name recurring with different modified timestamps, a mismatch against the file's actual current metadata, or presence of known-bad tooling.

## How to collect it

Extract the `AppCompatCache` registry value from the `SYSTEM` hive (from an offline image, since the live value in memory may be more current than what's on disk pre-shutdown) and parse with Eric Zimmerman's `AppCompatCacheParser`:

```
AppCompatCacheParser.exe -f C:\triage\SYSTEM --csv C:\triage\output
```

!!! tip "Never rely on Shimcache alone for an execution claim"
    On Windows 10/11, corroborate every Shimcache-based execution claim with [Prefetch](prefetch.md), [Amcache](amcache.md), or an Event ID 4688 / Sysmon Event ID 1 process-creation record. Shimcache alone proves *presence*, not *execution*, on modern Windows.

## ATT&CK mapping

Data source supporting [T1204 (User Execution)](https://attack.mitre.org/techniques/T1204/) (with the caveats above) and useful corroboration for [T1070.006 (Timestomp)](https://attack.mitre.org/techniques/T1070/006/) via the modified-timestamp mismatch pattern.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 1: Windows Endpoint Forensics](index.md)
- [Process Analysis: Finding What's Hidden](../03-memory-forensics/volatility-process-analysis.md)
- [Glossary](../glossary.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR500 / FOR508 — execution-evidence artifacts)
- Eric Zimmerman's forensic tools (AppCompatCacheParser)
