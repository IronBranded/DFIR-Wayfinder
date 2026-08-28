Every lesson in this module so far has covered a control. This one covers what an attempt to defeat any of them actually looks like from the outside — not how to build a bypass, but the forensic signature it leaves regardless of whether it succeeds.

> [!PLAIN]
> "Observable" is the operative word throughout this lesson. An attacker attempting to disable, blind, or route around Defender still has to *do* something on the host to try it — and that action, successful or not, is usually the highest-confidence single indicator available in the entire intrusion.

## The PowerShell-level attempts, recapped

Two techniques from Level 3 belong directly in this list, and are worth reading as a pair rather than in isolation: the `Set-MpPreference`/`Add-MpPreference` [tampering cluster](#/lesson/l3-04-powershell-malicious-patterns) attempts to disable or exclude via legitimate, documented cmdlets; the [AMSI bypass pattern](#/lesson/l3-03-powershell-evasion) attempts to blind the specific interface PowerShell calls into Defender through, without touching Defender's configuration at all. Both operate at the software layer — neither requires kernel access.

## Driver-level: BYOVD as EDR-blinding, not just privilege escalation

[Level 2's BYOVD lesson](#/lesson/l2-13-byovd-loldrivers) covers Bring Your Own Vulnerable Driver primarily as a local-privilege-escalation path. It has a second, distinct use here: a vulnerable driver with kernel access can terminate or blind Defender's own kernel-mode components directly — a fundamentally different threat model than a PowerShell cmdlet, since it operates below the layer any user-mode tampering protection can see. The observable is the same either way: [Sysmon Event ID 6 (Driver Loaded)](#/lesson/l1-11-sysmon-deployment) for an unsigned or known-vulnerable driver, immediately followed by Defender's own telemetry simply going quiet.

> [!WARNING]
> A gap in Defender's own event log, with no 5001 (real-time protection disabled) event explaining it, is a stronger signal than a 5001 event itself — it suggests the tampering happened below the layer that would normally log its own disabling.

## Registry-based disabling

Beyond the PowerShell cmdlet route, the same settings are directly reachable through the registry — `DisableAntiSpyware` and `DisableRealtimeMonitoring` under `HKLM\SOFTWARE\Policies\Microsoft\Windows Defender` — a route that leaves a completely different evidence trail (a registry key write, visible in the hive itself and via Sysmon's registry-event coverage) rather than a command line or script block. An environment monitoring PowerShell activity closely but not registry writes has exactly the kind of blind spot [Level 3's non-PowerShell-execution lesson](#/lesson/l3-19-non-powershell-execution) warns about for script-host evasion — a well-covered layer sitting directly next to a genuinely uncovered one.

## Tamper Protection bypass attempts

Tamper Protection, [covered in the previous lesson](#/lesson/l6-19-attack-surface-reduction), is specifically designed to make every technique above fail even from a local administrator account. An *attempt* against a Tamper-Protected host — any of the cmdlets, registry writes, or service-control actions above occurring but having no actual effect on Defender's running state — is worth flagging as its own distinct event: the intent was there even though the control held. Confirming Tamper Protection actually held (Defender still active, still logging, immediately after a tampering attempt) matters as much as detecting the attempt itself.

## Process-level: unhooking and ETW patching

At the most advanced end, tooling can attempt to remove the API hooks a security product places inside a monitored process's own memory space ("unhooking"), or patch the process's own ETW provider so its telemetry stops being generated — both covered at the concept level in [Level 3's evasion-detection lesson](#/lesson/l3-03-powershell-evasion) for the PowerShell-specific case. The general principle extends past PowerShell: a technique that succeeds at blinding telemetry *at the source* is only visible through whatever keeps recording independently of that source — which is exactly why this academy treats Sysmon, Defender's own operational log, and Windows' native event logs as separate, cross-checking sources rather than one combined pipeline.

## Normal baseline

None of the techniques in this lesson have a legitimate business justification for appearing outside a documented Defender migration, an approved driver-signing exception process, or authorized red-team/purple-team activity with prior notice to the SOC. Unlike several earlier lessons in this academy, there's very little baseline noise to calibrate against here — the bar for investigating any single instance is lower than usual.

## Red flags

- **A Sysmon Event ID 6 (unsigned or known-vulnerable driver load) immediately followed by a gap in Defender's own Operational log**, with no 5001 event bridging the two.
- **A `DisableRealtimeMonitoring`/`DisableAntiSpyware` registry write** with no corresponding GPO/Intune policy push as its source.
- **Any tampering attempt against a Tamper-Protected host that appears to have had no effect** — still worth a full investigation of intent, even where the control held.
- **Two or more techniques from this lesson attempted in sequence on the same host** — an attacker working down a list after an earlier attempt failed is materially different from one isolated event.

## How to collect it

Cross-referencing is the actual method here, more than any single source: [Sysmon Event ID 6](#/lesson/l1-11-sysmon-deployment) for driver loads, the registry hive directly (live, or offline via Registry Explorer) for the `DisableRealtimeMonitoring`/`DisableAntiSpyware` values, `Microsoft-Windows-Windows Defender/Operational` for 5001/5007 and any gap in routine detection volume, and [Script Block Logging](#/lesson/l3-01-powershell-logging) for the cmdlet-level attempts. No single source in this list is sufficient alone — that's the point of the lesson.

## ATT&CK mapping

Every technique here maps to [Impair Defenses: Disable or Modify Tools (T1562.001)](https://attack.mitre.org/techniques/T1562/001/); the BYOVD-specific driver route additionally maps to [Exploitation for Privilege Escalation (T1068)](https://attack.mitre.org/techniques/T1068/) via the same vulnerable-driver mechanism [Level 2 covers](#/lesson/l2-13-byovd-loldrivers) for its escalation use.

> [!TIP]
> This closes out the Defender-focused content in this level. Advanced Hunting and detection engineering — querying this telemetry directly rather than reading individual events one at a time — pick up in the lessons that follow.

## Sources

- [Microsoft Learn — Protect security settings with tamper protection](https://learn.microsoft.com/en-us/defender-endpoint/prevent-changes-to-security-settings-with-tamper-protection)
- LOLDrivers project (loldrivers.io) — the community-maintained catalog of known-vulnerable drivers referenced throughout Level 2's BYOVD lesson
- MITRE ATT&CK — T1562.001: Impair Defenses: Disable or Modify Tools
