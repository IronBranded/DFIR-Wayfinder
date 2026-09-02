**Scenario.** Security log excerpt from a file server. No endpoint agent, no Sysmon. Fifteen minutes. What happened?

## The data

```
Time (UTC)   ID    Account          Detail
------------------------------------------------------------------
11:02:14     4625  jsmith           Logon Type 3 — bad password
11:02:15     4625  mjones           Logon Type 3 — bad password
11:02:15     4625  rpatel           Logon Type 3 — bad password
11:02:16     4625  agarcia          Logon Type 3 — bad password
   [... 74 further 4625 events, distinct accounts, 11:02:14–11:04:38 ...]
11:04:39     4624  svc_backup       Logon Type 3 — from 10.14.22.87
11:06:02     4672  svc_backup       Special privileges assigned
11:08:47     7045  —                Service "WinDefendUpdate" installed
11:09:12     4648  svc_backup       Explicit credentials → Administrator
11:14:30     4624  Administrator    Logon Type 10 — from 10.14.22.87
11:41:55     4720  Administrator    User account "helpdesk_svc" created
11:42:03     4728  Administrator    "helpdesk_svc" added to Domain Admins
12:07:19     1102  Administrator    Audit log was cleared
```

## Read it as a sequence

**11:02:14–11:04:38 — password spraying.** Many distinct accounts, one attempt each, all Logon Type 3 (network). One password against many accounts — the inverse of brute forcing, and it stays under per-account lockout thresholds. Roughly 78 attempts in 144 seconds.

**11:04:39 — it worked.** `svc_backup` succeeds from `10.14.22.87`. A service account, almost certainly with a weak, never-rotated password.

**11:06:02 — 4672.** Special privileges assigned means this account holds administrative rights it probably should not.

**11:08:47 — 7045.** The [service installation](#/lesson/l5-03-windows-services) from the registry drill, now with a timestamp. 7045 is in the **System** log and requires no audit policy — which is why it survives when Security auditing is patchy.

**11:09:12 — 4648.** [Explicit credentials](#/lesson/l4-11-event-log-key-ids) supplied, targeting `Administrator`. The attacker has obtained that credential and is using it against a remote target.

**11:14:30 — Logon Type 10.** RDP as Administrator, same source IP. Interactive control.

**11:41:55 and 11:42:03 — persistence via account.** A new account named to blend in, added to Domain Admins eight seconds later.

**12:07:19 — 1102.** The Security log was cleared.

## The 1102 problem

Everything above is what you have **because 1102 is written after the clear**. Whatever preceded 11:02:14 — how `10.14.22.87` was reached, what happened before the spray — is gone from this log.

It is not gone from everything. [Log recovery](#/lesson/l5-18-log-artifact-recovery) applies: the System log still has 7045 and was not cleared; a SIEM or WEF collector may hold shipped copies; records may be carvable from unallocated space; and none of the [filesystem or registry artifacts](#/lesson/l4-06-usn-journal) were touched at all.

## What this excerpt cannot tell you

The **source** — `10.14.22.87` is where the spray came from, but not how the attacker reached that host. And there is **no process data**: no Sysmon, no 4688, so nothing here shows what ran, only what authenticated.

> [!TIP]
> Two takeaways worth generalizing. **4625 volume with distinct accounts** is spraying, not brute force — the difference determines whether lockout policy would have helped. And **an immediate 4720 → 4728 pair** is account-creation-plus-privilege in one motion, which is close to definitional for hands-on-keyboard persistence.
