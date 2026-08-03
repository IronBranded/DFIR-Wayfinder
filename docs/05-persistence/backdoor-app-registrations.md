---
tags:
  - Persistence
  - Cloud
  - T1098
  - T1098.001
---

# Persistence: Backdoor App Registrations & Service Principal Credentials

**ATT&CK:** [T1098.001](https://attack.mitre.org/techniques/T1098/001/) — Account Manipulation: Additional Cloud Credentials

## The mechanism

An attacker with sufficient privilege in Entra ID has two closely related options for a durable, low-visibility foothold that doesn't depend on any single user account:

- **Create a new app registration / service principal** and grant it high-privilege API permissions (application permissions, which don't require a signed-in user and can be provisioned without triggering a consent prompt if the attacker already holds admin rights).
- **Add credentials to an existing, legitimate app registration** — a new client secret or certificate — so the attacker can authenticate as that trusted application going forward. This is the quieter of the two options, since nothing about the app's identity or permission set changes; only a credential most admins never audit gets added.

## Where the evidence lives

Entra ID audit log — `Add service principal credentials`, `Add application`, `Update application` (permission changes), and `Add app role assignment` operations. Since these are administrative actions, they should be rare enough in most tenants to review individually rather than needing heavy filtering.

## Detection approach

Baseline your tenant's legitimate app registrations and their expected permission sets, then alert on any new high-privilege application permission grant (particularly anything close to `Directory.ReadWrite.All`, `Application.ReadWrite.All`, or mail/file-wide scopes) and on new credentials added to existing apps outside a documented change window. An app registration created by an account that doesn't normally do this kind of administrative work is itself worth flagging.

!!! danger "Red flag"
    A new client secret or certificate added to an existing app registration with no corresponding change ticket, or a new app registration with broad application-level Graph permissions.

## Cleanup

Remove the added credential (or delete the malicious app registration outright if it was purpose-built), and review the full permission history of the affected app — if it's a legitimate app the attacker piggybacked on, confirm its original permission set is still intact and hasn't also been quietly expanded.

<!-- BACKLINKS:START -->
## Referenced From

- [Module 5: Persistence Catalog](index.md)

<!-- BACKLINKS:END -->

## Sources

- [MITRE ATT&CK — T1098.001](https://attack.mitre.org/techniques/T1098/001/)
- [Module 6: Cloud Identity](../06-cloud-identity/index.md) — Entra ID audit log fundamentals
