Picture the moment a compromised hybrid account gets identified. The instinctive response — the one that feels complete — is: reset the password, done, incident contained. That instinct is wrong in a way that has real, measurable consequences, and understanding exactly why is the single most load-bearing piece of reasoning in this entire academy's cloud-identity coverage.

> [!PLAIN]
> "Hybrid" here means the account exists in on-premises Active Directory *and* is synced to Entra ID — the overwhelming majority of enterprise accounts, in practice. Everything in this lesson assumes that setup.

## Why a password reset alone doesn't end an active session

When a user authenticates to Entra ID, they don't get handed their password back for every subsequent request — they get an **access token** (short-lived, typically about an hour) and a **refresh token** (long-lived, valid for a much longer window, sometimes 90 days or more depending on tenant configuration). The refresh token is what silently renews the access token in the background, which is the entire reason you don't get asked to log into Outlook every hour.

Here's the part that matters: **a refresh token is not derived from the password at the moment it's used.** It was issued once, at initial sign-in, based on a password that was valid *then*. Resetting the password today does not reach backward in time and invalidate a token that was already issued. The attacker's session — on their device, in their browser, wherever they authenticated — keeps working via that refresh token, silently renewing itself, completely unaffected by the password change you just made.

> [!CAUTION]
> This is the single most common mistake in hybrid incident response: resetting the password, confirming the user can no longer sign in *fresh*, and treating the incident as contained — while an attacker's already-issued refresh token continues renewing access in the background, unaffected the entire time.

## Why PowerShell, not the GUI, for session revocation

The Entra admin center's GUI password-reset flow does not, by itself, revoke already-issued sessions. What actually forces every device and application to drop its current session and re-authenticate from scratch is explicit session revocation — and the reliable way to do that is PowerShell, specifically the Microsoft Graph module:

```powershell
Connect-MgGraph -Scopes "User.RevokeSessions.All"
Revoke-MgUserSignInSession -UserId "user@yourdomain.com"
```

`Revoke-MgUserSignInSession` invalidates the refresh tokens tied to that account directly. Because every mobile app, desktop client, and web session for that account is relying on the same underlying refresh-token mechanism to stay signed in, this one call forces re-authentication **everywhere, simultaneously** — Outlook mobile, Teams desktop, a browser session on some machine you've never even seen. There is no GUI equivalent that reaches every one of those surfaces in one action the way this single PowerShell call does.

> [!IMPORTANT]
> Password reset and session revocation are two separate actions that do two separate things. Skipping either one leaves a real gap:
>
> - Reset the password **without** revoking sessions → the attacker's existing session keeps working via the still-valid refresh token, indefinitely, until it naturally expires.
> - Revoke sessions **without** resetting the password → you've killed the current session, but the attacker can simply sign back in again with the same password.
>
> Both actions, every time, in either order — but neither one substitutes for the other.

## Why hybrid accounts specifically need the password reset done twice

This is the step that's easy to skip because it looks redundant, and it is the one this lesson exists to make sure you never skip.

A hybrid account's authoritative password source depends on which sync mechanism the tenant runs — Password Hash Sync, Pass-Through Authentication, or Federation — and on-premises Active Directory is the source of truth in all three. Entra Connect syncs changes from on-prem AD to Entra ID on a cycle (roughly every two minutes for Password Hash Sync by default, and on-demand if you trigger it manually). That sync cycle is exactly where a single reset can quietly fail to hold:

1. You reset the password once — in the Entra admin center, in on-prem AD, or both, often done quickly and under pressure as the very first remediation action.
2. Before you've confirmed which direction the sync actually needs to run, or before a sync cycle has completed, there's a real window where the *effective* live password on one side doesn't match what you think you just set.
3. A second, deliberate reset — done *after* you've confirmed sync direction and let a cycle complete — is what actually guarantees the password the attacker may have observed or logged during their access is not the one that ends up live.

> [!IMPORTANT]
> Which sync mechanism the tenant runs changes where the authoritative reset must happen first. **Password Hash Sync** — on-premises AD is authoritative, so reset there and let sync carry it up. **Pass-Through Authentication** — validation happens against on-premises AD in real time, so the on-premises reset is immediately effective. **Federation (AD FS)** — authentication never reaches Entra at all, which means a compromised token-signing certificate makes password resets irrelevant entirely; see [Golden SAML](#/lesson/l3-17-golden-saml). Confirm the mechanism before starting, not during.

## The full runbook, in order

1. **Revoke sessions** via `Revoke-MgUserSignInSession` — stop the active session immediately, regardless of what happens with the password next.
2. **Reset the password** the first time — on-premises AD if the tenant is hybrid-synced, since on-prem is authoritative.
3. **Force a Entra Connect delta sync** rather than waiting for the next automatic cycle — don't leave this to chance during an active incident.
4. **Reset the password a second time**, after confirming the sync completed — this is the step that closes the window described above.
5. **Revoke sessions again** — cheap, fast, and removes any doubt that a session established between steps 1 and 4 survived.
6. **Review what the account touched while compromised** — mailbox rules, OAuth grants, app registrations. A killed session doesn't undo what already happened during it; see the [Persistence Catalog's cloud entries](#/lesson/l3-14-oauth-consent-grants) for exactly what to check.

> [!WARNING]
> None of this is a substitute for reviewing MFA methods registered on the account. An attacker who registered their own MFA method during their access window can simply re-authenticate through it later, session revocation and password resets notwithstanding. Remove any authentication method you don't recognize as part of this same runbook, not as an afterthought.

This sequence — revoke, reset, sync, reset again, revoke again — is the one runbook in this academy worth memorizing well enough to execute correctly at 2 a.m. under real pressure, because the two failure modes it prevents (a session that silently survives, and a password reset that silently reverts) are exactly the two things that turn a contained incident back into an active one.

## Sources

- [Microsoft Learn — Revoke user access in Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity/users/users-revoke-access)
- [Microsoft Learn — Revoke-MgUserSignInSession](https://learn.microsoft.com/en-us/powershell/microsoftgraph/)
- [Microsoft Learn — Microsoft Entra Connect: password hash synchronization](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-password-hash-synchronization)
- MITRE ATT&CK — [T1078.004 Valid Accounts: Cloud Accounts](https://attack.mitre.org/techniques/T1078/004/)
