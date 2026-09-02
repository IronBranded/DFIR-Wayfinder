Kerberos authentication rests on a chain of trust that begins with a single account: **krbtgt**. Every Ticket Granting Ticket in the domain is encrypted and signed with the krbtgt account's password hash, and every domain controller trusts a TGT that decrypts correctly with it. An attacker holding that hash can therefore *manufacture* TGTs — bypassing authentication entirely rather than defeating it.

## Golden Ticket: forging the TGT itself

With the krbtgt hash (obtained via [DCSync](#/lesson/l7-06-dcsync-detection) or [NTDS.dit extraction](#/lesson/l7-01-ntds-dit)), an attacker constructs a TGT claiming to be any user, in any group, with any privileges — typically Domain Admin. The domain controller validates it by decrypting with krbtgt's hash, which succeeds, because the ticket genuinely was signed with the real key.

What makes a Golden Ticket particularly dangerous:

- **The claimed user need not exist.** The DC trusts the ticket's contents, not a directory lookup.
- **The claimed group memberships need not be real** — they're asserted inside the ticket's PAC.
- **The lifetime can be arbitrary.** Domain Kerberos ticket-lifetime policy is not enforced against a forged ticket; a default Mimikatz Golden Ticket is commonly issued with a **10-year** lifetime.
- **Changing the impersonated user's password does nothing.** The ticket isn't tied to that user's credential at all.

## Silver Ticket: forging a service ticket instead

A Silver Ticket forges a **TGS** (service ticket) using a *service account's* hash rather than krbtgt's — granting access to one specific service on one specific host. Narrower, but stealthier in an important way: because a Silver Ticket is presented directly to the target service, **it never touches a domain controller at all**, so DC-side authentication logging has no opportunity to record it.

| | Golden Ticket | Silver Ticket |
|---|---|---|
| Key used | krbtgt hash | Service account hash |
| Scope | Entire domain | One service on one host |
| Contacts a DC? | Yes (for TGS requests) | No |
| Remediation | [krbtgt double reset](#/lesson/l7-16-krbtgt-double-reset) | Reset that service account |

## Detection

Forged tickets are designed to look legitimate, so detection leans on inconsistencies rather than a single alarm:

- **A TGS request (Event ID 4769) with no preceding TGT request (4768)** for the same account — the ticket the account is using was never actually issued by the DC.
- **Anomalous ticket lifetimes**, far exceeding domain policy.
- **A non-existent or disabled username** appearing in Kerberos ticket events.
- **RC4 encryption (type 0x17) where the environment otherwise uses AES** — a common tell of older forging tooling.
- **Group memberships asserted in a ticket that don't match the directory** for that account.

## Normal baseline

Every TGS request pairs with an earlier TGT request for the same account. Ticket lifetimes conform to domain policy (10 hours by default). Encryption types match domain configuration — AES in a modern environment. Accounts appearing in Kerberos events all exist and are enabled.

## Red flags

- **4769 without a corresponding 4768** for the same account and session.
- **A ticket lifetime wildly outside policy** — years rather than hours.
- **Kerberos activity for an account that does not exist in the directory.**
- **RC4 in an AES-only environment.**

## How to collect it

Correlate Event IDs **4768** (TGT requested), **4769** (service ticket requested), and **4770** (ticket renewed) on domain controllers, looking specifically for 4769s that have no matching 4768 lineage. Check the ticket encryption type field in 4769 events for RC4. Validate account names in Kerberos events against actual directory objects.

## ATT&CK mapping

Maps to [Steal or Forge Kerberos Tickets: Golden Ticket (T1558.001)](https://attack.mitre.org/techniques/T1558/001/) and [Silver Ticket (T1558.002)](https://attack.mitre.org/techniques/T1558/002/).

> [!IMPORTANT]
> A confirmed Golden Ticket cannot be remediated by resetting user passwords, disabling accounts, or rebuilding endpoints. The forged ticket remains valid until the krbtgt key it was signed with is invalidated — which is exactly the [double reset](#/lesson/l7-16-krbtgt-double-reset) covered next.

## Sources

- MITRE ATT&CK — T1558.001 and T1558.002
- [Microsoft Learn — Kerberos authentication overview](https://learn.microsoft.com/en-us/windows-server/security/kerberos/kerberos-authentication-overview)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
