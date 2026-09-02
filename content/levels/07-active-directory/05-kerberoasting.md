Every technique so far in this level required privilege to begin — Domain Admin rights, replication permissions, or access to a domain controller. Kerberoasting requires none of that. Any authenticated domain user can start it, which is what makes it one of the most commonly observed techniques in real intrusions.

## How it works

A **Service Principal Name (SPN)** maps a service instance to the account running it, so Kerberos knows which account's key to encrypt a service ticket with. Requesting a service ticket for an SPN is an entirely ordinary operation — any domain user can do it, for any SPN, and the KDC will issue a **TGS** encrypted with the service account's password hash.

That's the whole attack. The attacker requests tickets for accounts with SPNs, extracts them from memory, and takes them offline to crack. Nothing about the request is anomalous in itself; the cracking happens entirely off-network, where no domain control can observe or stop it.

> [!PLAIN]
> The reason offline cracking works here: the ticket is encrypted with a key derived from the service account's password. Guess the password, derive the key, successfully decrypt the ticket — you know the guess was right. There's no rate limit, no lockout, and no logging, because the guessing happens on the attacker's own hardware.

## Why service accounts specifically

Service accounts are disproportionately vulnerable because of how they're commonly managed: passwords set once during deployment and never rotated, chosen by a human rather than generated, and frequently over-privileged — service accounts sitting in Domain Admins are common enough to be a running theme in AD security assessments. A weak, never-rotated password on a highly-privileged account is exactly the combination this attack monetizes.

## The RC4 tell

Tickets encrypted with **RC4 (type 0x17)** crack dramatically faster than AES. Attacker tooling frequently requests RC4 explicitly, even in environments where AES is standard — which makes an RC4 ticket request in an otherwise-AES environment a strong signal, the same tell that appears in [Golden Ticket detection](#/lesson/l7-10-golden-silver-ticket).

## Detection

The core detection is **Event ID 4769** (a Kerberos service ticket was requested), read for patterns rather than individual events:

- **Volume**: one account requesting tickets for many distinct SPNs in a short window — enumeration, not normal use.
- **Encryption downgrade**: RC4 requested where AES is the environment norm.
- **Requesting account**: a user account requesting service tickets for services it has no functional relationship with.

## Mitigations that change the math

**Group Managed Service Accounts (gMSAs)** use automatically-managed 240-character passwords that rotate on a schedule — computationally infeasible to crack, which removes the attack's payoff entirely. Beyond that: enforce AES, remove SPNs from accounts that don't actually need them, and get service accounts out of privileged groups.

## Normal baseline

Service ticket requests correspond to actual application usage — the accounts requesting them have a functional relationship with the services involved. Encryption types match domain configuration (AES). No single account is requesting tickets across a broad swathe of unrelated SPNs.

## Red flags

- **One account requesting service tickets for many distinct SPNs in a short window.**
- **RC4-encrypted ticket requests in an AES-configured environment.**
- **Ticket requests for high-value service accounts from workstations** with no relationship to those services.
- **An account with an SPN that also sits in a privileged group** — not an attack signal, but a standing exposure worth finding and fixing proactively.

## How to collect it

Query Event ID 4769 on domain controllers, aggregating by requesting account to surface volume anomalies, and filtering on the ticket encryption type field for RC4 (`0x17`). To find the exposure rather than the attack, enumerate SPN-holding accounts with `Get-ADUser -Filter {ServicePrincipalName -like "*"} -Properties ServicePrincipalName, MemberOf` and check which of them hold privileged group membership.

## ATT&CK mapping

Maps to [Steal or Forge Kerberos Tickets: Kerberoasting (T1558.003)](https://attack.mitre.org/techniques/T1558/003/).

> [!TIP]
> A cracked service account password is rarely the endpoint. It's a credential — which usually leads into [Pass-the-Hash / Pass-the-Ticket](#/lesson/l7-07-pass-the-hash-pass-the-ticket), or, if the account turns out to be privileged enough, straight to [DCSync](#/lesson/l7-06-dcsync-detection).

## Sources

- MITRE ATT&CK — T1558.003: Kerberoasting
- [Microsoft Learn — Group Managed Service Accounts overview](https://learn.microsoft.com/en-us/windows-server/security/group-managed-service-accounts/group-managed-service-accounts-overview)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
