---
tags:
  - Cloud Identity
---

# Hybrid Sync Mechanics

Three distinct models exist for connecting on-prem Active Directory identities to Entra ID, and knowing which one an environment uses changes both the attack surface and the investigation approach.

## Password Hash Sync (PHS)

The on-prem password hash is re-hashed and synchronized to Entra ID, allowing cloud authentication to succeed even if on-prem infrastructure is unreachable. Two sync cadences run in parallel: the general directory delta sync (objects, group memberships, attributes) runs on a **30-minute default cycle**, but password changes specifically get their own dedicated, faster channel that runs **every 2 minutes** and can't be reconfigured to a different interval.

This is directly relevant to the [double password-reset guidance](../06-cloud-identity/index.md#why-the-password-gets-reset-twice-in-hybrid-environments) elsewhere in this module: the sync channel itself is fast, but the guidance exists for the edge cases — replication lag between on-prem Domain Controllers before the change even reaches the PHS agent, or timing races during an active incident — not because PHS is inherently slow.

## Pass-Through Authentication (PTA)

No password hash is stored in the cloud at all. Authentication requests are forwarded in real time to lightweight on-prem agents, which validate them directly against an on-prem Domain Controller. This means on-prem infrastructure availability becomes a hard dependency for cloud sign-in — if the on-prem agents or DCs are down, cloud authentication fails too, which is a meaningfully different availability posture than PHS.

## Federation (AD FS)

An entirely different trust model: authentication is redirected to on-prem AD FS servers, which issue a signed token Entra ID trusts based on the federation relationship rather than validating a password or hash directly. This is the model that makes the [Golden SAML](../05-persistence/golden-saml.md) technique possible — an attacker who compromises the AD FS token-signing certificate can forge valid tokens for any user without needing PHS, PTA, or any on-prem authentication event to fire at all.

## Why this matters for scoping an investigation

The sync model in use determines where to even look. A PHS environment's authentication story lives primarily in the cloud (Entra sign-in logs); a PTA environment requires checking both the cloud request and the on-prem agent/DC logs it was forwarded to; a federated environment requires including the AD FS server itself as an in-scope asset from the start — treating it the same way this guide treats a Domain Controller, not as a peripheral system.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 6: Cloud Identity (Entra ID / Hybrid)](index.md)

<!-- BACKLINKS:END -->

## Sources

- [Microsoft Learn — Implement password hash synchronization](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/how-to-connect-password-hash-synchronization)
- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR509 — hybrid identity architecture)
