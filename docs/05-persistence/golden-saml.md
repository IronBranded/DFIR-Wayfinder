---
tags:
  - Persistence
  - Cloud
  - T1606
  - T1606.002
---

# Persistence: Federation Trust Abuse ("Golden SAML")

**ATT&CK:** [T1606.002](https://attack.mitre.org/techniques/T1606/002/) — Forge Web Credentials: SAML Tokens

## The mechanism

This is the most severe cloud-identity persistence mechanism in this catalog, and the hardest to detect. In a federated environment (classically AD FS, though the underlying weakness applies anywhere a token-signing certificate anchors trust), possession of the federation service's private token-signing certificate lets an attacker forge a valid SAML assertion for **any user in the tenant, including Global Administrators, without ever touching that user's actual credentials or MFA**.

Because the forged token is cryptographically valid, it passes authentication exactly as a legitimate token would — the compromise is upstream of every password reset, every MFA challenge, and every conditional access policy that assumes the token it's evaluating was honestly issued.

## Where the evidence lives

This is a genuinely hard detection problem; there is no single reliable event that says "someone forged a token." What's realistic:

- Entra ID sign-in logs showing authentication as a federated user with no corresponding real authentication event on the on-prem AD FS server for that session
- Sign-ins with an unusual token lifetime, issuer characteristics, or claims pattern inconsistent with normal AD FS-issued tokens
- Any access to the AD FS server itself, or to the token-signing certificate's private key material, outside expected administrative activity — this is the point to focus detection effort on, since it's the precondition for the whole technique

## Detection approach

Treat the token-signing certificate as one of the highest-value assets in the entire identity infrastructure — monitor access to the AD FS server and the certificate store with the same rigor applied to a Domain Controller. Because post-hoc token detection is unreliable, prevention (tightly restricting who can log onto or administer the AD FS server) matters more here than almost anywhere else in this catalog.

!!! danger "Red flag"
    Any unexpected access to the AD FS server or its signing certificate, or federated sign-ins with no matching on-prem authentication event.

## Cleanup

Rotate the token-signing certificate immediately — this invalidates every previously forged token in one action, though it will also require re-establishing the federation trust relationship and should be planned with awareness that it briefly disrupts legitimate federated sign-in. Treat every account in the tenant as potentially compromised for the duration the attacker held certificate access, since a forged token could have targeted any of them.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 5: Persistence Catalog](index.md)
- [Hybrid Sync Mechanics](../06-cloud-identity/hybrid-sync-mechanics.md)

<!-- BACKLINKS:END -->

## Sources

- [MITRE ATT&CK — T1606.002](https://attack.mitre.org/techniques/T1606/002/)
- [Module 6: Cloud Identity](../06-cloud-identity/index.md) — hybrid identity mechanics
