Most persistence gets you code execution and nothing more. This one gets you code execution *inside the process that handles authentication* — so the same mechanism that survives reboot also hands over every credential used to log in afterward. Persistence and credential theft from a single registry value.

## Security Support Providers

LSASS loads authentication modules — Security Support Providers — listed in the registry:

```
HKLM\SYSTEM\CurrentControlSet\Control\Lsa\Security Packages
HKLM\SYSTEM\CurrentControlSet\Control\Lsa\OSConfig\Security Packages
```

A DLL registered here is loaded into `lsass.exe` at boot. Because SSPs exist precisely to participate in authentication, a malicious one sits in the path where credentials are handled — able to observe plaintext passwords as users log on, without ever needing to dump [LSASS memory](#/lesson/l3-09-lsass-memory-analysis) or trigger the access patterns that detection watches for.

## The known-good list

This is one of the rare artifacts with a short, memorizable baseline. Expected values are roughly:

```
kerberos   msv1_0   schannel   wdigest   tspkg   pku2u   negoexts   cloudap
```

Exact contents vary by Windows version and configuration — `cloudap` appears on Entra-joined systems, `wdigest` may be absent on hardened builds. But the list is short and stable, which makes **anything outside it immediately investigable**. This is a comparison you can perform in seconds.

## The memory-only variant

Mimikatz's `misc::memssp` injects an SSP directly into running LSASS memory with **no registry modification at all**. It captures credentials for as long as the system stays up and disappears on reboot — so it is not persistence in the usual sense, and a registry-only check will never find it. Detecting it requires either [memory analysis](#/lesson/l3-05-injected-code-detection) or an image-load event showing an unexpected DLL entering `lsass.exe`.

## What actually stops it

**LSA Protection (RunAsPPL)** makes LSASS a Protected Process Light, which means it will only load **signed** modules. That blocks both variants above: an unsigned SSP DLL cannot load into a protected LSASS regardless of registry state. This is the same control covered in [LSASS memory analysis](#/lesson/l3-09-lsass-memory-analysis), and it is worth verifying is actually enabled rather than assumed.

> [!TIP]
> LSA Protection failing to load an unsigned module generates its own event — `Microsoft-Windows-CodeIntegrity/Operational` Event ID 3033 records a blocked load. On a Tamper-Protected, LSA-Protected host, that event is the sound of this attack failing, and it is worth alerting on.

## Normal baseline

`Security Packages` contains only the standard providers listed above. Every module loaded by `lsass.exe` is Microsoft-signed and resides in `System32`. LSA Protection is enabled fleet-wide. No unexpected DLLs appear in `lsass.exe`'s module list.

## Red flags

- **Any entry in `Security Packages` outside the known-good list** — the single highest-value check in this lesson.
- **An unsigned or non-Microsoft DLL loaded into `lsass.exe`** (Sysmon Event ID 7 with `lsass.exe` as the target process).
- **CodeIntegrity Event ID 3033** showing a blocked load into LSASS.
- **A modification to the `Lsa` key with a `LastWriteTime` inside a suspected intrusion window.**
- **LSA Protection found disabled** where policy says it should be on.

## How to collect it

Read the value directly and compare against the baseline:

```
Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa" -Name "Security Packages"
```

Check both the `Lsa` key and its `OSConfig` subkey — they are separate values and an attacker may modify either. Confirm LSA Protection with `Get-ItemProperty "HKLM:\SYSTEM\CurrentControlSet\Control\Lsa" -Name RunAsPPL`. Offline, read the `SYSTEM` hive, taking the ControlSet that was actually live at boot. Sysmon Event ID 7 filtered to `lsass.exe` covers the module-load side, including the memory-only variant.

## ATT&CK mapping

[Boot or Logon Autostart Execution: Security Support Provider (T1547.005)](https://attack.mitre.org/techniques/T1547/005/), with the credential-capture consequence mapping to [OS Credential Dumping (T1003)](https://attack.mitre.org/techniques/T1003/).

## Sources

- MITRE ATT&CK — T1547.005
- [Microsoft Learn — Configuring Additional LSA Protection](https://learn.microsoft.com/en-us/windows-server/security/credentials-protection-and-management/configuring-additional-lsa-protection)
- Windows Internals (Russinovich, Solomon, Ionescu) — the Local Security Authority and authentication packages
