---
tags:
  - Persistence
  - Endpoint
  - T1546
  - T1546.003
---

# Persistence: WMI Event Subscriptions

**ATT&CK:** [T1546.003](https://attack.mitre.org/techniques/T1546/003/) — Event Triggered Execution: Windows Management Instrumentation Event Subscription

## The mechanism

This is one of the stealthiest persistence mechanisms available on Windows precisely because it doesn't touch the filesystem or the registry in the way most other techniques do — it lives inside the WMI repository itself. Three pieces work together:

- **`__EventFilter`** — a WQL query defining the trigger condition (e.g., "system uptime crosses a threshold," "a specific process starts")
- **`__EventConsumer`** — the action to take when the filter matches, most commonly a `CommandLineEventConsumer` (run a command) or `ActiveScriptEventConsumer` (run embedded VBScript/JScript)
- **`__FilterToConsumerBinding`** — the object that links the two together and actually activates the subscription

## Where the evidence lives

If Sysmon is deployed with WMI monitoring enabled (available since Sysmon 6.10), all three components generate their own event:

| Sysmon Event ID | Component | What it shows |
|---|---|---|
| 19 | `WmiEventFilter` | The filter's WQL query and name |
| 20 | `WmiEventConsumer` | The consumer type and the actual command/script it runs |
| 21 | `WmiEventConsumerToFilter` | The binding that activates the pair |

Without Sysmon, the native `Microsoft-Windows-WMI-Activity/Operational` log is the fallback, though it's less consistently useful for this specific pattern.

## Detection approach

WMI event subscriptions are genuinely rare in normal enterprise environments outside specific management/monitoring software — this makes a "log everything, alert on everything not explicitly allow-listed" approach practical here in a way it isn't for noisier artifacts. Look for all three event IDs (19, 20, 21) clustered close together in time — real WMI persistence needs all three components registered as a set. A classic trigger pattern worth specifically watching for: a filter keyed to system uptime crossing a narrow window shortly after boot, a common way malware waits out early-boot security tooling before firing.

!!! danger "Red flag"
    Any `CommandLineEventConsumer` or `ActiveScriptEventConsumer` not tied to known management software, especially one bound to an uptime- or process-start-based filter.

## Cleanup

Remove all three WMI objects (`Get-WmiObject -Namespace root\subscription -Class __EventFilter` / `__EventConsumer` / `__FilterToConsumerBinding`, then delete the matching instances) — removing only one leaves the others orphaned but potentially reusable if a filter or consumer with the same name gets re-registered.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 5: Persistence Catalog](index.md)

<!-- BACKLINKS:END -->

## Sources

- [MITRE ATT&CK — T1546.003](https://attack.mitre.org/techniques/T1546/003/)
- Sysmon documentation (Microsoft Sysinternals) — WMI event logging, added in v6.10
