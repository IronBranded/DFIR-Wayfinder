---
tags:
  - Defender Suite
---

# Defender for Cloud Apps: Reading an OAuth Consent Alert

This page is the "what does the alert actually show you" companion to [Module 5's OAuth Consent Grant persistence entry](../05-persistence/oauth-consent-grants.md) — read that page first for the underlying mechanism; this one is about correctly triaging the alert once it fires.

## What the alert surfaces

- **Application identity** — name, publisher, and whether it's registered inside your own tenant or external
- **Permissions requested vs. granted** — the specific Graph API scopes the app asked for, and which of those the consenting user or admin actually approved
- **The consenting principal** — which user (or admin, via admin consent) approved the grant
- **A risk score**, weighted heavily by how disproportionate the requested permissions are relative to the app's apparent purpose

## The triage question that matters most

**Does the permission scope match what the app plausibly needs to do?** A calendar-scheduling app requesting `Calendars.Read` is unremarkable. The same app requesting `Mail.Read`, `Files.ReadWrite.All`, or full directory access is disproportionate — and disproportion, not the mere existence of a grant, is the actual signal. Most OAuth consent activity in any tenant is completely legitimate; the alert's value is in surfacing the small number of grants where requested scope and stated purpose don't line up.

Secondary checks worth running on anything that looks disproportionate:

- **How recently was the application registered**, relative to when consent was granted? A brand-new app registration receiving broad consent within hours of creation is a very different picture than a long-standing, widely-used app.
- **Is the publisher verified?** Unverified publisher status isn't damning by itself — plenty of legitimate small/internal tools are unverified — but it removes one layer of platform-level vetting you'd otherwise be able to lean on.

!!! danger "Red flag"
    A recently-registered, unverified application receiving consent for permission scopes well beyond its apparent function, especially mail, file, or full-directory access.

## Cleanup

Same remediation as the underlying persistence entry: revoke the grant entirely via the Entra admin center or `Remove-MgOauth2PermissionGrant`, not just disabling the consenting user — the app's access is independent of that user's account state once granted.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 7: Microsoft Defender Suite for IR](index.md)

<!-- BACKLINKS:END -->

## Sources

- [Module 5: Persistence — Malicious OAuth Application Consent Grants](../05-persistence/oauth-consent-grants.md)
- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR509 — cloud application security)
