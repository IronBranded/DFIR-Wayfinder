---
tags:
  - Persistence
  - Cloud
  - T1078
  - T1078.004
---

# Persistence: Break-Glass / Emergency-Access Account Abuse

**ATT&CK:** [T1078.004](https://attack.mitre.org/techniques/T1078/004/) — Valid Accounts: Cloud Accounts

## The mechanism

Most well-run Entra ID tenants maintain one or two "break-glass" accounts — highly privileged, deliberately excluded from Conditional Access and sometimes even from MFA, kept in reserve for the specific scenario where a misconfiguration or outage locks legitimate admins out of everything else. That deliberate exclusion from normal controls is exactly what makes these accounts an exceptional persistence target: an attacker who compromises or backdoors one gets a foothold that's structurally exempt from the policies that would otherwise catch or block them.

Two distinct sub-patterns: directly compromising the break-glass account's credentials (they're often stored somewhere far less secure than the process demands — a password manager, a sealed envelope, a document nobody's rotated in years), or quietly adding a new principal into that account's Conditional Access exclusion scope, effectively creating a *second*, attacker-controlled break-glass account riding on the same policy exemptions.

## Where the evidence lives

Entra ID sign-in logs for the break-glass account itself — this is the one place in this entire catalog where the detection rule is closest to absolute: **these accounts should show essentially zero sign-in activity**, ever, outside a genuine declared emergency. Also monitor Conditional Access policy audit events for any change to exclusion lists.

## Detection approach

Alert on **any** sign-in to a designated break-glass account, full stop — the extremely low legitimate usage rate makes this one of the very few identity signals where near-zero false-positive tolerance is realistic. Separately, audit Conditional Access policy exclusion lists on a regular cadence; an unreviewed exclusion list is exactly where a second, illegitimate break-glass path gets planted and forgotten.

!!! danger "Red flag"
    Any sign-in event for a break-glass account without a corresponding, pre-declared emergency-access justification.

## Cleanup

Rotate the break-glass account's credentials immediately (and re-secure however they're stored), review the Conditional Access exclusion lists across every policy for unauthorized additions, and treat every action taken during any unauthorized session on this account as maximally privileged — assume it had access to essentially everything in the tenant.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 5: Persistence Catalog](index.md)

<!-- BACKLINKS:END -->

## Sources

- [MITRE ATT&CK — T1078.004](https://attack.mitre.org/techniques/T1078/004/)
- [Module 6: Cloud Identity](../06-cloud-identity/index.md) — Conditional Access fundamentals
