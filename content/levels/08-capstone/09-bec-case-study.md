No malware. No endpoint compromise. No credential theft in the usual sense. This is the shape of the most common enterprise incident there is, and it defeats the standard response almost every time.

**Contoso Financial Advisors.** ~180 employees, Microsoft 365 E3, MFA enforced for all users, no Conditional Access beyond Security Defaults.

---

## Week 1 — The consent

A senior advisor receives a link to what appears to be a document-sharing application. She clicks, lands on **the genuine Microsoft consent page** — real domain, valid certificate, correct branding — and approves an application requesting `Mail.Read`, `Mail.Send`, and `offline_access`.

> [!IMPORTANT]
> MFA was enforced and worked correctly. She authenticated properly. No password was stolen, because the attack never needed one — this is [the illicit consent grant](#/lesson/l2-03-oauth-consent-grants), and MFA is not a control against it. The `offline_access` scope granted a refresh token, and the attacker had durable mailbox access from that moment.

## Weeks 1–4 — Reading

Nothing else happens. The attacker reads mail and learns the business: which clients are mid-transaction, how the firm phrases payment instructions, who signs off on what, when the managing partner travels.

The only artifact generated is `MailItemsAccessed` — which is exactly why [the BEC playbook](#/lesson/l8-01-playbook-bec) treats it as the operation that separates "an account was accessed" from a defensible statement about exposure.

## Week 4 — Establishing position

Three actions in one session:

1. A [hidden inbox rule](#/lesson/l5-11-mailbox-forwarding-rules) created via EWS, invisible in Outlook: messages containing `wire`, `remittance`, or `payment instructions` move to **RSS Feeds** and are marked read.
2. An additional **MFA method registered** on the account — an authenticator the attacker controls.
3. A lookalike domain registered: `contoso-financial.com` against the real `contosofinancial.com`.

## Week 5 — The fraud

A client is completing a property transaction. The attacker, **from the genuine mailbox**, sends updated wire instructions. The message passes SPF, DKIM, and DMARC perfectly — because it is genuinely from Contoso.

The client's reply querying the change is captured by the inbox rule and never reaches the advisor. The attacker answers it, reassuringly, from the same real mailbox.

**£340,000 is wired to the attacker's account.**

## Week 5, day 4 — Detection

The client telephones about the completion. The advisor has no idea what they are talking about.

---

## The response, including the mistake

**Hour 1 — the error.** IT reset the password immediately. Reasonable instinct, entirely ineffective: [the refresh token was unaffected](#/lesson/l2-04-hybrid-runbook), and the OAuth grant had never depended on the password at all. The attacker retained full access and, from the audit log, was still reading mail forty minutes later.

**Hour 3 — correction.** Sessions revoked via PowerShell. The attacker-registered MFA method found and removed. Access finally terminated — **but only** once the OAuth grant was revoked, the service principal disabled, and refresh tokens revoked, all three.

**Day 2 — scoping.** `MailItemsAccessed` established which messages had actually been read over five weeks, supporting a defensible statement rather than an assumption. Two other client transactions had been observed but not acted on.

**Day 2 — the wire.** Recall initiated on day 5 of the fraud, well outside the practical window. £340,000 was not recovered.

## What actually would have prevented it

- **Restricting user consent** to verified publishers and low-impact permissions — a single tenant setting that removes the entire attack.
- **Alerting on inbox rule creation** — Microsoft 365 ships the alert policy; nobody had routed it anywhere a human read.
- **Alerting on MFA method registration**, which would have flagged week 4 directly.
- **Out-of-band verification of payment-detail changes** — a process control, not a technical one, and the only thing on this list that would have stopped the loss *after* every technical control had already failed.

> [!WARNING]
> The lesson worth taking from this case is narrow and uncomfortable: **MFA, SPF, DKIM, and DMARC all worked exactly as designed throughout.** Every technical email control the firm had deployed functioned correctly, and none of them was relevant to what actually happened.

## Sources

- MITRE ATT&CK — T1566, T1098.003, T1114.003
- [Microsoft Learn — Detect and remediate illicit consent grants](https://learn.microsoft.com/en-us/defender-office-365/detect-and-remediate-illicit-consent-grants)
