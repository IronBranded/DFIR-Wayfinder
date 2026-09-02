This is the most common persistence mechanism in business email compromise, and its value to an attacker is specific: it keeps working after they lose the account. A password reset removes their ability to log in. It does not remove the rule that has been quietly copying every invoice to an external address since last month.

## Three layers, three different places to look

**Inbox rules** — client-side rules stored in the mailbox. Created via Outlook or `New-InboxRule`. They can forward, redirect, move, mark as read, and delete.

**Mailbox-level forwarding** — `ForwardingSmtpAddress` or `ForwardingAddress` set directly on the mailbox object via `Set-Mailbox`. This is not a rule at all, which means anyone checking only inbox rules will not see it.

**Transport rules** — organization-wide mail flow rules. Rarer, because they need elevated privilege, and far more serious: a transport rule can act on **everyone's** mail at once.

> [!WARNING]
> Checking inbox rules alone is the most common incomplete response here. All three layers must be checked, because they are configured in different places, by different cmdlets, and appear in different audit records.

## The pattern to recognize

The classic BEC rule does two things together:

1. **Forwards or copies** messages matching finance-related keywords — `invoice`, `payment`, `wire`, `bank`, `remittance` — to an external address.
2. **Moves them out of the Inbox and marks them read**, usually into a rarely-visited folder such as RSS Feeds, Archive, or Conversation History.

The second half is what makes the fraud work. The victim never sees the messages the attacker is intercepting or the replies to the fraudulent ones they send.

## Hidden rules

Rules created through MAPI or EWS can carry properties that the Outlook client does not render, making them invisible in the normal rules interface. `Get-InboxRule` may also miss them depending on how they were created.

The reliable checks are `Get-InboxRule -IncludeHidden` where available, and **MFCMAPI** for a direct look at the underlying MAPI properties. A rule that does not appear in Outlook but exists at the MAPI layer was almost certainly created deliberately to be invisible.

## Normal baseline

Users have a handful of organizational rules — moving newsletters to folders, flagging mail from a manager. External forwarding is disabled at tenant level or restricted to an approved list. Transport rules are few, documented, and owned by messaging administrators.

## Red flags

- **Any rule forwarding or redirecting to an external address.**
- **Keyword filters on finance terms** combined with a move-and-mark-read action.
- **A rule that deletes messages** matching a pattern.
- **A rule with a blank or single-character name** — a common attempt to make it inconspicuous in a list.
- **`ForwardingSmtpAddress` set** on a mailbox with no corresponding help-desk ticket.
- **A rule present at the MAPI layer but absent from the Outlook interface.**

## How to collect it

Audit records to query: **`New-InboxRule`**, **`Set-InboxRule`**, **`UpdateInboxRules`**, and **`Set-Mailbox`** (checking the `ForwardingSmtpAddress` parameter). Microsoft 365 also ships a built-in alert policy for the creation of forwarding and redirect rules — worth confirming it is enabled and routed somewhere a human reads.

Preventively, disabling automatic external forwarding through the outbound spam filter policy removes the most common variant tenant-wide rather than mailbox by mailbox.

## ATT&CK mapping

[Email Collection: Email Forwarding Rule (T1114.003)](https://attack.mitre.org/techniques/T1114/003/), with the concealment half relating to [Hide Artifacts (T1564)](https://attack.mitre.org/techniques/T1564/).

## Sources

- [Microsoft Learn — Control automatic external email forwarding](https://learn.microsoft.com/en-us/defender-office-365/outbound-spam-policies-external-email-forwarding)
- MITRE ATT&CK — T1114.003
