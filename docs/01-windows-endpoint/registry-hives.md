---
tags:
  - Windows Endpoint
  - T1003
---

# Artifact: Registry Hives

## What it is / where it lives

This page covers the hives themselves as artifacts — what they are, where they live, and how to get into them offline. Specific *persistence* mechanisms stored inside the registry (Run keys, services, etc.) are cataloged separately in the [Persistence Catalog](../05-persistence/index.md) so they aren't explained twice.

| Hive | Disk location | Loaded as |
|---|---|---|
| `SYSTEM` | `%SystemRoot%\System32\config\SYSTEM` | `HKLM\SYSTEM` |
| `SOFTWARE` | `%SystemRoot%\System32\config\SOFTWARE` | `HKLM\SOFTWARE` |
| `SAM` | `%SystemRoot%\System32\config\SAM` | `HKLM\SAM` |
| `SECURITY` | `%SystemRoot%\System32\config\SECURITY` | `HKLM\SECURITY` |
| `NTUSER.DAT` | `C:\Users\<username>\NTUSER.DAT` | `HKCU` (per logged-on user) |
| `UsrClass.dat` | `C:\Users\<username>\AppData\Local\Microsoft\Windows\UsrClass.dat` | `HKCU\Software\Classes` |

`Amcache.hve` is a standalone hive with its own [dedicated page](amcache.md) since its structure and forensic use are different enough to warrant separate treatment.

## A detail worth knowing: ControlSets

`SYSTEM` typically contains multiple `ControlSet00N` keys (backup/alternate configurations) plus `CurrentControlSet`, which isn't a real key — it's a pointer. Check `SYSTEM\Select\Current` to find out which numbered `ControlSet` is actually active; when working from an offline hive, `CurrentControlSet` won't resolve on its own, so you need this value to know which `ControlSet00N` to actually examine.

## Normal baseline

All hives present, intact, and loadable without repair. `SYSTEM\Select\Current` pointing at a `ControlSet` that exists and looks complete.

## Red flags

- A hive that's missing, zero-length, or requires repair to load — Windows hives don't normally end up in this state on their own.
- Recent modification timestamps on hive files (`SYSTEM`, `SOFTWARE`, `SAM`) that don't correlate with any legitimate patching, configuration, or update activity around that time.
- Discrepancies between `ControlSet00N` keys — a persistence mechanism or configuration change present in one ControlSet but not another can indicate an attacker made a change that didn't fully propagate, or is trying to hide a change in a non-active set.

!!! success "Baseline"
    All expected hives present and loadable, with `CurrentControlSet` resolving cleanly to a complete, unremarkable `ControlSet00N`.

!!! danger "Red flag"
    Missing or corrupted hives, unexplained modification timestamps, or inconsistency between ControlSets.

## How to collect it

Hives are locked while Windows is running — pull them from an offline image, a live triage collection tool, or a Volume Shadow Copy. Eric Zimmerman's `Registry Explorer` (GUI) and `RECmd` (command line) are the standard tools for offline loading and bulk parsing/searching across hives.

## ATT&CK mapping

The registry is a **data source**, not a technique — it underlies a huge share of the [Persistence Catalog](../05-persistence/index.md) (Run keys, services, COM hijacking, and more all live here), plus credential material in `SAM`/`SECURITY` relevant to [T1003 (OS Credential Dumping)](https://attack.mitre.org/techniques/T1003/).

<!-- BACKLINKS:START -->
## Referenced From

- [Module 1: Windows Endpoint Forensics](index.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR500 — registry forensics is a core module; see also the SANS Windows Registry Forensics poster)
- Eric Zimmerman's forensic tools (Registry Explorer, RECmd)
