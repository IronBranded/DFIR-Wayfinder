**Scenario.** A workstation was flagged by a network alert. You have a Prefetch directory listing. Fifteen minutes. What ran, and what is wrong?

## The data

```
Filename                              Run Count   Last Run (UTC)
----------------------------------------------------------------
CHROME.EXE-1BD4F29C.pf                    412     2026-08-27 16:42:11
OUTLOOK.EXE-9F3A11B2.pf                   198     2026-08-27 16:38:04
WINWORD.EXE-4C8E70D1.pf                    47     2026-08-27 09:14:22
POWERSHELL.EXE-59FC2A3E.pf                  3     2026-08-27 09:14:29
SVCHOST.EXE-3530F672.pf                  1104     2026-08-27 16:44:00
SVCHOST.EXE-B8A2C401.pf                     1     2026-08-27 09:15:03
RUNDLL32.EXE-72A4E9D5.pf                   62     2026-08-27 16:20:15
7Z.EXE-D1E45A83.pf                          2     2026-08-27 11:02:47
NOTEPAD.EXE-2C8B7714.pf                    23     2026-08-26 14:22:09
```

## Work through it

**Step 1 — anything with a run count of 1 or 2.** New activity. `SVCHOST.EXE-B8A2C401.pf` (1) and `7Z.EXE-D1E45A83.pf` (2) qualify. `POWERSHELL.EXE` at 3 is close behind.

**Step 2 — the timestamps cluster.** `WINWORD.EXE` at 09:14:22, `POWERSHELL.EXE` seven seconds later at 09:14:29, and the anomalous `SVCHOST.EXE` at 09:15:03. Three events inside 41 seconds is a sequence, not a coincidence.

**Step 3 — the two `SVCHOST.EXE` entries.** This is the finding.

Recall from [the Prefetch lesson](#/lesson/l2-01-prefetch) that the hash suffix is derived from the **full path** of the executable. Two `.pf` files for the same executable name mean it ran from **two different locations**. Legitimate `svchost.exe` lives in `System32` and runs constantly — that is the entry with 1,104 executions.

The second, with a run count of **1**, executing 41 seconds after Word launched PowerShell, is a different binary that happens to share the name. This is [masquerading](#/lesson/l2-10-process-trees), and Prefetch caught it because the hash encodes the path.

**Step 4 — the 7-Zip execution.** Two runs, at 11:02, on a machine where it is not standard. Archive creation is a common [exfiltration staging](#/lesson/l8-07-playbook-data-exfiltration) step. Worth pursuing, not conclusive.

## What to do next

Parse the two `SVCHOST.EXE` `.pf` files with `PECmd` to recover the **referenced-file lists** — those give the actual directory each ran from, plus what each touched during its first ten seconds. Then check [Amcache](#/lesson/l2-04-amcache) for a SHA-1 on the anomalous one, since the binary itself may already be gone.

> [!TIP]
> The whole finding here rests on one property most people forget: **the hash is of the path, not the file**. Two `.pf` files, same name, different hash means two locations. That single fact is what turns this listing from unremarkable into an incident.
