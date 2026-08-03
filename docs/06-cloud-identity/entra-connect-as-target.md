---
tags:
  - Cloud Identity
  - T1003
  - T1003.006
---

# The Entra Connect Server: A Target in Its Own Right

## Why this page exists

Every other page in this module treats individual accounts and sign-ins as the unit of compromise. This page is about a single server that, if compromised, can be worse than compromising most individual Domain Controllers — and that this guide hasn't yet treated with the scrutiny it treats an actual DC.

## What Entra Connect's on-prem account can actually do

Entra Connect (formerly Azure AD Connect) uses several distinct accounts, but the one that matters most for this page is the **AD DS Connector account** — the on-premises account it uses to read directory data for synchronization. That account is granted **Replicating Directory Changes and Replicating Directory Changes All** — the exact same extended rights documented on the [DCSync Detection](../02-active-directory/dcsync-detection.md) page, granted permanently and legitimately as a normal, required part of how hybrid sync functions, not as an anomaly to detect.

This means the Entra Connect server's service account is, by design, in the same rights class as a Domain Controller for the purpose of reading directory secrets. An attacker who compromises the Entra Connect server doesn't need to steal a separate DCSync-capable credential — the server they're already standing on has one.

## The cloud side carries its own privilege

The cloud-facing account — visible in Entra ID as "On-Premises Directory Synchronization Service Account," assigned the **Directory Synchronization Accounts** role — is not a narrow, purpose-built role either. It carries privileges in an undocumented internal synchronization API, and security research has demonstrated paths from that role to Global Administrator. Password writeback (where a cloud-side password change syncs back to on-prem AD) is a legitimate feature of the same account, meaning compromise here can also mean the ability to push a chosen password to an on-prem account, not just read data from one.

## Why this doesn't get the same attention a DC does

Domain Controllers are reflexively treated as tier-0 infrastructure — locked down, monitored, patched aggressively. The Entra Connect server frequently isn't held to the same standard, partly because it's conceptually filed under "identity sync tooling" rather than "authentication infrastructure," even though its actual privilege level says otherwise. Microsoft's own guidance is explicit that this account should never be granted Domain Admin and should run as a Group Managed Service Account with least-privilege scoping — the fact that this needs to be stated as guidance is itself evidence of how often it isn't followed in practice.

## Where the evidence lives, and what to check

- **On the server itself:** treat it like a Domain Controller for triage purposes — [process tree baseline](../01-windows-endpoint/process-trees.md), [Prefetch](../01-windows-endpoint/prefetch.md)/[Amcache](../01-windows-endpoint/amcache.md) for execution evidence, and the same [persistence catalog](../05-persistence/index.md) checks you'd run against any tier-0 asset.
- **In Entra ID:** audit changes to the Directory Synchronization Accounts role assignment and any unexpected principal added to it — this is a durable, cloud-side persistence mechanism in its own right, structurally similar in spirit to [AdminSDHolder abuse](../02-active-directory/adminsdholder.md) on the on-prem side.
- **Sign-in activity for the "On-Premises Directory Synchronization Service Account"** outside its normal, automated sync pattern — this account authenticating interactively, or from a location other than the known Entra Connect server, is a strong signal on its own.

!!! danger "Red flag"
    Any interactive sign-in by the Entra Connect service account, an unexpected principal holding the Directory Synchronization Accounts role, or endpoint-level compromise indicators on the Entra Connect server itself.

## Turning this into report language

"The sync server was compromised" understates the exposure unless the reader understands what that server can do. "The compromised host was the organization's Entra Connect server; its on-premises service account holds Replicating Directory Changes All rights — the same directory-replication privilege documented for DCSync attacks — meaning this compromise carries equivalent risk to a Domain Controller compromise, not a lesser one, regardless of the server's 'identity sync' classification in asset inventory" makes the severity legible to a reader who would otherwise reasonably assume a sync utility server is lower-stakes than a DC.

## ATT&CK mapping

[T1003.006 (DCSync)](https://attack.mitre.org/techniques/T1003/006/) — the mechanism is identical regardless of which asset the attacker is standing on when they invoke it.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 6: Cloud Identity (Entra ID / Hybrid)](index.md)
- [Glossary](../glossary.md)

<!-- BACKLINKS:END -->

## Sources

- [Microsoft Learn — Microsoft Entra Connect: Accounts and permissions](https://learn.microsoft.com/en-us/entra/identity/hybrid/connect/reference-connect-accounts-permissions)
- Tenable TechBlog — research on Directory Synchronization Accounts role privilege escalation paths
