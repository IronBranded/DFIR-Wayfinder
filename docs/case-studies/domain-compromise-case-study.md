---
tags:
  - Case Study
---

# Case Study: Domain Compromise, End to End

Every other page in this guide answers "what does this look like" for one artifact at a time. This page is different on purpose: it's one continuous investigation, narrated the way it actually unfolds — including the moment where a naive reading of the timestamps would have led to the wrong conclusion, and how you'd catch that.

This case study builds toward the exact event sequence in the [Event Log Story](../practice-drills/event-log-drill.md) drill. If you've already done that drill, you've seen the ending — this is the investigation that gets you there.

## The trigger

**03:16:55 UTC** — a Defender for Identity alert: *Suspected DCSync attack*. Source account: `svc-backup`. Source computer: `WKS-4471`. This timestamp comes from the Domain Controller observing the replication request directly — see [DCSync Detection](../02-active-directory/dcsync-detection.md) — which makes it accurate and high-confidence. It is not, however, the start of the story.

## Step 1 — why you go to the workstation before the DC

The alert tells you *who* and *from where*, not *how*. `svc-backup` is a service account; service accounts don't normally authenticate interactively from a workstation at all, let alone request directory replication from one. That gap — how did a service account's credential end up usable from `WKS-4471` — is the actual question, and it's upstream of anything you'll find by going straight to the DC. You pull triage data from `WKS-4471` first.

## Step 2 — Prefetch

```
Source .pf file: SVCHOST_HELPER.EXE-9B2A7C41.pf
Run Count: 1
Last Run (local, WKS-4471): 03:12:14
Path: C:\Users\jsmith\AppData\Local\Temp\
```

Per [Prefetch](../01-windows-endpoint/prefetch.md): a name engineered to look system-related, a single execution, launched from a user's Temp folder. All three red flags at once. This is worth pulling threads on before you assume it's unrelated to the DFI alert.

## Step 3 — Sysmon on the same host

Event ID 1 (process creation) shows `SVCHOST_HELPER.EXE` spawning:

```
rundll32.exe C:\Windows\System32\comsvcs.dll, MiniDump 892 C:\Windows\Temp\~dc1.tmp full
```

This is the exact [LSASS memory-dump technique](../03-memory-forensics/lsass-memory-analysis.md) covered in Module 3 — PID 892 being `lsass.exe`. At this point you have a plausible mechanism: this is how an attacker on a single workstation could have obtained `svc-backup`'s credential material, if that account had ever authenticated interactively on this box (worth confirming separately, but consistent with the story so far).

Event ID 3 (network connection) on the same host shows an outbound connection at **03:15:38 (local, WKS-4471)** to an internal proxy address.

## Step 4 — the timestamps don't make sense yet, and that's the signal

Laid out naively, `WKS-4471`'s local times put the LSASS dump around 03:12–03:13 and the DFI-alerted DCSync at 03:16:55 — under four minutes apart. Possible, but tight enough to be worth checking rather than assuming, per [Timeline Construction & Correlation](../00-foundations/timeline-construction.md): **don't trust a single host's clock without calibrating it first.**

You pull the organization's central firewall/proxy log — independently timestamped, NTP-synced — and search for the same connection: matching source IP, destination, and port.

```
WKS-4471 local Sysmon Event ID 3 timestamp:   03:15:38
Firewall log, same connection, independent:    03:01:38
```

Fourteen minutes apart, for the identical event. `WKS-4471`'s clock is running **14 minutes fast**.

## Step 5 — correcting the timeline

Apply that correction to every timestamp `WKS-4471` generated locally — not just the one you checked:

| Event | As recorded (local, WKS-4471) | Corrected (true UTC) |
|---|---|---|
| `SVCHOST_HELPER.EXE` executes (Prefetch) | 03:12:14 | **02:58:14** |
| LSASS dumped via `comsvcs.dll` (Sysmon 1) | ~03:12:41 | **~02:58:41** |
| Outbound connection (Sysmon 3) | 03:15:38 | **03:01:38** *(matches firewall exactly — correction confirmed)* |

The DC-side events need no correction — the DC's clock is the accurate reference this whole correction was measured against:

| Event | Time (UTC, DC-accurate) |
|---|---|
| First failed logon, `svc-backup` | 03:14:02 |
| Second failed logon | 03:14:09 |
| Successful logon | 03:14:41 |
| DCSync (4662, replication GUID) | 03:16:55 |
| `AdminSDHolder` modified (5136) | 03:19:20 |
| Security log cleared (1102) | 03:21:03 |

## Step 6 — why the correction matters, not just the numbers

Before correction, the gap between "malware runs" and "attacker starts hitting the DC" looked like roughly 108 seconds — fast enough to suggest fully automated, scripted tooling. **After correction, it's about sixteen minutes** (02:58:14 to 03:14:02) — consistent with a human operator manually dumping LSASS, extracting the credential, and pivoting to the DC by hand. That's a materially different read on who and what you're dealing with, and it came entirely from a three-line calibration check against an independent log source.

## Step 7 — how much is enough to act on

By this point, three independently-generated sources agree with each other: `WKS-4471`'s Prefetch and Sysmon data (endpoint), the firewall log (network, used to calibrate and independently confirms the connection), and the DC's own Security log and DFI alert (directory service). Per [Timeline Construction & Correlation](../00-foundations/timeline-construction.md)'s standard — independent corroboration, not just internal consistency within one source — this is enough to treat the finding as confirmed, not provisional: `svc-backup`'s credential, very likely including `krbtgt`, is compromised.

## What happens from here

This is exactly where the [Domain Compromise playbook](../08-playbooks/domain-compromise.md) picks up — isolate `WKS-4471`, disable `svc-backup`, and begin the [`krbtgt` double-reset](../02-active-directory/krbtgt.md). The DC-side sequence above — 03:14:02 through 03:21:03 — is precisely the [Event Log Story](../practice-drills/event-log-drill.md) drill; if you haven't tried reconstructing it cold, it's a good next step now that you've seen where it comes from.

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [Reporting & Communication](../00-foundations/reporting-and-communication.md)
- [Case Study: Business Email Compromise, End to End](bec-case-study.md)
- [Case Studies](index.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — timeline analysis and Active Directory incident response)
- This case study's data is original and synthetic, built to exercise techniques sourced individually on the linked pages above
