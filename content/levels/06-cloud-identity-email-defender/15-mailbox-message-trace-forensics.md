[Email Headers & Authentication](#/lesson/l6-07-email-headers-authentication) and [Message Source & Attachments](#/lesson/l6-08-message-source-attachments) both work from a single message you already have in hand. This lesson covers the layer above that: finding messages in the first place, and reconstructing what happened to a mailbox as a whole — the piece [the BEC playbook](#/lesson/l8-03-playbook-bec) assumes you can already do.

## Message Trace: where a specific message actually went

**`Get-MessageTrace`** (Exchange Online PowerShell) is the starting point for "did this message actually arrive, and what happened to it" — recipient, delivery status, and the specific transport rules or connectors that touched it in transit, retained natively for a limited window before requiring the extended historical search.

```powershell
Get-MessageTrace -SenderAddress attacker@example.com -StartDate (Get-Date).AddDays(-10) -EndDate (Get-Date)
Get-MessageTraceDetail -MessageTraceId <id> -RecipientAddress user@yourdomain.com
```

`Get-MessageTraceDetail` is what actually shows the event-by-event journey — whether a rule redirected it, whether it was quarantined, whether it was ultimately delivered to the inbox or diverted somewhere else entirely.

## Mailbox audit logging: what happened *inside* the mailbox afterward

Message Trace tells you a message arrived. **Mailbox audit logging** tells you what happened to it once it did — read, moved, forwarded, deleted, or a folder permission changed — captured in the Unified Audit Log and queryable via `Search-UnifiedAuditLog` (or the newer `Search-MailboxAuditLog`, aware that Microsoft has been consolidating audit logging behind the unified log over time).

```powershell
Search-UnifiedAuditLog -StartDate (Get-Date).AddDays(-30) -EndDate (Get-Date) `
  -UserIds user@yourdomain.com -Operations MailItemsAccessed,Move,SoftDelete,HardDelete,New
```

`MailItemsAccessed` specifically is worth knowing by name: it's the operation that fires when a mailbox's content is actually *read* (including via mail sync protocols like ActiveSync/EWS, not just Outlook interactively) — often the most direct evidence available that a compromised account's mail was genuinely accessed, not just that the account existed and could have been.

> [!IMPORTANT]
> Mailbox audit logging retention is governed by the same [retention trap](#/lesson/l6-02-sign-in-vs-audit-logs) covered in the sign-in/audit logs lesson — native Unified Audit Log retention depends on licensing tier, and a BEC investigation that starts weeks after the actual compromise can already be outside that window if nothing was configured to export it further back beforehand.

## Offline mailbox artifacts: PST, OST, and MBOX

Not every investigation is cloud-native. **PST** (Personal Storage Table) files are Outlook's exportable, portable mailbox archive format; **OST** (Offline Storage Table) is the local cached copy Outlook maintains for an Exchange/M365 account, structurally related but not directly interchangeable with PST. **MBOX** is the older, plain-text-concatenated format most non-Outlook mail clients use. All three are parseable without needing the original mail client — **libpff** (an open-source library specifically built for PFF-format files, covering both PST and OST) is the standard tool for extracting messages, attachments, and metadata forensically from either format without needing Outlook installed at all.

## Normal baseline

`MailItemsAccessed` and routine mail-flow activity occur constantly on any active mailbox — the baseline is volume and pattern consistent with the account's established usage, accessed from consistent client types and locations, not the presence of these operations at all.

## Red flags

- **`MailItemsAccessed` via an unfamiliar client type** (a raw EWS/Graph API call rather than Outlook or a mobile mail app) on an account with no history of that access pattern — often how a compromised account's mail gets bulk-harvested without ever opening Outlook.
- **A `Get-MessageTraceDetail` history showing a message redirected by a transport rule the recipient never created** — a mail flow rule planted as part of the same compromise, not just the individual message itself.
- **`SoftDelete`/`HardDelete` operations on messages immediately following unfamiliar `MailItemsAccessed` activity** — an attacker covering their tracks by removing the evidence of what they read, directly inside the mailbox.

## How to collect it

`Get-MessageTrace`/`Get-MessageTraceDetail` and `Search-UnifiedAuditLog` via Exchange Online PowerShell, both requiring appropriate role assignment (typically View-Only Audit Logs or Audit Logs role) rather than full admin rights. For offline artifacts, `libpff`'s `pffexport` utility extracts a PST/OST's full content to a readable directory structure without requiring Outlook.

## ATT&CK mapping

Directly supports investigation of [Email Collection (T1114)](https://attack.mitre.org/techniques/T1114/) and its sub-techniques, and is the primary evidence source behind [Mailbox Forwarding Rules](#/lesson/l3-16-mailbox-forwarding-rules) persistence once a rule is suspected — Message Trace confirms what actually moved through it, not just that the rule exists.
