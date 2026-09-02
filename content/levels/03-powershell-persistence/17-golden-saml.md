[Golden Ticket](#/lesson/l4-06-golden-silver-ticket) works because whoever holds the krbtgt hash can forge Kerberos tickets that every domain controller will trust. Golden SAML is the same idea, one layer up: whoever holds the federation token-signing certificate can forge SAML assertions that the cloud will trust — and the cloud has no way to tell the difference, because from its perspective nothing is wrong.

## Federation, briefly

In a federated tenant, authentication does not happen in the cloud. The user authenticates against an on-premises identity provider — ADFS, or a third-party IdP — which issues a **SAML assertion** stating who the user is and what they did to prove it. The assertion is signed with the IdP's **token-signing certificate**. Entra ID validates the signature and grants access.

The trust is entirely in that signature.

## The attack

An attacker who obtains the token-signing certificate's private key — from the ADFS server itself, or by extracting it from the **DKM container in Active Directory** where ADFS stores the key material — can generate assertions offline, claiming:

- **Any user**, including one that does not exist in the on-premises directory
- **Any group membership or claim**
- **That MFA was already performed** — the assertion asserts the authentication method, so multi-factor is simply declared satisfied

> [!IMPORTANT]
> The forged assertion never touches the identity provider. The attacker generates it themselves and presents it directly to the cloud. **There is no corresponding authentication event at ADFS** — which means an Entra sign-in log showing a federated authentication with no matching ADFS event is the core detection signal, and also why nothing you do to user accounts has any effect.

## Why the usual remediation fails

- **Password reset** — irrelevant; no password was used.
- **Session revocation** — irrelevant; the attacker forges a fresh assertion.
- **Disabling the account** — the assertion can name a user who does not exist.
- **MFA enforcement** — the assertion claims MFA was performed.

The only remediation is **rotating the token-signing certificate**, and — exactly as with [krbtgt](#/lesson/l4-04-krbtgt-double-reset) — it must be rotated **twice**, because ADFS maintains a primary and a secondary certificate and will continue accepting assertions signed with the previous one until it is cycled out.

```
Update-AdfsCertificate -CertificateType Token-Signing    # then again, after rollover
```

The parallel to krbtgt is exact and worth internalizing: steal the signing key, forge the token, and remediation means invalidating the key twice.

## Detection

- **An Entra federated sign-in with no matching ADFS authentication event** — the primary signal.
- **ADFS Event ID 307**, a configuration change on the ADFS farm.
- **Access to the ADFS DKM container** in Active Directory by anything other than the ADFS service account.
- **Assertion lifetimes** inconsistent with configured policy.
- **Sign-ins claiming MFA** where the user has no registered MFA method.
- **The ADFS service account or server** appearing in [lateral movement](#/lesson/l4-10-acl-delegation-abuse) — the ADFS server is a Tier 0 asset and should be treated as one.

## Normal baseline

Every federated sign-in in Entra corresponds to an authentication event at the IdP. Token-signing certificates rotate on their configured schedule with change records. Only the ADFS service account reads the DKM container. The ADFS server is administered exclusively from privileged access workstations.

## How to collect it

Correlate Entra ID sign-in logs against ADFS security and admin logs, matching on user and timestamp — the absence of a corresponding ADFS event is the finding. Audit ADFS DKM container access in AD. Verify certificate rotation history with `Get-AdfsCertificate`. Treat any unexplained gap between the two log sources as a Golden SAML hypothesis until disproved.

## ATT&CK mapping

[Forge Web Credentials: SAML Tokens (T1606.002)](https://attack.mitre.org/techniques/T1606/002/).

## Sources

- MITRE ATT&CK — T1606.002
- [Microsoft Learn — ADFS certificate rollover](https://learn.microsoft.com/en-us/windows-server/identity/ad-fs/operations/certificate-rollover)
- CISA — guidance on identity provider compromise
