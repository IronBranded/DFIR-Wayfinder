---
tags:
  - PowerShell
---

# PowerShell Forensics: Evasion Detection

This page covers three ways attackers try to defeat PowerShell's own defensive features, and — consistent with every other page in this guide — stays strictly on the detection side: how to recognize an evasion *attempt*, not how to build one.

## AMSI (Antimalware Scan Interface)

AMSI is the interface that lets an antivirus/EDR engine inspect script content — including PowerShell, VBScript, and JScript — **after deobfuscation, immediately before execution**, which is exactly the point in the pipeline where [obfuscated code](obfuscation-decoding.md) has already been unwound back to its real, executable form. This is what makes AMSI meaningfully more effective against obfuscation than a static, on-disk file scan: it doesn't matter how the script arrived or how it was disguised in transit, because AMSI sees what's actually about to run.

Because of this, AMSI is a high-value target for evasion, and known bypass-attempt *categories* are worth being able to recognize in telemetry:

- **In-memory patching of `amsi.dll`** — modifying the loaded AMSI module in a process's memory to make scan calls silently report "clean" regardless of content. Detectable via unusual memory-permission changes or unexpected modifications to `amsi.dll`'s in-memory code pages — see [Memory Forensics](../03-memory-forensics/index.md) for the underlying analysis techniques.
- **PowerShell downgrade to version 2** — see below; PowerShell v2 predates AMSI integration entirely, so running under v2 sidesteps AMSI without needing to touch or patch it at all.
- **Reflection-based tampering** with the `System.Management.Automation.AmsiUtils` class's internal state via .NET reflection, rather than patching memory directly.

!!! danger "Red flag"
    Evidence of memory modification to `amsi.dll` in a PowerShell process, or any process attempting to load PowerShell under version 2 on a modern system.

## PowerShell version-downgrade attacks

PowerShell maintains backward compatibility — if Windows PowerShell 2.0 is still installed (it's been deprecated for years, but often isn't actually *removed*), a script can explicitly request it:

```
powershell.exe -version 2 -Command "..."
```

Version 2 predates both AMSI and Script Block Logging, so this single flag, if it succeeds, silently drops an attacker back to an execution environment with essentially none of the modern defensive telemetry this guide otherwise relies on.

**Detection is refreshingly simple:** in any environment where PowerShell v2 has been properly removed (Microsoft's own recommendation), an attempt to invoke `-version 2` fails outright and that failure is itself the detection. In environments where v2 is still present for legacy-compatibility reasons, any `-version 2` invocation at all is worth alerting on directly — legitimate modern administrative work essentially never needs it.

!!! danger "Red flag"
    Any `powershell.exe -version 2` invocation, full stop, in a modern environment.

## Constrained Language Mode (CLM)

CLM restricts PowerShell to a safe subset of the language — blocking direct .NET method invocation, COM object creation, and other capabilities commonly abused for post-exploitation — typically deployed alongside AppLocker or WDAC as part of a broader application-control strategy.

Detecting an *escape attempt* matters more than explaining the restriction itself: look for repeated, rapid-fire errors referencing blocked language elements in Script Block Logging (4104) output immediately preceding a successful, unrestricted-looking command — that pattern is consistent with an attacker iterating through known CLM bypass techniques until one works. A session that starts constrained and later executes something CLM should have blocked is a strong signal regardless of which specific bypass method got them there.

!!! danger "Red flag"
    A cluster of CLM-restriction errors in 4104 logging immediately followed by execution of a command CLM should have blocked.

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [Module 4: PowerShell Forensics](index.md)
- [Glossary](../glossary.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 / FOR610 — PowerShell attack detection)
- Microsoft Learn — AMSI overview, `about_Language_Modes`
