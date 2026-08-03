---
tags:
  - Defender Suite
---

# Advanced Hunting with KQL

Defender XDR's Advanced Hunting feature queries a shared schema of tables — `DeviceProcessEvents`, `DeviceNetworkEvents`, `EmailEvents`, `IdentityLogonEvents`, and others — using Kusto Query Language (KQL). This page is a set of starting-point queries tied directly to earlier modules, not a KQL tutorial; treat these as templates to adapt against your own environment's baseline.

## Finding encoded PowerShell (ties to [Module 4](../04-powershell-forensics/obfuscation-decoding.md))

```kql
DeviceProcessEvents
| where FileName =~ "powershell.exe"
| where ProcessCommandLine has_any ("-enc", "-EncodedCommand", "-e ", " -en ")
| project Timestamp, DeviceName, AccountName, ProcessCommandLine, InitiatingProcessFileName, InitiatingProcessParentFileName
```

## Finding suspicious LSASS access (ties to [Module 3](../03-memory-forensics/lsass-memory-analysis.md))

```kql
DeviceProcessEvents
| where FileName =~ "rundll32.exe"
| where ProcessCommandLine has "comsvcs" and ProcessCommandLine has_any ("MiniDump", "#24")
| project Timestamp, DeviceName, AccountName, ProcessCommandLine, InitiatingProcessFileName
```

## Finding an unexpected process tree (ties to [Module 1](../01-windows-endpoint/process-trees.md))

```kql
DeviceProcessEvents
| where InitiatingProcessFileName in~ ("winword.exe", "excel.exe", "outlook.exe")
| where FileName in~ ("cmd.exe", "powershell.exe", "wscript.exe", "cscript.exe")
| project Timestamp, DeviceName, AccountName, InitiatingProcessFileName, FileName, ProcessCommandLine
```

## Finding new persistence via Scheduled Tasks (ties to [Module 5](../05-persistence/scheduled-tasks.md))

```kql
DeviceProcessEvents
| where FileName =~ "schtasks.exe"
| where ProcessCommandLine has "/create"
| project Timestamp, DeviceName, AccountName, ProcessCommandLine, InitiatingProcessFileName
```

## Identity and cloud queries

The tables above (`Device*`) cover the endpoint. Investigations that touch [Module 6](../06-cloud-identity/index.md) or [Module 5's cloud persistence entries](../05-persistence/index.md) need a different table family: `IdentityLogonEvents` and `IdentityQueryEvents` (populated by Defender for Identity and Entra ID) and `CloudAppEvents` (populated by Defender for Cloud Apps).

**Directory enumeration preceding a possible [Kerberoasting](../02-active-directory/kerberoasting.md) run** — a single account issuing an unusually high volume of AD object queries in a short window:

```kql
IdentityQueryEvents
| where Timestamp > ago(1h)
| summarize QueryCount = count() by AccountUpn, bin(Timestamp, 10m)
| where QueryCount > 50
```

**New mailbox forwarding rule** (ties to [Module 5's mailbox forwarding entry](../05-persistence/mailbox-forwarding-rules.md)):

```kql
CloudAppEvents
| where ActionType == "New-InboxRule" or ActionType == "Set-Mailbox"
| project Timestamp, AccountDisplayName, ActionType, RawEventData
```

!!! tip "Verify exact `ActionType` values against your own tenant"
    `ActionType` strings are numerous and occasionally shift between schema versions — the two starting points above are directionally correct but worth confirming against the in-portal schema reference (`Settings → Advanced hunting → schema reference`) before relying on them in a production detection rather than an ad hoc hunt.

## A cross-table correlation example (ties to the [Phishing playbook](../08-playbooks/phishing.md))

The real power of Advanced Hunting is joining across the endpoint/identity/email boundary in one query — exactly what the Phishing playbook's "did anyone who clicked also get a suspicious follow-on sign-in" triage question needs:

```kql
EmailEvents
| where Timestamp > ago(7d)
| where ThreatTypes has "Phish"
| project RecipientEmailAddress, PhishTime = Timestamp
| join kind=inner (
    IdentityLogonEvents
    | project AccountUpn, LogonTime = Timestamp, Application, LogonType
) on $left.RecipientEmailAddress == $right.AccountUpn
| where LogonTime between (PhishTime .. (PhishTime + 1h))
| project RecipientEmailAddress, PhishTime, LogonTime, Application, LogonType
```

This is a genuinely different kind of query than the single-table examples above it — it directly answers "who clicked, and did anything unusual happen to their identity in the hour afterward," which is precisely the pivot the Phishing playbook asks for.

## A few habits worth building

- **Prefer `has`/`has_any` over `contains` for command-line token matching** — `has` matches on word boundaries and is both faster and less prone to noisy substring false-positives than a raw `contains`.
- **Always scope a time window explicitly** rather than relying on the UI default — an unscoped query against a large tenant is slow and easy to accidentally run against far more data than intended.
- **Cross-table hunts need a real join key** — `DeviceId` and `Timestamp` are the most reliable anchors when correlating, for example, a `DeviceNetworkEvents` connection back to the `DeviceProcessEvents` record that made it.
- **Schema and table names change.** Microsoft has renamed products and adjusted schemas before (Defender ATP → Defender for Endpoint being the most visible example) — check the in-portal schema reference before assuming a column name from an older query still applies.

<!-- BACKLINKS:START -->
## Referenced From

- [Detection Engineering: From Hunt Query to Standing Detection](detection-engineering.md)
- [Module 7: Microsoft Defender Suite for IR](index.md)
- [Glossary](../glossary.md)
- [DNS Analysis](../network-analysis/dns-analysis.md)

<!-- BACKLINKS:END -->

## Sources

- [Microsoft Learn — DeviceProcessEvents table reference](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-deviceprocessevents-table)
- [Microsoft Learn — IdentityLogonEvents table reference](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-identitylogonevents-table)
- [Microsoft Learn — IdentityQueryEvents table reference](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-identityqueryevents-table)
- [Microsoft Learn — CloudAppEvents table reference](https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-cloudappevents-table)
- [SANS Digital Forensics Certifications overview](https://www.sans.org/cyber-security-certifications/digital-forensics-certifications) (FOR508 — hunting methodology, applied here to Defender's specific query language)
