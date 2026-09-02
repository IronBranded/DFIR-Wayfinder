Task Scheduler is Windows' cron, and it is a better persistence host than a Run key in three ways: it can trigger on events other than logon, it can run as SYSTEM, and its evidence is scattered across three separate locations that most triage checks only ever look at one of.

## Three places the same task exists

**The XML file** — `C:\Windows\System32\Tasks\<TaskName>`, an extensionless XML file containing triggers, actions, principal (the account it runs as), and creation date. Subfolders mirror the Task Scheduler tree, so `\Microsoft\Windows\...` tasks live in matching subdirectories.

**The registry** — under `HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Schedule\TaskCache\`:
- `Tree\<TaskName>` maps a task's display name to a GUID.
- `Tasks\{GUID}` holds the actual definition, including an `Actions` value and the `SD` (security descriptor).

**The event log** — `Microsoft-Windows-TaskScheduler/Operational`.

> [!WARNING]
> These can disagree, and the disagreement is the finding. Deleting the `SD` value under `TaskCache\Tasks\{GUID}` **hides the task from `schtasks /query` and the Task Scheduler GUI while it continues to run**. A task present in the registry or as an XML file but absent from `schtasks` output is deliberately hidden, not a glitch.

## The event IDs

| Log | ID | Meaning |
|---|---|---|
| TaskScheduler/Operational | 106 | Task registered |
| TaskScheduler/Operational | 140 | Task updated |
| TaskScheduler/Operational | 141 | Task deleted |
| TaskScheduler/Operational | 200 / 201 | Action started / completed |
| Security | 4698 | A scheduled task was created |
| Security | 4699 / 4702 | Task deleted / updated |

The Security log events require "Audit Other Object Access Events" to be enabled, which it frequently is not. The Operational log is on by default, which makes 106 the more reliably available registration record.

## Normal baseline

The overwhelming majority of tasks live under `\Microsoft\Windows\` and ship with the OS. Vendor tasks (updaters, telemetry, maintenance) sit in a vendor-named folder. Actions point at signed binaries in Program Files or System32. Tasks running as SYSTEM are common but are almost all Microsoft's own.

## Red flags

- **A task in the root `\` folder** rather than a vendor or Microsoft subfolder — legitimate installers rarely do this, attackers routinely do.
- **A name imitating a Microsoft task** but sitting in the wrong folder, or with a slightly wrong spelling.
- **An action invoking `powershell.exe`, `mshta.exe`, `rundll32.exe`, `regsvr32.exe`, or `cmd.exe`** — see [LOLBins](#/lesson/l2-12-lolbins).
- **A task present in `C:\Windows\System32\Tasks\` or the registry but invisible to `schtasks`** — the `SD`-deletion hiding technique.
- **Triggers on logon, idle, or a system event** combined with a SYSTEM principal and a non-Microsoft action.
- **A task XML file whose filesystem creation time falls inside a suspected intrusion window.**

## How to collect it

Compare all three sources rather than trusting one: list `C:\Windows\System32\Tasks\` recursively, dump `TaskCache\Tree` and `TaskCache\Tasks`, and query Event ID 106 from `Microsoft-Windows-TaskScheduler/Operational`. Anything appearing in one and not the others deserves attention. Autoruns covers scheduled tasks in its Scheduled Tasks tab and applies the same signature verification as elsewhere.

## ATT&CK mapping

Maps to [Scheduled Task/Job: Scheduled Task (T1053.005)](https://attack.mitre.org/techniques/T1053/005/).

## Sources

- MITRE ATT&CK — T1053.005
- [Microsoft Learn — Task Scheduler](https://learn.microsoft.com/en-us/windows/win32/taskschd/task-scheduler-start-page)
