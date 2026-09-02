This is every technique from [Level 4](#/lesson/l7-18-ad-attack-chain-overview) chained into one narrative. The organization is fictional; the sequence is not — this shape recurs constantly in real intrusions.

**Northwind Manufacturing.** ~2,400 employees, single AD forest, Defender for Endpoint deployed, Sysmon on servers but not workstations. That last detail matters later.

---

## Day 0 — Initial access

An accounts-payable clerk opens `Invoice_Q3_Revised.docm` attached to a message that passed SPF, because the attacker's own domain was correctly configured — the trap from [email authentication](#/lesson/l2-01-email-headers-authentication). DMARC failed, but the tenant policy was `p=none`.

The macro runs a download cradle. Available artifacts:

- `WINWORD.EXE` and `POWERSHELL.EXE` [Prefetch](#/lesson/l4-01-prefetch) entries seconds apart
- A [process tree](#/lesson/l3-04-process-trees) showing `winword.exe` → `powershell.exe` — the highest-value single indicator in the whole intrusion
- **No Sysmon on the workstation**, so no Event ID 1, no image loads, no network connection events

## Day 0 — Persistence

A [scheduled task](#/lesson/l5-02-scheduled-tasks) named `MicrosoftEdgeUpdateTaskMachineCore` in the **root task folder** rather than under `\Microsoft\`. Event ID 106 recorded it. Nobody was watching Event ID 106.

## Day 1 — Discovery

`net group "Domain Admins" /domain`, `nltest`, then SharpHound. 4688 captured the command lines because command-line auditing happened to be enabled — [without it, this stage would be invisible](#/lesson/l4-11-event-log-key-ids).

## Day 3 — Credential access

`rundll32.exe comsvcs.dll, MiniDump <lsass PID> C:\Windows\Temp\dump.bin full` — the [LOLBin variant](#/lesson/l5-14-lolbins) of [LSASS dumping](#/lesson/l3-09-lsass-memory-analysis).

The dump file itself sat in `C:\Windows\Temp` for six days before deletion. It was recovered later by [carving](#/lesson/l4-12-file-carving) and confirmed the attacker had local admin credentials by day 3.

## Day 4–9 — Lateral movement

[Pass-the-hash](#/lesson/l7-07-pass-the-hash-pass-the-ticket) to a file server, then to a jump host. Artifacts: 4624 Logon Type 9, 4648 explicit credential events, and 7045 service installations on each target — the [PsExec pattern](#/lesson/l5-03-windows-services).

The jump host had Sysmon. It is the reason the investigation could later reconstruct anything at all about this stage.

## Day 11 — Domain compromise

A service account with unnecessary replication rights, found through the SharpHound data from day 1. [DCSync](#/lesson/l7-06-dcsync-detection) executed from the jump host, pulling the full credential database including krbtgt.

**Event ID 4662 with replication GUIDs from a non-DC account fired.** Directory Service Access auditing was enabled. The event went to a log nobody had a detection rule for.

## Day 11–19 — Persistence and dwell

- A [Golden Ticket](#/lesson/l7-10-golden-silver-ticket) with a 10-year lifetime
- A modification to the [AdminSDHolder](#/lesson/l7-15-adminsdholder) ACL granting a low-privileged account `GenericAll`
- An additional credential added to an [existing legitimate app registration](#/lesson/l5-10-backdoor-app-registrations)

## Day 19 — Detection

Not by any of the above. A backup administrator noticed shadow copies missing on two servers — the [pre-encryption precursor](#/lesson/l4-13-vss-recovery) — and escalated before deployment.

---

## What the response got right and wrong

**Right:** scoped before remediating, per [the domain compromise playbook](#/lesson/l8-04-playbook-domain-compromise). The temptation to reset krbtgt on day one was resisted, and the eight days of scoping found the AdminSDHolder change and the app registration credential that a fast remediation would have missed entirely.

**Wrong, initially:** the first remediation plan covered credentials and krbtgt but **not** the app registration. It was caught in review. Had it shipped, the attacker would have retained tenant access through a complete on-premises rebuild.

**The krbtgt decision:** staged rather than rapid — reset, wait past the [10-hour window](#/lesson/l7-16-krbtgt-double-reset), reset again. Accepted because there was no evidence of active destruction, and because domain-wide authentication disruption during month-end close was judged worse than ten more hours of a Golden Ticket already eight days old.

## The findings that mattered more than the intrusion

1. **4662 fired correctly and nobody was watching.** The telemetry existed; the detection did not. This is exactly the "telemetry, no detection" level from [coverage mapping](#/lesson/l1-10-attack-coverage-map).
2. **Sysmon on servers but not workstations** meant the initial access stage was reconstructed almost entirely from Prefetch and Amcache.
3. **DMARC at `p=none`** let the message through a control that was deployed but not enforcing.
4. **A service account with replication rights** nobody had reviewed — the [ACL problem](#/lesson/l7-14-acl-delegation-abuse) that made the whole domain compromise a single step rather than a campaign.

> [!IMPORTANT]
> Every one of those four was known-fixable before day 0. The intrusion did not require a novel technique at any stage — it required four pre-existing gaps, each individually accepted, that happened to chain.

## Sources

- MITRE ATT&CK — T1566, T1003.001, T1003.006, T1558.001
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
