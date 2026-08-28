The previous lesson covered Defender AV's detection architecture. This one covers the layer that acts *before* detection is even needed — rule-based blocking of specific behaviors known to precede compromise, and the control that stops an attacker from simply turning any of it off.

## What Attack Surface Reduction rules actually target

**Attack Surface Reduction (ASR)** rules block specific, named behaviors rather than scanning file content — Office applications spawning child processes, script-based execution of downloaded content, and executable content arriving via email or webmail, among others. One rule is worth knowing by name specifically, given how central credential theft is throughout this academy: **"Block credential stealing from the Windows local security authority subsystem (lsass.exe)"** — a rule that exists purely to stop the LSASS-access pattern [Level 5's memory forensics content](#/lesson/l5-08-lsass-memory-analysis) covers from the artifact side.

## Audit mode vs. Block mode, and the event pair

Every ASR rule can run in **Audit mode** (logs what *would* have been blocked, without actually blocking it — the recommended rollout starting point) or **Block mode** (actually enforces). Each mode writes its own event ID: (cite index="9-1">event 1121 fires when a rule triggers in Block mode, and event 1122 fires when a rule triggers in Audit mode</cite>, both in the same `Microsoft-Windows-Windows Defender/Operational` channel as the detection events from the previous lesson.

| Event | Meaning |
|---|---|
| 1121 | ASR rule fired in Block mode — the action was stopped |
| 1122 | ASR rule fired in Audit mode — the action was logged, not stopped |

> [!IMPORTANT]
> An environment still running ASR rules in Audit mode has *visibility* into what would have been blocked, but not actual prevention. A 1122 event for the LSASS-credential-theft rule is exactly as urgent as a 1121 would be — the only difference is that Audit mode let it proceed.

## Tamper Protection

**Tamper Protection** is the control that specifically stops the pattern [Level 3's malicious-cmdlet-patterns lesson](#/lesson/l3-04-powershell-malicious-patterns) covers: `Set-MpPreference -DisableRealtimeMonitoring`, `Add-MpPreference -ExclusionPath`, and direct registry or service-level tampering all fail against a properly Tamper-Protected host, regardless of the account's local privilege level — Tamper Protection is specifically designed to resist changes made by a local administrator, not just a standard user, because a compromised admin account is exactly the threat model it exists for.

> [!PLAIN]
> Local administrator rights normally let you change almost anything about how a security product on that machine behaves. Tamper Protection is a deliberate exception — a setting that a cloud-managed policy controls, which local admin rights alone can't override, precisely because "the attacker got local admin" is one of the most common points an intrusion reaches.

## Normal baseline

ASR rules are deployed in Block mode fleet-wide (Audit mode is a legitimate, time-boxed rollout phase, not a permanent steady state), exclusions are minimal, scoped to specific paths or processes rather than entire drives or user profiles, and documented against a change-control record. Tamper Protection is enabled fleet-wide via cloud-managed policy, not configurable per-host.

## Red flags

- **A cluster of 1122 (Audit) events for the LSASS-credential-theft rule specifically**, rather than routine, low-severity rule triggers — audit mode masking what would otherwise be a hard block.
- **Wildcard or overly broad ASR exclusions** (an entire drive, an entire user profile) rather than a scoped path or process — a configuration change that quietly reopens coverage ASR was deployed to close.
- **A Tamper Protection disable attempt of any kind**, successful or not — there is essentially no legitimate business reason for this to happen outside a documented platform migration.
- **1121/1122 activity immediately followed by a 5007 exclusion-added event for the same path** — someone hit a real block, then engineered around it rather than reporting a false positive.

## How to collect it

`Get-WinEvent -LogName "Microsoft-Windows-Windows Defender/Operational" | Where-Object Id -in 1121,1122` live, or the same channel offline from an exported `.evtx`. The Microsoft Defender portal's Attack Surface Reduction rules report aggregates this fleet-wide with the specific rule name and triggering process already resolved, which is faster than reading raw event XML rule GUIDs by hand during triage.

## ATT&CK mapping

ASR itself is a mitigating control spanning many techniques rather than mapping to one; a *bypass or tampering attempt* against ASR or Tamper Protection maps to [Impair Defenses: Disable or Modify Tools (T1562.001)](https://attack.mitre.org/techniques/T1562/001/), the same technique underlying the entire Defender-tampering thread running through this level.

> [!TIP]
> Automated remediation — what actually happens once a threat clears detection and enforcement — is the next lesson, along with Live Response for cases where a human needs to act directly.

## Sources

- [Microsoft Learn — Understand and use attack surface reduction](https://learn.microsoft.com/en-us/defender-endpoint/overview-attack-surface-reduction)
- [Microsoft Learn — Protect security settings with tamper protection](https://learn.microsoft.com/en-us/defender-endpoint/prevent-changes-to-security-settings-with-tamper-protection)
