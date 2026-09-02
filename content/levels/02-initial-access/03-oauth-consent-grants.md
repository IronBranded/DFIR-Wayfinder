Every endpoint persistence mechanism in this level survives a reboot. This one survives something harder: a full password reset. It was never a password to begin with — it is a token the user themselves authorized, and revoking the credential does nothing to it.

## How the attack works

OAuth 2.0 lets an application request permissions (scopes) from a user. The user is shown a consent screen, approves, and the application receives tokens it can use going forward.

The illicit consent grant attack simply uses that mechanism honestly:

1. The victim receives a link — phishing, but the payload is a legitimate authorization URL.
2. They land on the **real Microsoft consent page**, at a genuine Microsoft domain, with a valid certificate.
3. They approve an application they believe is legitimate.
4. The attacker's application now holds tokens for that user's mailbox and files.

> [!IMPORTANT]
> There is no credential theft anywhere in this chain. The user never typed a password into anything attacker-controlled. This is why the usual BEC advice — reset the password, revoke sessions — leaves the attacker's access completely intact, and why [the BEC playbook](#/lesson/l8-01-playbook-bec) treats OAuth review as a mandatory containment step rather than a follow-up.

## The scope that turns access into persistence

**`offline_access`** is the one to know. It grants a **refresh token**, which lets the application obtain new access tokens indefinitely without the user being present again. Without it, access expires quickly. With it, access is durable.

Alongside it, the scopes worth flagging on sight: `Mail.Read`, `Mail.ReadWrite`, `Mail.Send`, `Files.Read.All`, `User.Read.All`.

## Delegated versus application permissions

**Delegated** permissions let the app act *as the user*, limited to what that user can do. **Application** permissions let the app act *as itself*, with no user involved at all — meaning nothing about that user's account state, including disabling it, affects the app's access. Application permissions require admin consent, which makes them rarer and considerably more serious when present.

## Prevention

Tenant user-consent settings control whether ordinary users can grant consent at all. The recommended configuration allows user consent only for **verified publishers** and **low-impact permissions**, routing anything else to an admin consent request workflow. This single setting removes most of the attack surface.

## Normal baseline

Consent grants correspond to applications the organization deployed or approved. Publishers are verified. Scopes are proportionate to what the application does. Admin-consented application permissions are few, documented, and reviewed.

## Red flags

- **A consent grant including `offline_access`** alongside mail or file scopes, from an unverified publisher.
- **An application requesting scopes disproportionate to its stated function.**
- **Multiple users consenting to the same unfamiliar application in a short window** — a campaign, not an individual mistake.
- **Application (app-only) permissions granted** outside a documented deployment.
- **A grant created during a suspected intrusion window**, even to an application that looks plausible.

## How to collect it

The Entra audit log records **"Consent to application"** and **"Add delegated permission grant"** (`Add OAuth2PermissionGrant`), along with **"Add service principal"**. Enumerate current grants with `Get-MgOauth2PermissionGrant` and service principals with `Get-MgServicePrincipal`, reconciling both against an approved-application inventory.

Remediation requires **all three** steps: remove the permission grant, disable or delete the service principal, and revoke the user's refresh tokens. Removing the grant alone can leave tokens valid until expiry.

## ATT&CK mapping

[Account Manipulation: Additional Cloud Roles (T1098.003)](https://attack.mitre.org/techniques/T1098/003/), with the delivery step mapping to [Phishing (T1566)](https://attack.mitre.org/techniques/T1566/).

## Sources

- [Microsoft Learn — Investigate and remediate illicit consent grants](https://learn.microsoft.com/en-us/defender-office-365/detect-and-remediate-illicit-consent-grants)
- MITRE ATT&CK — T1098.003
