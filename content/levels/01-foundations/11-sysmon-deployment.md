Event ID 4688. Sysmon Event ID 1. Sysmon Event ID 6. These references appear constantly across this academy's own lessons — and none of them explain what Sysmon actually is, how it gets deployed, or what a sane starting configuration looks like. This lesson is that missing piece: the infrastructure most of this academy's detection guidance quietly assumes is already running.

> [!PLAIN]
> Sysmon (System Monitor) is a free Microsoft Sysinternals tool that runs as a Windows service and driver, logging far more detailed system activity than Windows' built-in auditing does by default — process creation with full command lines and hashes, network connections, driver loads, named pipe activity, and more, all into a single dedicated event log channel.

## Why Windows' built-in logging often isn't enough on its own

Windows Security Event ID 4688 *can* capture process creation with command-line detail, but only once command-line auditing is explicitly enabled via Group Policy — and even then, it doesn't natively capture network connections, driver loads, or several other event types this academy's lessons rely on. Sysmon fills that gap directly, and does it with more consistent, more parseable output than stitching together several separate native logging features.

## The event IDs worth knowing by number

| ID | Event | Why it matters here |
|---|---|---|
| 1 | Process Create | Full command line, hash, parent process — referenced throughout Levels 2–4 |
| 3 | Network Connection | Source/destination, process — the endpoint-side complement to [NetFlow](#/lesson/l7-03-netflow-analysis) |
| 6 | Driver Loaded | The primary [BYOVD detection surface](#/lesson/l2-13-byovd-loldrivers) |
| 7 | Image Loaded | DLL loads — relevant to [DLL hijacking](#/lesson/l3-09-com-dll-hijacking) |
| 8 | CreateRemoteThread | A core [process injection](#/lesson/l5-05-injection-techniques) indicator |
| 10 | Process Access | Captures [LSASS access](#/lesson/l5-08-lsass-memory-analysis) attempts directly |
| 11 | File Create | New file creation, useful for staging/dropper detection |
| 17 / 18 | Pipe Created / Connected | Named pipe activity — a [C2 framework fingerprinting](#/lesson/l7-09-c2-framework-fingerprinting) signal |
| 22 | DNS Query | Process-level DNS resolution, complementing [DNS log analysis](#/lesson/l7-01-dns-analysis) |

## Deploying it

Sysmon installs as a single executable with a configuration XML controlling exactly what gets logged and filtered (`sysmon64.exe -i config.xml`). A default, unfiltered configuration generates an enormous volume of noise — the practical starting point almost everyone in the community uses is **SwiftOnSecurity's Sysmon configuration**, a well-maintained, widely-adopted baseline that filters out routine Windows noise while preserving the event types that actually matter for detection, and is designed to be tuned incrementally from there rather than used as a permanent, unmodified default.

> [!IMPORTANT]
> A Sysmon deployment with no tuned configuration at all is not obviously better than no Sysmon at all — the resulting event volume can bury genuinely useful signal under routine noise fast enough that nobody actually reviews it. Start from a maintained baseline configuration, not a blank one.

## Normal baseline

Sysmon runs continuously as a background service on every managed endpoint, its configuration is centrally deployed and version-controlled rather than ad hoc per machine, and its event log (`Microsoft-Windows-Sysmon/Operational`) is forwarded to a central collection point — a SIEM, Sentinel, or equivalent — rather than left sitting only on local disk where it does nothing for detection and disappears the moment the host is reimaged.

## Red flags

- **Sysmon service stopped or the driver unloaded** on a host where it's supposed to be running continuously — often a deliberate step in an intrusion specifically to blind logging before further activity (see the overlap with [BYOVD](#/lesson/l2-13-byovd-loldrivers), which can be used for exactly this).
- **A configuration change that silently removes coverage** for a specific event type or process, rather than an addition — worth diffing configuration changes over time, not just checking that the service is running.
- **A gap in Sysmon's own event log timeline** with no corresponding service-stop event — a sign the log itself, not just the service, was tampered with.

## How to collect it

The `Microsoft-Windows-Sysmon/Operational` event log channel, forwarded centrally via Windows Event Forwarding, a SIEM agent, or equivalent — reviewing Sysmon logs only on local disk after an incident has already happened defeats most of the value, since an attacker with sufficient access can tamper with or clear that log the same way they can any other local artifact.

## Sources

- [Microsoft Sysinternals — Sysmon](https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon)
- [SwiftOnSecurity's Sysmon configuration](https://github.com/SwiftOnSecurity/sysmon-config)
