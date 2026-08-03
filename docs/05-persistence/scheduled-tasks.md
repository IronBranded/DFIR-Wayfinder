---
tags:
  - Persistence
  - Endpoint
  - T1053
  - T1053.005
---

# Persistence: Scheduled Tasks

**ATT&CK:** [T1053.005](https://attack.mitre.org/techniques/T1053/005/) — Scheduled Task/Job: Scheduled Task

## The mechanism

A scheduled task can trigger on nearly anything — a time, a logon, an idle period, a specific event log entry — which makes it flexible for an attacker wanting a persistence method that isn't tied strictly to logon (unlike Run keys) and that most admins don't audit closely.

- **Definitions live at:** `C:\Windows\System32\Tasks\<TaskName>` (XML files, one per task)
- **Registered via:** `schtasks.exe`, the Task Scheduler GUI, or the underlying COM/`Register-ScheduledTask` API

## Where the evidence lives

- Event ID 4698 (Security log — "A scheduled task was created") — requires Object Access auditing enabled
- Microsoft-Windows-TaskScheduler/Operational log, Event IDs 106 (task registered) and 200/201 (task started/completed) — often available even when Security-log auditing isn't
- The task's XML definition itself, which records the exact action, trigger, and the account context it runs under

## Detection approach

Look for tasks whose **Author** field doesn't match a legitimate software vendor or your own deployment tooling, tasks with disguised or misleading names mimicking legitimate Windows tasks, and tasks configured to run as `SYSTEM` that were created by a non-administrative account. Cross-reference task creation timestamps against your change-management records — a task nobody remembers creating is worth investigating regardless of how innocuous it looks.

!!! danger "Red flag"
    A task with a generic/mimicked name, an unexplained `SYSTEM`-level run-as context, or an action pointing at a script interpreter or an executable in a user-writable path.

## Cleanup

Delete the task (`schtasks /delete`), but pull and preserve the XML definition first — it's your best record of exactly what the attacker configured, including any command-line arguments that might reveal C2 infrastructure or a staged payload path.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 5: Persistence Catalog](index.md)
- [Advanced Hunting with KQL](../07-defender-suite/advanced-hunting-kql.md)
- [Playbook: Ransomware](../08-playbooks/ransomware.md)

<!-- BACKLINKS:END -->

## Sources

- [MITRE ATT&CK — T1053.005](https://attack.mitre.org/techniques/T1053/005/)
- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — persistence hunting)
