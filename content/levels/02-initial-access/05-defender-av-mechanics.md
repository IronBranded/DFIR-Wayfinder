Defender is running on nearly every host in scope of this academy, whether an organization thinks of it as "their EDR" or treats it as background noise underneath a third-party product. Before treating its output as just another log source, it's worth understanding what it's actually doing — because what it catches, what it misses, and what its own tampering looks like all follow directly from its architecture.

> [!PLAIN]
> "MDE" is Microsoft Defender for Endpoint — the cloud-managed EDR platform. "Defender AV" (Microsoft Defender Antivirus) is the antivirus engine underneath it, and also ships standalone on any Windows host regardless of whether MDE onboarding ever happened. Every MDE-onboarded host is running Defender AV; not every host running Defender AV is enrolled in MDE.

## Three protection layers, not one

**Signature-based detection** is the traditional layer — local definition files, updated on a schedule, effective offline and against known-bad hashes/patterns. **Cloud-delivered protection** (built on Microsoft's cloud ML/reputation service) queries Microsoft's cloud in near-real time for samples that don't match a local signature — meaning detection coverage genuinely differs between a connected host and an isolated or air-gapped one, which matters when scoping an investigation on a segmented network. **Behavior monitoring / real-time protection** watches process behavior as it happens rather than file content at rest — this is the layer that actually intercepts the fileless, in-memory PowerShell activity covered in Level 3, since there's often no file for the first two layers to ever scan.

## Passive mode vs. active mode

Defender AV can run in **active mode** (fully engaged — scanning, logging, and remediating) or **passive mode** (still scanning and logging, but a third-party product is configured as the primary remediation engine, so Defender doesn't act on what it finds). This distinction matters directly for how you read the event pair below: a 1116 detection with no matching 1117 remediation can mean "detected but explicitly configured not to act," not necessarily "detection failed silently."

## The core detection/action event pair

Every Defender detection generates two related events in the `Microsoft-Windows-Windows Defender/Operational` channel: <cite index="1-1">a 1116 event is generated for detection telemetry, and a following 1117 event with an Allow action indicates the threat was detected but not remediated based on the configured security setting</cite>. In practice: 1116 tells you *what* was found; 1117 tells you what Defender actually *did* about it — and the two don't always agree.

| Event | Meaning |
|---|---|
| 1116 | Threat detected (name, path, process, detection source) |
| 1117 | Action taken (Quarantine, Remove, Allow, or Quarantine Failed) |
| 5001 | Real-time protection disabled |
| 5007 | A configuration setting changed (commonly an exclusion added) |

## Where this fits in a timeline

A 1116 event is frequently the *earliest* alert in an entire incident timeline — often arriving before EDR correlation, SIEM alerting, or human review ever happens, simply because Defender's own scanning runs continuously and locally. Treating the first relevant 1116 as a candidate "start of window" marker for scoping is standard practice, not a shortcut — an attacker's tooling is very often caught by Defender at least once before they find and disable it.

> [!TIP]
> This is the same principle [Level 3's malicious-cmdlet-patterns lesson](#/lesson/l3-16-powershell-malicious-patterns) ends on: the `Set-MpPreference`/`Add-MpPreference` tampering cluster it covers is usually a *response* to Defender having already caught something once. A 1116/1117 pair immediately preceding a tampering attempt is a strong, ordered signal, not two unrelated events.

## Normal baseline

Defender AV runs continuously in active mode fleet-wide (or a documented, ticketed passive-mode exception where a specific third-party product is the primary engine), cloud-delivered protection connectivity is current, and detection volume — like PowerShell logging volume in Level 3 — is *routinely nonzero*. A healthy fleet has a steady trickle of low-severity 1116/1117 pairs (adware, PUAs, test files) as background noise; the absence of any detections at all across an entire fleet is a more useful thing to investigate than a handful of routine ones.

## Red flags

- **Real-time protection disabled (5001) with no corresponding, documented change-control record.**
- **A host with zero 1116/1117 activity ever, on a fleet where every comparable host shows routine detections.** A permanent blind spot looks identical to a genuinely clean host until you check for this specifically.
- **Cloud-delivered protection unreachable or explicitly disabled**, silently reducing a host to signature-only coverage without any single event announcing the reduction.
- **Repeated 1116 detections of the same threat name on the same host** — a reinfection pattern, usually meaning a persistence mechanism survived the previous remediation.

## How to collect it

Live: `Get-WinEvent -LogName "Microsoft-Windows-Windows Defender/Operational"`, filtered to the event IDs above. `MpCmdRun.exe -GetFiles` generates a full diagnostic support package (`MpSupportFiles.cab`) including recent detection history, useful when a GUI-based review isn't practical. Offline, the same channel parses from an exported or KAPE-collected `.evtx` the same way any other Windows event log does.

## ATT&CK mapping

This lesson is evidence-source content supporting detection broadly rather than mapping to one technique. Deliberate tampering with real-time protection or exclusions maps to [Impair Defenses: Disable or Modify Tools (T1562.001)](https://attack.mitre.org/techniques/T1562/001/) — the same technique the [PowerShell malicious-cmdlet-patterns lesson](#/lesson/l3-16-powershell-malicious-patterns) covers from the attacker-command side.

> [!TIP]
> [The next lesson](#/lesson/l2-06-attack-surface-reduction) covers the rule-based layer sitting on top of everything here — Attack Surface Reduction — and where Tamper Protection fits into stopping the tampering pattern flagged above.

## Sources

- [Microsoft Learn — Troubleshoot Microsoft Defender Antivirus](https://learn.microsoft.com/en-us/defender-endpoint/troubleshoot-microsoft-defender-antivirus)
- [Microsoft Learn — Microsoft Defender Antivirus in Windows](https://learn.microsoft.com/en-us/defender-endpoint/microsoft-defender-antivirus-windows)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
