---
tags:
  - Persistence
  - Cloud
  - T1098
  - T1098.003
---

# Persistence: Malicious OAuth Application Consent Grants

**ATT&CK:** [T1098.003](https://attack.mitre.org/techniques/T1098/003/) — Account Manipulation: Additional Cloud Roles (OAuth consent abuse falls under this broader technique family)

## The mechanism

When a user (or an admin, on the user's behalf) consents to an OAuth application's requested permissions, that app gets a standing grant to act against Microsoft Graph with those permissions — independent of the user's password. Reset the password, revoke sessions, even disable the account temporarily, and a consented OAuth app's access token flow can keep functioning until the grant itself is explicitly revoked. This is precisely why it belongs in a persistence catalog rather than under initial access alone: it's what an attacker sets up *to survive* your remediation of the credential they used to get in.

A phishing lure asking the target to "sign in and approve this app" to view a shared document is a common delivery vector — the target's actual credentials are never touched.

## Where the evidence lives

Entra ID audit log — look for `Consent to application` operations, and `Add app role assignment` events. [Defender for Cloud Apps](../07-defender-suite/index.md) surfaces OAuth app risk more directly if licensed, including flagging apps with unusually broad `Mail.Read`, `Files.ReadWrite.All`, or similar high-value Graph scopes.

## Detection approach

Review consented applications for scopes disproportionate to what the app plausibly needs — a "meeting scheduler" app requesting full mailbox read access is the classic shape of this abuse. Flag consent grants to apps registered outside your own tenant, particularly ones registered very recently relative to when consent was granted.

!!! danger "Red flag"
    An OAuth grant to an external, recently-registered application requesting mail, file, or directory permissions well beyond its apparent purpose.

## Cleanup

Revoke the app's consent/grant entirely (not just disabling the user who originally approved it) via the Entra admin center or `Remove-MgOauth2PermissionGrant`, and review whether Admin Consent policies should be tightened to prevent users from self-approving high-risk permission scopes going forward.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 5: Persistence Catalog](index.md)
- [Defender for Cloud Apps: Reading an OAuth Consent Alert](../07-defender-suite/defender-cloud-apps-oauth.md)
- [Module 7: Microsoft Defender Suite for IR](../07-defender-suite/index.md)
- [Playbook: Business Email Compromise (BEC)](../08-playbooks/business-email-compromise.md)

<!-- BACKLINKS:END -->

## Sources

- [MITRE ATT&CK — T1098.003](https://attack.mitre.org/techniques/T1098/003/)
- [Module 7: Microsoft Defender Suite](../07-defender-suite/index.md) — Defender for Cloud Apps OAuth app governance
