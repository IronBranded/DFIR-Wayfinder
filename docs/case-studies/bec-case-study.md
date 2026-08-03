---
tags:
  - Case Study
---

# Case Study: Business Email Compromise, End to End

Where the [Domain Compromise case study](domain-compromise-case-study.md) is about a wrong clock, this one is about a different — and arguably more dangerous — timing trap: a log source that's telling the truth, but not yet. Cloud logs don't have the clock-skew problem endpoint logs do (Microsoft's own timestamps are reliably UTC-accurate), but they have a different one, and it can lead an investigator to declare an incident clean when it isn't.

## The trigger

**10:00 UTC** — Finance escalates a payment-change email that came from a colleague's real address, requesting a vendor bank-account update. IR is engaged fast — under an hour after the actual compromise, as it turns out, which is genuinely good detection. Good detection doesn't remove the timing trap waiting downstream.

## Step 1 — confirm the account is actually compromised

First move, per the [BEC playbook](../08-playbooks/business-email-compromise.md): pull sign-in logs for the sender. [Entra ID sign-in logs are near-real-time](../06-cloud-identity/sign-in-vs-audit-logs.md) — unlike the Unified Audit Log, they don't carry meaningful ingestion delay, which is exactly why they're the right place to start.

```
10:05 UTC — sign-in log query
Result: new session, 09:15 UTC, unfamiliar device, MFA satisfied,
        client: modern browser via unfamiliar egress IP
```

MFA being satisfied doesn't clear this — it raises the stakes. A satisfied-MFA sign-in from an unfamiliar device is consistent with an [AiTM phishing kit](../08-playbooks/phishing.md) having relayed a live, MFA-passed session rather than a simple password guess. Confirmed: this account is compromised, as of 09:15 UTC.

## Step 2 — check for persistence, and hit an apparent dead end

Per the [Persistence Catalog](../05-persistence/mailbox-forwarding-rules.md), the next move is checking for a forwarding rule or delegate grant — the mechanism that would let an attacker keep reading this mailbox even after the password is reset.

```
10:08 UTC — Unified Audit Log query
Search: New-InboxRule, Set-Mailbox (ForwardingSmtpAddress)
User: (mapped from the finance report's display name to the correct UPN
       via the sign-in log entry above — the two systems don't always
       reference the same account the same way)
Result: no matching events
```

**This is the trap.** It's tempting to read "no results" as "no persistence mechanism was planted" and move straight to remediation. Don't.

## Step 3 — why "no results" doesn't mean "nothing happened"

[Timeline Construction & Correlation](../00-foundations/timeline-construction.md) frames this generally; here's the specific mechanism. The Unified Audit Log does not ingest events instantly — Microsoft's own documented figure for core services (Exchange included) is **typically 60 to 90 minutes** between an event occurring and it becoming searchable. The query above ran at 10:08, roughly **51 minutes** after the 09:15 compromise — comfortably inside that window. A malicious inbox rule created at, say, 09:17 may simply not be indexed yet. The query didn't find nothing because there's nothing there; it found nothing because it asked too early.

!!! danger "The actual failure mode this causes"
    An analyst who takes the empty query result at face value, declares "no persistence found," and closes the loop on eradication — while a forwarding rule that hasn't shown up yet keeps forwarding every subsequent email to the attacker, undetected, because nobody checked again.

## Step 4 — the correct move: act on what you know, verify again later

You already have enough independently-confirmed compromise (Step 1) to act — you don't need UAL confirmation of persistence to justify containment. Proceed immediately with the [hybrid account-compromise runbook](../06-cloud-identity/index.md#hybrid-account-compromise-runbook-available-now): disable, reset (twice, if hybrid-joined), and run `Revoke-MgUserSignInSession`. Then set a deliberate re-check:

```
11:20 UTC — Unified Audit Log query, re-run
Result: New-InboxRule, 09:17 UTC, forwarding to an external address,
        auto-delete on the original after forward
```

Now visible — roughly two hours after the underlying event, safely past the documented ingestion window. The rule gets removed per [Mailbox Forwarding Rules](../05-persistence/mailbox-forwarding-rules.md), and every email that matched it between 09:17 and removal gets treated as read by the attacker for breach-notification purposes.

## Step 5 — how much is enough to act on, at each stage

Two different evidentiary bars appear in this case study, and it's worth naming both:

- **At Step 1**, one independent, fast, high-confidence source (the sign-in log) was enough to justify immediate containment. Containment doesn't need to wait for every possible corroborating source — the cost of acting on a confirmed-anomalous sign-in is low and the cost of waiting is not.
- **At Step 2**, one *negative* result from a source with known latency was **not** enough to justify standing down. Absence of evidence from a source that hasn't finished ingesting isn't evidence of absence — the correct response to an inconclusive negative is to act on what's already confirmed and re-check later, not to treat silence as an answer.

Knowing which bar applies when — acting fast on strong positive evidence, refusing to act on a premature negative — is most of what separates a fast, correct response from a fast, wrong one.

<!-- BACKLINKS:START -->
## Referenced From

- [Case Studies](index.md)

<!-- BACKLINKS:END -->

## Sources

- [Microsoft Learn — Search the audit log](https://learn.microsoft.com/en-us/purview/audit-search) (documented 60–90 minute typical ingestion window for core services)
- This case study's data is original and synthetic, built to exercise techniques sourced individually on the linked pages above
