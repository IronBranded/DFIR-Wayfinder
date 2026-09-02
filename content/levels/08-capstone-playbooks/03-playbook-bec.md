Business Email Compromise is the most common enterprise incident that involves no malware at all. The attacker logs in with valid credentials and behaves, from the system's perspective, exactly like the user. That shapes everything about how this playbook runs.

## Trigger

A user reports mail they didn't send. Finance flags an invoice with changed bank details. A sign-in risk or impossible-travel alert fires. A partner organization reports receiving fraud from your domain.

## First hour

**1. Contain the session, not just the password.** Reset the password *and* revoke sessions via PowerShell — a GUI-only reset leaves existing refresh tokens valid, and the attacker keeps working through them. If the account is hybrid, the password must be reset twice. The full mechanism is in [the hybrid runbook](#/lesson/l6-01-hybrid-runbook); this is the single most commonly botched step in BEC response.

**2. Check for attacker-registered MFA.** An attacker who enrolled their own authenticator method retains access through your password reset. Enumerate and remove unrecognized MFA methods in the same action as the reset, not afterward.

**3. If money moved, start the recall in parallel.** Wire recall windows are measured in hours. This is not an IR task that waits for technical scoping — hand it to finance and legal immediately while the investigation continues.

## Scoping

- **What did they read?** `MailItemsAccessed` is the operation that answers this, and it is the difference between "an account was accessed" and a defensible statement about data exposure.
- **What did they send?** Message trace, including items sent and then deleted from Sent Items.
- **What did they leave behind?** [Mailbox rules](#/lesson/l3-16-mailbox-forwarding-rules) — including hidden rules created via MAPI that don't render in Outlook — and forwarding configured at the mailbox or transport level.
- **What did they authorize?** [OAuth consent grants](#/lesson/l3-14-oauth-consent-grants) survive password resets entirely and are a frequently-missed persistence path.
- **Where else did they go?** BEC rarely stops at one mailbox. Check for internal phishing sent from the compromised account, and for sign-ins from the same infrastructure to other accounts.

## Containment ordering

There is a genuine tension here: containment tips off the attacker, who may delete rules and sent items in response. In BEC the tension usually resolves toward **contain first** — ongoing fraud is an active financial loss — but capture mailbox rules and recent sent items before or simultaneously with the reset where you can.

## Closure criteria

Sessions revoked and password reset (twice, if hybrid). Unrecognized MFA methods removed. All malicious rules and forwarding removed at both mailbox and transport level. OAuth grants reviewed and revoked. Every other account contacted by the compromised one triaged. A defensible statement of what was accessed, based on `MailItemsAccessed` rather than assumption.

## Common mistakes

- Resetting the password without revoking tokens — the attacker never loses access.
- Treating the reported mailbox as the whole incident.
- Removing rules without checking OAuth grants, leaving persistence in place.
- Declaring containment before confirming no attacker-registered MFA method remains.

## ATT&CK mapping

[Valid Accounts: Cloud Accounts (T1078.004)](https://attack.mitre.org/techniques/T1078/004/), [Email Collection (T1114)](https://attack.mitre.org/techniques/T1114/), [Account Manipulation (T1098)](https://attack.mitre.org/techniques/T1098/).

## Sources

- [Microsoft Learn — Responding to a compromised email account](https://learn.microsoft.com/en-us/defender-office-365/responding-to-a-compromised-email-account)
- MITRE ATT&CK — T1078.004, T1114
