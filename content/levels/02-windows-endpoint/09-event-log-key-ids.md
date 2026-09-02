This is a reference lesson: the Event IDs worth knowing without looking up, and — more importantly — what each one actually **guarantees** versus what it merely **suggests**. Most misreadings in incident reports come from treating the second as the first.

## Logon and authentication

| ID | Meaning |
|---|---|
| **4624** | Successful logon |
| **4625** | Failed logon |
| **4634 / 4647** | Logoff / user-initiated logoff |
| **4648** | Logon using explicit credentials |
| **4672** | Special privileges assigned to new logon |

**4624 is meaningless without its Logon Type**, which is the field that determines what actually happened:

| Type | Meaning |
|---|---|
| 2 | Interactive (at the console) |
| 3 | Network (SMB, share access) |
| 4 | Batch (scheduled task) |
| 5 | Service |
| 7 | Unlock |
| 8 | NetworkCleartext |
| 9 | NewCredentials (`runas /netonly`) |
| **10** | **RemoteInteractive (RDP)** |
| 11 | CachedInteractive |

Type 3 is by far the most common and the least alarming on its own — it fires whenever anything touches a share. Type 10 is RDP. Type 9 is a strong lateral-movement signal, because `runas /netonly` is how an attacker uses stolen credentials against remote systems without changing their local context.

**4648** deserves its own attention: it fires when a process explicitly supplies credentials rather than using the current token. On a workstation, that is unusual, and it names both the source account and the target.

## Process and service

| ID | Log | Meaning |
|---|---|---|
| **4688** | Security | Process creation |
| **4697** | Security | Service installed (needs audit policy) |
| **7045** | System | Service installed (**default on**) |
| **7040** | System | Service start type changed |

> [!WARNING]
> **4688 without command-line auditing is close to useless.** Recording the command line is a *separate* policy setting ("Include command line in process creation events"). Without it, you get an image path and nothing about arguments — no `-enc`, no script path, no target. Verify it is enabled rather than assuming, and prefer [Sysmon Event ID 1](#/lesson/l1-11-sysmon-deployment) where available.

[7045 is the more dependable service record](#/lesson/l3-07-windows-services) because it needs no audit policy at all.

## Account and group changes

| ID | Meaning |
|---|---|
| **4720** | User account created |
| **4728 / 4732 / 4756** | Member added to global / local / universal group |
| **4738** | User account changed |
| **4740** | Account locked out |

## Log clearing

| ID | Log | Meaning |
|---|---|---|
| **1102** | Security | **The audit log was cleared** |
| **104** | System | An event log was cleared |

These are among the highest-signal events in Windows. Clearing the Security log is not an administrative routine — it is an action taken to destroy evidence, and 1102 survives it because it is written *after* the clear. When the log no longer reaches back far enough, [replication metadata](#/lesson/l4-03-replication-metadata) and the [USN journal](#/lesson/l2-03-usn-journal) become the fallback sources.

## Kerberos and directory

| ID | Meaning |
|---|---|
| **4768** | TGT requested |
| **4769** | Service ticket requested |
| **4771** | Kerberos pre-authentication failed |
| **4662** | Operation on an object — [DCSync detection](#/lesson/l4-05-dcsync-detection) with replication GUIDs |

## Elsewhere in this academy

**4104** (PowerShell script block) is covered in [PowerShell logging](#/lesson/l3-01-powershell-logging); **4698** (scheduled task created) in [scheduled tasks](#/lesson/l3-06-scheduled-tasks); **1116/1117** and **1121/1122** in the Defender lessons.

## Where the logs live

```
%SystemRoot%\System32\winevt\Logs\*.evtx
```

Default sizes are small enough that busy logs — Security especially — roll over in days on an active server. Retention is a configuration decision most environments have never revisited, and discovering it mid-incident is the wrong time.

## Red flags

- **1102 or 104** with no corresponding change record.
- **4624 Type 10 (RDP)** from an unexpected source, or outside working hours.
- **4648** on a workstation, particularly naming a privileged target account.
- **4625 in volume** followed by a single 4624 for the same account — password spraying that succeeded.
- **4720 followed by 4728/4732** in quick succession — account created and immediately privileged.
- **4672 for an account that should not hold administrative rights.**

## How to collect it

`Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4624}` live, or parse exported `.evtx` offline. **EvtxECmd** (Eric Zimmerman) normalizes across log types into a single timeline-friendly output, which matters when correlating several logs at once. Confirm command-line auditing is enabled before relying on 4688.

## Sources

- [Microsoft Learn — Advanced security audit policy settings](https://learn.microsoft.com/en-us/windows/security/threat-protection/auditing/advanced-security-audit-policy-settings)
- [Eric Zimmerman's tools — EvtxECmd](https://ericzimmerman.github.io/)
- SANS FOR500 / FOR508
- 13cubed — Windows event log analysis (YouTube)
