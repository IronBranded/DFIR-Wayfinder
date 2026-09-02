Almost every red flag in this academy is phrased as a deviation — "`svchost.exe` with the wrong parent," "Office spawning a shell." Those phrases only mean something if you already know what the right parent is. This lesson is that baseline, and it is worth learning cold rather than looking up, because process-tree anomalies are usually the fastest path from "something is wrong" to "here is the process."

## The boot chain

Windows starts processes in a specific order, and the resulting tree is remarkably consistent across machines:

```
System (PID 4)
└── smss.exe                    Session Manager
    ├── csrss.exe               one per session
    ├── wininit.exe             Session 0
    │   ├── services.exe
    │   │   ├── svchost.exe     many, always with -k
    │   │   ├── spoolsv.exe
    │   │   └── (other services)
    │   └── lsass.exe
    └── winlogon.exe            Session 1+
        └── userinit.exe
            └── explorer.exe
                └── (user applications)
```

## The facts worth memorizing

- **`lsass.exe`** — exactly one, parent `wininit.exe`, and **no child processes ever**. A second `lsass.exe`, or any child, is among the strongest single indicators in Windows forensics.
- **`services.exe`** — exactly one, parent `wininit.exe`. It is the only legitimate parent of `svchost.exe`.
- **`svchost.exe`** — many instances, always parented by `services.exe`, and always launched with a `-k` argument naming its service group. A `svchost.exe` with no `-k`, or with any other parent, is wrong.
- **`csrss.exe`** — typically two or more, one per session, parent `smss.exe`.
- **Everything above runs from `C:\Windows\System32`.** A process with a system name running from anywhere else is not that process.

## Orphans are normal

`smss.exe` and `userinit.exe` both exit deliberately after doing their jobs. Their children — `csrss.exe`, `winlogon.exe`, `explorer.exe` — are left with a parent PID pointing at a process that no longer exists. This is expected, not suspicious, and tools that flag "missing parent" will report it every time.

> [!IMPORTANT]
> PIDs are reused. A parent PID alone does not establish lineage — you need the parent's **process creation time** to be earlier than the child's. Sysmon Event ID 1 records both, which is one reason it is preferred over Event ID 4688 for tree reconstruction.

## Session 0 versus session 1

Session 0 is reserved for services and system processes; interactive user sessions are 1 and above. An interactive-looking process in session 0, or a service-hosted process appearing in a user session, is a boundary violation worth explaining.

## Red flags

- **`lsass.exe` with any child process**, or more than one `lsass.exe` — credential access, covered in [LSASS memory analysis](#/lesson/l3-09-lsass-memory-analysis).
- **`svchost.exe` with a parent other than `services.exe`**, or launched without `-k`.
- **A system-process name running from outside `System32`** — `C:\Windows\Temp\svchost.exe`, `%APPDATA%\lsass.exe`.
- **Near-miss spellings** — `scvhost.exe`, `svch0st.exe`, `lsasss.exe`, `csrsss.exe`. These rely on a reader's eye sliding past them.
- **An Office application, browser, or PDF reader spawning a shell or script interpreter** — `winword.exe` → `powershell.exe`, `excel.exe` → `mshta.exe`. This is the [LOLBins](#/lesson/l5-14-lolbins) pattern and one of the highest-value detections available.
- **An unsigned binary carrying a legitimate system process name.**

## How to collect it

Live: Process Explorer or Process Hacker show the tree directly with signature verification. Sysmon Event ID 1 provides parent image, parent command line, and both creation times — the fullest source for reconstruction. Event ID 4688 works if command-line auditing is enabled, but records less. From a memory image, `windows.pstree` reconstructs the same tree — see [process analysis](#/lesson/l3-02-volatility-process-analysis).

## ATT&CK mapping

This is baseline reference content supporting detection broadly. Deliberate manipulation of the tree maps to [Access Token Manipulation: Parent PID Spoofing (T1134.004)](https://attack.mitre.org/techniques/T1134/004/) and [Masquerading: Match Legitimate Name or Location (T1036.005)](https://attack.mitre.org/techniques/T1036/005/).

## Sources

- Windows Internals (Russinovich, Solomon, Ionescu) — system process startup
- SANS "Hunt Evil" poster — known-good process characteristics
- MITRE ATT&CK — T1036.005, T1134.004
