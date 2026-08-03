---
tags:
  - Cloud Identity
---

# Module 6: Cloud Identity (Entra ID / Hybrid)

Covers Microsoft Entra ID (formerly Azure AD) sign-in and audit telemetry, Conditional Access, Identity Protection, and — critically for most enterprises — the mechanics of **hybrid identity**, where an on-prem Active Directory account and its cloud counterpart are two records that must both be handled correctly during an incident.

## Module status: complete

- [x] [Sign-In Logs vs. Audit Logs](sign-in-vs-audit-logs.md) — what each captures, and the retention trap between Entra's native logs and the Purview Unified Audit Log
- [x] [Conditional Access in an Investigation](conditional-access-investigation.md)
- [x] [Identity Protection Risk Signals](identity-protection-risk-signals.md) — impossible travel, atypical travel, anonymized IP, leaked credentials
- [x] [Hybrid Sync Mechanics](hybrid-sync-mechanics.md) — password hash sync vs. pass-through authentication vs. federation
- [x] [The Entra Connect Server: A Target in Its Own Right](entra-connect-as-target.md) — why this box carries DCSync-equivalent risk

## Hybrid account-compromise runbook (available now)

This is the one piece of this module that's fully written, because it directly answers two specifics worth getting exactly right.

### Why the password gets reset *twice* in hybrid environments

For a hybrid-joined account, Microsoft's own emergency-access guidance is explicit: reset the on-prem Active Directory password **twice**, not once. The reasoning is about timing, not superstition — if there's any delay in on-prem-to-cloud password replication (via Entra Connect / password hash sync), a single reset can leave a window where the *old* password hash is still valid somewhere in the sync pipeline, which is exactly the condition a pass-the-hash attack exploits. A second reset closes that window regardless of where the delay actually occurred. If you can confidently rule out compromise of the credential itself, Microsoft's own guidance allows a single reset — but for a suspected-compromised account, treat the double reset as the default, not the exception.

### Why PowerShell, not the admin-center GUI, for session revocation

Disabling an account and resetting its password does **not** by itself invalidate tokens already issued to that account. An attacker holding a valid refresh token can keep minting new access tokens against Exchange Online, SharePoint, Teams, and any other app that token was scoped to — until that refresh token is explicitly revoked.

The current tool for this is the `Revoke-MgUserSignInSession` cmdlet (Microsoft Graph PowerShell SDK):

```powershell
Connect-MgGraph -Scopes "User.ReadWrite.All"
Revoke-MgUserSignInSession -UserId "user@contoso.com"
```

This invalidates every refresh token issued to every application for that user, plus browser session cookies, in one call — by resetting a session-validity timestamp on the account itself, rather than needing to individually revoke sessions app by app. That's the forceful, simultaneous, cross-app behavior that makes it the right tool over the GUI's more piecemeal session-revocation options.

!!! danger "Deprecated — don't use"
    Older guides reference `Revoke-AzureADUserAllRefreshToken` from the legacy `AzureAD` PowerShell module. That module is being retired — use `Revoke-MgUserSignInSession` from the Microsoft Graph SDK instead.

!!! success "Full remediation order for a compromised hybrid account"
    1. Disable the account in on-prem Active Directory (the source of authority)
    2. Reset the on-prem password **twice**
    3. Run `Revoke-MgUserSignInSession` against the Entra ID account
    4. Review and remove any [persistence](../05-persistence/index.md) the attacker may have added — OAuth grants, mailbox rules, MFA methods — before re-enabling

Access tokens already issued before revocation remain valid until they naturally expire (commonly up to an hour) — revocation stops new token issuance, it does not retroactively kill tokens already in an attacker's hands. Plan containment (network/Conditional-Access blocking) accordingly if that window matters for your scenario.

<!-- BACKLINKS:START -->
## Referenced From

- [Evidence Handling & Chain of Custody — for Enterprise IR](../00-foundations/evidence-handling.md)
- [Order of Volatility](../00-foundations/order-of-volatility.md)
- [Persistence: Backdoor App Registrations & Service Principal Credentials](../05-persistence/backdoor-app-registrations.md)
- [Persistence: Break-Glass / Emergency-Access Account Abuse](../05-persistence/break-glass-abuse.md)
- [Persistence: Federation Trust Abuse ("Golden SAML")](../05-persistence/golden-saml.md)
- [Module 5: Persistence Catalog](../05-persistence/index.md)
- [Persistence: Mailbox Forwarding Rules & Delegate Access](../05-persistence/mailbox-forwarding-rules.md)
- [Hybrid Sync Mechanics](hybrid-sync-mechanics.md)
- [Advanced Hunting with KQL](../07-defender-suite/advanced-hunting-kql.md)
- [Playbook: Business Email Compromise (BEC)](../08-playbooks/business-email-compromise.md)
- [Playbook: Data Exfiltration](../08-playbooks/data-exfiltration.md)
- [Playbook: Domain Compromise / Lateral Movement](../08-playbooks/domain-compromise.md)
- [Module 8: Investigation Playbooks](../08-playbooks/index.md)
- [Playbook: Phishing (Initial Access)](../08-playbooks/phishing.md)
- [Case Study: Business Email Compromise, End to End](../case-studies/bec-case-study.md)
- [Enterprise DFIR Field Guide](../index.md)
- [Windows IR Quick Reference](../quick-reference/windows-ir-poster.md)

<!-- BACKLINKS:END -->

## Sources

- [Microsoft Learn — Revoke user access in an emergency in Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity/users/users-revoke-access)
- [Microsoft Learn — Revoke-MgUserSignInSession reference](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.users.actions/revoke-mgusersigninsession?view=graph-powershell-1.0)
