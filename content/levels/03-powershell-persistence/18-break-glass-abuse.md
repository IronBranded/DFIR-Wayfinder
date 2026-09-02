Break-glass accounts exist because Conditional Access, MFA providers, and federation servers all fail sometimes, and when they do, somebody has to be able to get in and fix it. To guarantee that, these accounts are **deliberately excluded** from the controls that protect everything else.

That exclusion is the entire point, and it is also exactly why they make such effective backdoors.

## What a properly-configured break-glass account looks like

- **Two accounts**, so a single failure or compromise does not lock the organization out.
- **Cloud-only** — not synced from on-premises AD, so an on-prem compromise cannot reach them.
- **Global Administrator**, permanently assigned rather than eligible through PIM (PIM activation may depend on the very systems that are broken).
- **Excluded from all Conditional Access policies**, by design.
- **Credentials split** — long random passwords or FIDO2 keys, held in physical safes, ideally under split knowledge so no single person can use one alone.
- **Every sign-in alerts**, at high priority, to a human.

That last item is the control that makes the rest safe.

> [!IMPORTANT]
> A break-glass account is the one identity in the tenant where **a single successful sign-in is an incident until proven otherwise**. There is no routine use. If one authenticates and nobody declared an emergency, that is the finding — no further correlation needed.

## Two ways an attacker uses this

**Using an existing break-glass account.** If the credential is recoverable — a password manager, a document on a file share, a wiki page — the attacker gets an account that bypasses MFA and Conditional Access by design, and that many organizations have never alerted on because "nobody uses it."

**Creating their own.** The more common and more durable version: create an ordinary-looking account, grant it privilege, then **add it to the exclusion lists of Conditional Access policies**. It now has the same protection profile as a genuine break-glass account, and it looks like routine policy administration in an audit log unless someone is specifically diffing exclusion lists.

That second variant is the one worth building detection for, because nothing about the account itself looks unusual — the anomaly is in the **policy**, not the identity.

## Normal baseline

Exactly two break-glass accounts exist, documented, with alerting on any authentication. Conditional Access exclusion lists contain only those accounts plus a small, documented set of service identities. Exclusion lists change rarely, and every change has a ticket.

## Red flags

- **Any break-glass sign-in without a declared emergency.**
- **A new account added to a Conditional Access exclusion list.**
- **An existing service account newly added to an exclusion**, which is the quieter version of the same move.
- **A Conditional Access policy modified to narrow its scope**, achieving exclusion without touching an exclusion list.
- **A break-glass account whose password was changed** outside a documented rotation.
- **Break-glass credentials found in a password manager, share, or documentation** — a standing exposure regardless of incident.

## How to collect it

The Entra audit log records **"Update conditional access policy"**. The critical practice is **diffing the exclusion lists over time**, since the audit entry alone shows that a policy changed without making clear what the change meant. Alert on break-glass sign-ins directly in the sign-in log, at a priority that reaches a person rather than a dashboard.

Reviewing exclusions is worth doing on a schedule rather than only during incidents — exclusions accumulate quietly, often for legitimate short-term reasons that nobody removes afterward.

## ATT&CK mapping

[Valid Accounts: Cloud Accounts (T1078.004)](https://attack.mitre.org/techniques/T1078/004/) and [Modify Authentication Process: Conditional Access Policies (T1556.009)](https://attack.mitre.org/techniques/T1556/009/).

## Sources

- [Microsoft Learn — Manage emergency access accounts](https://learn.microsoft.com/en-us/entra/identity/role-based-access-control/security-emergency-access)
- MITRE ATT&CK — T1078.004
