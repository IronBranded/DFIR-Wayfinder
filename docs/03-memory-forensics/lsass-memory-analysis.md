---
tags:
  - Memory Forensics
  - T1003
  - T1003.001
---

# LSASS Memory Analysis & Credential Theft

`lsass.exe` holds authentication material for every account that's touched the host — NTLM hashes, and depending on configuration, cached plaintext credentials and Kerberos tickets. It's the single highest-value credential-theft target on any Windows system, which is exactly why [Module 1's process-tree baseline](../01-windows-endpoint/process-trees.md) treats any deviation in its parentage as a top-priority signal, and why this page exists as its own module.

## Two paths attackers use, live vs. offline

**Live memory read.** A tool opens a handle to `lsass.exe` with read access sufficient to walk its memory directly and extract credential material without ever writing a dump file — this is what Sysmon Event ID 10 (`ProcessAccess`) is specifically designed to catch, particularly `GrantedAccess` values consistent with memory-read rights from a process with no legitimate reason to touch `lsass.exe` at all.

**Offline dump-and-crack.** Rather than reading live, an attacker dumps `lsass.exe`'s memory to a file and parses it somewhere else entirely — evading any monitoring on the live host the moment the dump leaves it. The best-known living-off-the-land method for this:

```
rundll32.exe C:\Windows\System32\comsvcs.dll, MiniDump <lsass_PID> C:\path\output.dmp full
```

This calls `comsvcs.dll`'s `MiniDump` export — a legitimate Windows DLL never intended for this purpose, but fully capable of it — to write a complete process dump using nothing but a built-in Windows binary. Requires `SeDebugPrivilege`. Variants of this technique reference the export by its ordinal number (`#24`) instead of by name specifically to dodge simple string-matching detections looking for the literal word "MiniDump."

## Where the evidence lives

- **Sysmon Event ID 10**, filtered to `TargetImage` = `lsass.exe`, looking for `GrantedAccess` values inconsistent with normal system activity
- **Command-line logging** (Security 4688 / Sysmon 1) for `rundll32.exe` invocations referencing `comsvcs.dll` alongside `MiniDump` or its ordinal equivalent, `full`, and an output path
- In a memory capture: the [`handles`](injected-code-detection.md) plugin to identify what process holds a handle to `lsass.exe` and with what access rights; `malfind`/`vadinfo` against `lsass.exe` itself if code was injected *into* it rather than just read from it

!!! danger "Red flag"
    Any non-system process opening `lsass.exe` with memory-read access, or a `rundll32.exe` command line referencing `comsvcs.dll` together with a dump-related export and output path.

## Worth knowing about built-in mitigations

Modern Windows (particularly newer enterprise-joined 11 builds) increasingly ships with **LSASS Protected Process Light (PPL)** and **Credential Guard** enabled by default, both of which meaningfully raise the bar against direct memory-read techniques — confirm these are actually enabled in your environment rather than assumed, since older builds and certain configurations don't have them on by default.

## ATT&CK mapping

[T1003.001 (OS Credential Dumping: LSASS Memory)](https://attack.mitre.org/techniques/T1003/001/).

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [Operationalizing Threat Intelligence](../00-foundations/threat-intelligence-operationalization.md)
- [Module 3: Windows Memory Forensics](index.md)
- [Malware Triage Methodology](malware-triage-methodology.md)
- [Advanced Hunting with KQL](../07-defender-suite/advanced-hunting-kql.md)
- [Case Study: Domain Compromise, End to End](../case-studies/domain-compromise-case-study.md)
- [Glossary](../glossary.md)

<!-- BACKLINKS:END -->

## Sources

- LOLBAS Project — `comsvcs.dll`
- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — credential theft detection)
- MITRE ATT&CK — T1003.001
