---
tags:
  - Persistence
  - Cloud
  - T1114
  - T1114.003
---

# Persistence: Mailbox Forwarding Rules & Delegate Access

**ATT&CK:** [T1114.003](https://attack.mitre.org/techniques/T1114/003/) — Email Collection: Email Forwarding Rule

## The mechanism

This is the single most common persistence mechanism in Business Email Compromise: once inside a mailbox, an attacker creates an inbox rule or a forwarding configuration that quietly copies (or redirects) incoming mail to an external address. Critically, this is a **configuration change on the mailbox itself**, not a live session — resetting the account's password and revoking its tokens (see the [hybrid runbook](../06-cloud-identity/index.md#hybrid-account-compromise-runbook-available-now)) does nothing to remove a forwarding rule that's already in place. An attacker who's locked out of live access can still passively read every email that account receives going forward.

Two flavors: an **inbox rule** (`New-InboxRule` / `Set-InboxRule` — often set to forward and then silently delete or move the original to a rarely-checked folder so the mailbox owner doesn't notice), and **mailbox-level forwarding** (`Set-Mailbox -ForwardingSmtpAddress`), which forwards at the transport level rather than via a visible rule.

## Where the evidence lives

Exchange Online / Unified Audit Log operations: `New-InboxRule`, `Set-InboxRule`, `Set-Mailbox` (specifically changes to `ForwardingSmtpAddress` or `ForwardingAddress`), and `Add-MailboxPermission` (for delegate-access grants, a related persistence pattern giving another mailbox standing access to read this one).

## Detection approach

Alert on **any** new forwarding rule or mailbox-forwarding configuration pointing at an external domain — legitimate business need for this is rare enough that broad alerting is practical, similar to the WMI-subscription approach in the endpoint catalog. Pay particular attention to rules that also delete, move, or mark-as-read the forwarded message, since that's specifically about hiding the rule's existence from the mailbox owner rather than any legitimate mail-management purpose.

!!! danger "Red flag"
    Any inbox rule or mailbox forwarding configuration targeting an external domain, especially one that also hides or deletes the forwarded copy.

## Cleanup

Remove the rule or forwarding configuration (`Remove-InboxRule`, or clear `ForwardingSmtpAddress`), and review mail flow for the period the rule was active — every message that matched it should be treated as read by the attacker, which for many organizations triggers separate breach-notification analysis.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 5: Persistence Catalog](index.md)
- [Advanced Hunting with KQL](../07-defender-suite/advanced-hunting-kql.md)
- [Playbook: Business Email Compromise (BEC)](../08-playbooks/business-email-compromise.md)
- [Case Study: Business Email Compromise, End to End](../case-studies/bec-case-study.md)

<!-- BACKLINKS:END -->

## Sources

- [MITRE ATT&CK — T1114.003](https://attack.mitre.org/techniques/T1114/003/)
- [Module 6: Cloud Identity](../06-cloud-identity/index.md) — hybrid account-compromise runbook
