---
tags:
  - Practice Drill
---

# Drill: Event Log Story

## The scenario

Six Security-log events from a Domain Controller, in chronological order, stripped down to the essentials. Before expanding the answer: what happened here, in order, and what's the single most urgent action?

| Time (UTC) | Event ID | Summary |
|---|---|---|
| 03:14:02 | 4625 | Failed logon — account: `svc-backup`, source: `10.4.2.187` |
| 03:14:09 | 4625 | Failed logon — account: `svc-backup`, source: `10.4.2.187` |
| 03:14:41 | 4624 | Successful logon — account: `svc-backup`, source: `10.4.2.187`, logon type 3 |
| 03:16:55 | 4662 | Operation on object — account: `svc-backup`, properties contain `1131f6ad-9c07-11d1-f79f-00c04fc2dcd2` |
| 03:19:20 | 5136 | Directory service object modified — object: `CN=AdminSDHolder,CN=System,DC=contoso,DC=com`, account: `svc-backup` |
| 03:21:03 | 1102 | The audit log was cleared — account: `svc-backup` |

??? question "Reveal the answer"
    **The story, in order:**

    1. **03:14:02–03:14:09** — two failed logon attempts against `svc-backup`, then a success two seconds after the second failure. Consistent with a short password-guessing attempt that succeeded, or a credential the attacker already had that was mistyped once before landing correctly.
    2. **03:16:55** — a 4662 event containing GUID `1131f6ad-9c07-11d1-f79f-00c04fc2dcd2`, which is **Replicating Directory Changes All** — see [DCSync Detection](../02-active-directory/dcsync-detection.md). `svc-backup` is not a Domain Controller, which is exactly the non-DC-source condition that page identifies as the actual signal. This account just DCSynced the directory, very likely including `krbtgt`.
    3. **03:19:20** — a 5136 modifying the `AdminSDHolder` object itself. Per [AdminSDHolder / SDProp Abuse](../02-active-directory/adminsdholder.md), this means whatever ACL change was just made is about to propagate automatically to **every current and former protected-group member domain-wide** within the next SDProp cycle (60 minutes by default).
    4. **03:21:03** — the audit log gets cleared. This is both an attempt to hide everything that just happened, and — because it's such an unusual event on its own — frequently the loudest single tell in the entire sequence.

    **The single most urgent action:** given step 2, assume `krbtgt` is compromised and start the [double-reset procedure](../02-active-directory/krbtgt.md) — a single reset will not fully invalidate a Golden Ticket forged from a hash obtained here. Given step 3, don't stop at re-securing `svc-backup` alone: check `AdminSDHolder`'s ACL directly, because SDProp will keep re-propagating a poisoned entry to every protected account until the source object itself is fixed, not just the account that made the change.

    **Why the log-clear event doesn't erase the trail:** 1102 clearing the *Security* log doesn't touch [replication metadata](../02-active-directory/replication-metadata.md), which lives in the directory itself, not the event log — `repadmin /showobjmeta` against `AdminSDHolder` still reconstructs what changed and when, even after step 4.

<!-- BACKLINKS:START -->
## Referenced From

- [Event Log Key IDs Reference](../01-windows-endpoint/event-log-key-ids.md)
- [AdminSDHolder / SDProp Abuse](../02-active-directory/adminsdholder.md)
- [Case Study: Domain Compromise, End to End](../case-studies/domain-compromise-case-study.md)
- [Practice Drills](index.md)

<!-- BACKLINKS:END -->

