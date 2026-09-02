[The previous lesson](#/lesson/l2-03-oauth-consent-grants) covered an attacker persuading a user to authorize an application. This one covers the version that needs no user at all: an application identity in the tenant, holding its own credentials, acting as itself.

## An app registration is an identity

An application registration in Entra ID is a security principal with credentials of its own — a client secret or a certificate — and permissions granted directly to it. It authenticates without a user, without MFA, and without any Conditional Access policy that scopes to users. Nothing about resetting human credentials touches it.

## Two variants, one much stealthier

**Creating a new registration** is the obvious approach and the easier one to find: a new application appears where none existed.

**Adding a credential to an existing, legitimate registration** is the version worth real attention. The application is genuine — deployed by the organization, recognizable by name, already approved and already privileged. The attacker adds a second client secret or certificate to it and authenticates as that trusted application. An inventory review sees only applications that belong there.

> [!TIP]
> The tell for the second variant is **temporal, not structural**. Compare each credential's creation date against its application's creation date. A legitimate app provisioned three years ago with a secret added last Tuesday is the anomaly — not the app itself, which will look entirely correct in any list of registrations.

## Permissions that matter

- **`RoleManagement.ReadWrite.Directory`** — the application can grant itself, or anything else, Global Administrator. This is the top of the list.
- **`Directory.ReadWrite.All`** — broad directory modification.
- **`Mail.ReadWrite` / `Mail.Read`** as application permissions — access to **every mailbox** in the tenant, not one user's.
- **`Application.ReadWrite.All`** — the app can create further backdoor applications.

Client secrets can be issued with multi-year lifetimes, which is what makes this durable rather than temporary.

## Normal baseline

Applications correspond to deployed software with identifiable owners. Credentials are created at or near application provisioning and rotated on a documented schedule. Application permissions are few and admin-approved. Redirect URIs point at organization-controlled domains.

## Red flags

- **A credential added to an application long after that application was created**, with no change record.
- **A credential added by an account with no application-management responsibility.**
- **A redirect URI pointing at an unrecognized or externally-controlled domain.**
- **A newly-added owner** on an existing application.
- **An application holding high-privilege application permissions with no corresponding usage** — provisioned for access, not for work.
- **A secret with an unusually long expiry** relative to organizational standard.

## How to collect it

The Entra audit log records **"Add service principal credentials"**, **"Update application – Certificates and secrets management"**, **"Add app role assignment to service principal"**, and **"Add owner to application"**. For the temporal check that catches the stealthy variant:

```
Get-MgApplication -All |
  Select-Object DisplayName, CreatedDateTime,
    @{n='SecretDates';e={$_.PasswordCredentials.StartDateTime}}
```

Any application whose credential start dates cluster well after its creation date warrants explanation. Sign-in logs for service principals show whether an application is actually being used and from where.

## ATT&CK mapping

[Account Manipulation: Additional Cloud Credentials (T1098.001)](https://attack.mitre.org/techniques/T1098/001/) and [Create Account: Cloud Account (T1136.003)](https://attack.mitre.org/techniques/T1136/003/).

## Sources

- [Microsoft Learn — Application and service principal objects](https://learn.microsoft.com/en-us/entra/identity-platform/app-objects-and-service-principals)
- MITRE ATT&CK — T1098.001
