**Scenario.** Three sources, three clocks, one incident. Eighteen minutes. Put them in order.

## The data

**Source A — Workstation Security log** (host clock, local time `UTC+1`)

```
10:02:14  4688  winword.exe → powershell.exe
10:02:21  4688  powershell.exe → svchost.exe  (C:\Users\Public\)
```

**Source B — Domain controller Security log** (UTC, NTP-synced, authoritative)

```
09:04:39  4624  svc_backup  Logon Type 3 from 10.14.22.87
09:06:02  4672  svc_backup  Special privileges assigned
```

**Source C — Proxy log** (UTC)

```
09:02:37  10.14.22.87 → 185.220.101.47  GET /a.ps1   200   4,812 bytes
09:07:55  10.14.22.87 → 185.220.101.47  POST /r      200      96 bytes
```

**Calibration reference.** The workstation recorded a logon at `10:03:07` local. The domain controller recorded the same logon at `09:02:52` UTC.

## Step 1 — normalize the timezone

Source A is `UTC+1`. Subtract one hour:

```
10:02:14 local  →  09:02:14 UTC
10:02:21 local  →  09:02:21 UTC
```

## Step 2 — calibrate the skew

Timezone conversion is not enough — the host clock may also be **wrong**. Use the cross-recorded event, per [timeline construction](#/lesson/l1-07-timeline-construction):

```
Workstation:  10:03:07 local  →  09:03:07 UTC (after timezone conversion)
DC (truth):   09:02:52 UTC
Skew:         workstation is 15 seconds FAST
```

Subtract 15 seconds from every Source A timestamp:

```
09:02:14 − 15s  →  09:01:59 UTC
09:02:21 − 15s  →  09:02:06 UTC
```

## Step 3 — the merged timeline

```
09:01:59  [A]  winword.exe spawns powershell.exe
09:02:06  [A]  powershell.exe spawns svchost.exe from C:\Users\Public\
09:02:37  [C]  Payload downloaded — GET /a.ps1, 4,812 bytes
09:04:39  [B]  svc_backup authenticates from 10.14.22.87
09:06:02  [B]  svc_backup granted special privileges
09:07:55  [C]  Outbound POST — 96 bytes
```

## Why the corrections mattered

Uncorrected, Source A's events appear at **10:02**, an hour *after* everything else — placing initial access after the download it caused. The whole causal chain inverts.

Timezone alone still leaves the events 15 seconds late, which is enough to reorder them against the download at 09:02:37 and lose the sequence that makes the narrative coherent.

## Reading the result

The corrected order tells a story the raw data did not: Word spawned PowerShell, which spawned a masqueraded `svchost.exe` from `C:\Users\Public`, which **then** fetched the payload at 09:02:37 — 31 seconds later, entirely consistent with a [download cradle](#/lesson/l3-16-powershell-malicious-patterns) executing.

The 96-byte POST at 09:07:55 is check-in traffic, not exfiltration — small, outbound, following successful privilege escalation. That is a [beacon](#/lesson/l6-02-proxy-firewall-triage) byte-ratio profile.

> [!IMPORTANT]
> Two rules generalize out of this. **Normalize everything to UTC and state the timezone explicitly in the report** — a timeline whose timezone is unstated will be misread. And **calibrate skew against an authoritative source** before trusting any host's clock, because timezone conversion corrects only half the error.
