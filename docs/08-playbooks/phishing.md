---
tags:
  - Playbook
---

# Playbook: Phishing (Initial Access)

## Trigger

A user reports a suspicious email, a [Defender for Office 365](../07-defender-suite/index.md) detonation/Safe Links alert fires, or the help desk fields a report of an unexpected credential prompt.

## Triage questions

- Did the user interact with the email — click a link, open an attachment, enter credentials?
- If credentials were entered, was this a standard credential-harvesting page, or an **adversary-in-the-middle (AiTM) proxy** — a phishing kit that sits between the user and the real login page, relaying the session in real time? This distinction matters enormously: a standard harvester only gets a password, but an AiTM kit can capture a fully MFA-satisfied session token, which makes MFA irrelevant to the compromise.
- Is there a sign-in from an unfamiliar location/device immediately following the phishing timestamp?

## Data to pull

- Message trace for the phishing email — who received it, and did anyone forward it further internally
- [Defender for Office 365](../07-defender-suite/index.md) Safe Links/Safe Attachments verdict and click data
- Entra ID sign-in logs for every recipient who may have interacted with it, focused on the window immediately after

## Analysis

If any recipient's sign-in log shows a new session shortly after interacting with the email — especially from an unfamiliar location, with MFA satisfied — treat this as a likely account compromise, not just a near-miss, and move directly into the [hybrid account-compromise runbook](../06-cloud-identity/index.md#hybrid-account-compromise-runbook-available-now) or the [BEC playbook](business-email-compromise.md) rather than closing this out as "user didn't fall for it."

## Contain

Block the sender and the malicious URL/domain at the mail gateway. Use [Defender for Office 365](../07-defender-suite/index.md)'s purge capability to remove the message from every mailbox it reached, not just the ones that reported it.

## Eradicate

For any account with a confirmed post-click sign-in: revoke sessions per the [hybrid runbook](../06-cloud-identity/index.md#hybrid-account-compromise-runbook-available-now) — remember that for an AiTM-captured session, a password reset alone does **not** invalidate the stolen session token; explicit revocation is required.

## Recover

Standard re-enablement once remediation is confirmed complete. Consider targeted awareness follow-up with the specific team/individuals affected, since a pattern of the same group being targeted repeatedly often reflects a specific role-based risk worth addressing directly.

## Lessons learned

Was this caught by filtering, or only by user report after the fact — and if the latter, what would need to change for it to be caught earlier? If credentials or a session were captured, does your environment's Conditional Access posture actually resist AiTM (token binding, compliant-device requirements) or does it rely on MFA alone?

<!-- BACKLINKS:START -->
## Referenced From

- [ATT&CK Coverage Map](../00-foundations/attack-coverage-map.md)
- [Advanced Hunting with KQL](../07-defender-suite/advanced-hunting-kql.md)
- [Module 8: Investigation Playbooks](index.md)
- [Case Study: Business Email Compromise, End to End](../case-studies/bec-case-study.md)
- [Drill: Timeline Correlation](../practice-drills/timeline-correlation-drill.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR509 — phishing and initial-access investigation)
- [Microsoft Learn — What is Microsoft Defender XDR?](https://learn.microsoft.com/en-us/defender-xdr/microsoft-365-defender)
