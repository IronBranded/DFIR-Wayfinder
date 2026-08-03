---
tags:
  - Playbook
---

# Playbook: Business Email Compromise (BEC)

## Trigger

A user reports mailbox activity they don't recognize, finance flags a suspicious payment-change request, an external party reports a phishing email that appears to come from inside your organization, or an automated alert fires — impossible travel on a sign-in, a new mailbox rule, an unfamiliar OAuth consent grant.

## Triage questions

- Was MFA enabled on the account, and if so, does the sign-in log show it was actually satisfied (vs. bypassed via a legacy protocol or an AiTM phishing proxy)?
- Are there any new inbox rules, forwarding configurations, or delegate-access grants?
- Are there any new OAuth application consents?
- Did the attacker send mail from this account — to internal recipients (further lateral phishing) or external ones (fraud attempts)?
- Was any financial transaction initiated, approved, or modified while the account was compromised?

## Data to pull

- Entra ID sign-in logs for the account (location, device, client app, MFA status)
- Unified Audit Log: `New-InboxRule`, `Set-InboxRule`, `Set-Mailbox` (forwarding), `Add-MailboxPermission`
- Consent/OAuth grant history — see [OAuth Consent Grants](../05-persistence/oauth-consent-grants.md)
- Message trace for anything sent from the account during the suspected compromise window
- MFA method registration history (a newly added authenticator app or phone number is the attacker locking in a second factor of their own)

## Analysis

Anchor everything to the earliest anomalous sign-in, then check what changed in the minutes/hours after it — mailbox rule creation and OAuth consent grants typically follow very shortly after initial access, since they're how the attacker converts a one-time credential theft into standing access. Review any mail sent from the account during the window for both outbound fraud attempts and further phishing against internal contacts.

## Contain / Eradicate

Follow the [hybrid account-compromise runbook](../06-cloud-identity/index.md#hybrid-account-compromise-runbook-available-now) in full: disable, reset the password (twice, if hybrid-joined), and run `Revoke-MgUserSignInSession` — GUI-only remediation leaves standing token access intact. Then clear the specific persistence the attacker planted:

- Remove any [mailbox forwarding rules or delegate grants](../05-persistence/mailbox-forwarding-rules.md)
- Revoke any [malicious OAuth consent](../05-persistence/oauth-consent-grants.md)
- Remove any MFA method the attacker registered

## Recover

Re-enable the account only after the above is confirmed complete, with heightened sign-in monitoring for a defined follow-up period. If any fraudulent email was sent to external parties, notify them directly — don't rely on them to figure it out independently.

## Lessons learned

Was MFA actually enforced for this account, or was it exempted/using a legacy auth protocol that bypasses it? Would Conditional Access requiring a compliant or hybrid-joined device have blocked the initial sign-in? If a financial fraud attempt succeeded even partially, that's a process gap (payment-detail changes should require out-of-band verbal verification) as much as a technical one.

<!-- BACKLINKS:START -->
## Referenced From

- [Automated Investigation & Remediation: What It Does, and Doesn't, Do](../07-defender-suite/automated-investigation-remediation.md)
- [Module 8: Investigation Playbooks](index.md)
- [Playbook: Phishing (Initial Access)](phishing.md)
- [Case Study: Business Email Compromise, End to End](../case-studies/bec-case-study.md)
- [Case Studies](../case-studies/index.md)

<!-- BACKLINKS:END -->

## Sources

- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508/FOR509 — cloud account compromise response)
- NIST SP 800-61 Rev. 2 (see [Module 0](../00-foundations/ir-lifecycle.md) for the phase structure this playbook follows)
