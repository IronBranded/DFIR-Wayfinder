---
tags:
  - Cloud Identity
---

# Identity Protection Risk Signals

Microsoft Entra ID Protection (P2) evaluates every sign-in and every user against a set of risk detections, surfacing a risk level that can drive automated response through risk-based Conditional Access policies.

## The core signals

| Signal | What it means | Notes for investigation |
|---|---|---|
| **Impossible travel** | Two sign-ins from locations that would require faster-than-physically-possible travel between them | High-confidence on its own, but VPN use by the legitimate user can occasionally trigger it — check the client/device consistency before assuming compromise |
| **Atypical travel** | A sign-in location inconsistent with the user's recent pattern, without necessarily being physically impossible | Softer signal than impossible travel; more useful in combination with other risk factors than alone |
| **Anonymized IP address** | Sign-in from a known anonymizing service (VPN, Tor, open proxy) | Not inherently malicious — plenty of legitimate corporate VPN and privacy-tool use looks identical — but worth correlating against the account's normal behavior |
| **Leaked credentials** | Microsoft correlates sign-in credentials against known, publicly circulating credential-dump datasets | A match means the *credential* is known-exposed, not necessarily that this specific sign-in is malicious — but it materially raises the stakes of any other simultaneous risk signal |
| **Unfamiliar sign-in properties** | ML-based detection of sign-in characteristics (device, location, behavior) inconsistent with the user's established pattern | The broadest, most heuristic signal — good as a contributing factor, weakest as a standalone trigger |

## How risk levels drive response

Each signal contributes to an overall risk level (low/medium/high) for the sign-in and, cumulatively, the user. Risk-based Conditional Access policies can act automatically on this — requiring MFA re-registration, forcing a password change, or blocking access outright — which means part of investigating a flagged account is confirming **what automated response, if any, already fired**, rather than assuming a human needs to take the first action.

!!! danger "Red flag"
    Multiple risk signals firing together for the same sign-in or the same user in a short window — the combination is a much stronger indicator than any single signal alone.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 6: Cloud Identity (Entra ID / Hybrid)](index.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR509 — cloud identity investigation)
