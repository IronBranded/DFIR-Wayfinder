[Conditional Access in an Investigation](#/lesson/l6-03-conditional-access-investigation) covers reading which policies evaluated for a sign-in. This lesson covers the gap right next to it: authentication paths that never evaluate against Conditional Access **at all**, regardless of how tightly the policies are written.

> [!IMPORTANT]
> An account protected by phishing-resistant MFA, enforced through a well-built Conditional Access policy, is **not actually protected** if that same account can still authenticate via a legacy protocol that bypasses Conditional Access entirely. The MFA requirement isn't wrong — it's just never being asked.

## Which protocols bypass Conditional Access, and why

**SMTP AUTH, POP3, and IMAP4** are legacy authentication protocols that predate modern, token-based auth (OAuth). They authenticate with a raw username and password, and — critically — **Conditional Access policies are enforced after first-factor authentication completes through the modern auth stack**. Legacy protocols never enter that stack in the first place, so there's nothing for Conditional Access to evaluate against. A policy requiring MFA for every sign-in simply has no opportunity to apply.

**Certificate-based authentication for Exchange ActiveSync**, when performed directly between the client and Exchange Online rather than through Entra ID, is classified by Microsoft as legacy authentication for exactly the same reason — the client never obtains a standard OAuth token, so Conditional Access has nothing to intercept.

## The current state, and why it's still live risk

Microsoft disabled most Basic Authentication for Exchange Online by default back in 2022 — **with one significant, long-standing exception: SMTP AUTH for Client Submission**, which remained available. As of Microsoft's most recent published timeline: SMTP AUTH Basic Authentication behavior is unchanged through the end of 2026, will then be **disabled by default for existing tenants** (administrators can still manually re-enable it), and will be **unavailable by default for new tenants** created after that point, with full removal planned for the second half of 2027.

> [!PLAIN]
> Translate that plainly: as of right now, most existing tenants still have SMTP AUTH Basic Authentication enabled by default unless someone has explicitly disabled it or blocked it via Conditional Access. This is not a historical vulnerability — it's a live, currently-exploitable gap in a large share of real enterprise tenants today.

Two mechanisms exist to close it, and they're not the same:

- **Security Defaults** — Microsoft's simpler, all-or-nothing baseline — blocks legacy authentication for most scenarios automatically. Tenants running Security Defaults are largely already protected.
- **Custom Conditional Access** requires an *explicit* policy blocking legacy authentication client apps — and in practice, many organizations that built their own Conditional Access carve out **exceptions** for exactly the systems that most need to be protected: shared mailboxes, printers and scan-to-email devices, and older line-of-business applications that were never updated to support OAuth.

> [!WARNING]
> Don't assume "we have Conditional Access" means legacy authentication is blocked. Confirm there's an explicit policy targeting "Exchange ActiveSync clients" and "Other clients" with a block action — and separately confirm which accounts are excepted from it, since that exception list is exactly where this gap tends to live in a mature environment.

## Normal baseline

Legacy authentication protocols are disabled entirely, or restricted to a small, explicitly documented set of accounts and devices with a real operational reason (a specific multifunction printer's scan-to-email credential, for instance) — not left broadly available "just in case" across the tenant.

## Red flags

- **A successful sign-in using a legacy authentication protocol** (SMTP AUTH, POP3, IMAP4, or direct EAS certificate-based auth) on an account that also has MFA enforced through Conditional Access — the two facts together mean the MFA requirement is being routed around, not satisfied.
- **Legacy protocol authentication from an account with no documented legitimate reason to use one** — a standard user mailbox authenticating via IMAP when the organization's client policy is Outlook/OWA only.
- **A Conditional Access exception list that includes accounts beyond the specific documented printers/line-of-business systems** it was created for — exception creep is a common, gradual way this gap reopens after being closed once.

## How to collect it

Microsoft Entra sign-in logs directly identify the authentication protocol and client app used for each sign-in — filter for legacy authentication client app types specifically rather than assuming Conditional Access coverage from policy configuration alone. Reviewing actual sign-in activity confirms what's really happening, not just what the policy intends.

## ATT&CK mapping

Enables [Valid Accounts: Cloud Accounts (T1078.004)](https://attack.mitre.org/techniques/T1078/004/) to succeed despite MFA controls that would otherwise block it — this isn't a distinct technique so much as a gap that neutralizes the defenses covering that technique. Directly relevant to the [hybrid account-compromise runbook](#/lesson/l6-01-hybrid-runbook): a password reset alone doesn't help if the compromised credential can still authenticate via a protocol Conditional Access never sees.
