---
tags:
  - Persistence
  - Endpoint
  - T1197
---

# Persistence: BITS Jobs

**ATT&CK:** [T1197](https://attack.mitre.org/techniques/T1197/) — BITS Jobs

## The mechanism

The Background Intelligent Transfer Service exists to move files in the background — reliably, resumably, and throttled — for things like Windows Update. It's a signed, trusted Windows component, which makes abusing it for download or persistence unusually stealthy: traffic and activity attributed to BITS doesn't attract the same scrutiny as an unfamiliar process reaching out to the internet. BITS jobs can also be configured to run a program automatically on completion or on error, giving an attacker a scheduled-execution mechanism that isn't a Scheduled Task and isn't a Run key.

- **Created via:** `bitsadmin.exe` (deprecated but still functional), the `BitsTransfer` PowerShell module, or the underlying COM interface directly

## Where the evidence lives

`Microsoft-Windows-Bits-Client/Operational` event log — records job creation, transfer activity, and any configured notification command. This is the primary place to look; BITS jobs don't create the kind of registry or Run-key footprint most other persistence mechanisms do.

## Detection approach

Alert on BITS jobs configured with a `SetNotifyCmdLine` (the completion-command feature) — legitimate BITS usage overwhelmingly doesn't need this, so its mere presence is a strong filter. Also flag BITS jobs downloading from destinations outside your normal update/content-delivery infrastructure, and any use of `bitsadmin.exe` at all in environments where it's been deprecated in favor of the PowerShell module — its continued use can itself be a weak signal of older tooling or an unmaintained attacker toolkit.

!!! danger "Red flag"
    A BITS job with a configured notification command, or a transfer job pointed at an unfamiliar external destination.

## Cleanup

Enumerate and remove the job (`bitsadmin /list /allusers` to find it, `bitsadmin /cancel <jobid>` to remove it, or the equivalent `Get-BitsTransfer` / `Remove-BitsTransfer` cmdlets), and treat the configured notification command as you would any other discovered piece of attacker tooling — it may point directly at a staged payload or C2 endpoint.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 5: Persistence Catalog](index.md)

<!-- BACKLINKS:END -->

## Sources

- [MITRE ATT&CK — T1197](https://attack.mitre.org/techniques/T1197/)
- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — living-off-the-land persistence)
