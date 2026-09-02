Golden Ticket and Kerberoasting, covered elsewhere in this level, both require a specific privileged position or a specific credential first. Pass-the-Hash and Pass-the-Ticket are more immediately dangerous in a different way: once an attacker has *any* captured NTLM hash or Kerberos ticket, they can move laterally with it directly — no password cracking, no privileged access to krbtgt, just reusing what they already stole.

## Pass the Hash (PtH)

NTLM authentication never actually needs your cleartext password — it needs the **NTLM hash** of that password. Pass the Hash exploits this directly: an attacker who has captured an NTLM hash (via [LSASS memory access](#/lesson/l3-09-lsass-memory-analysis), a credential dump, or an intercepted authentication) can present that hash to authenticate as the user, on any system that accepts NTLM, without ever knowing or cracking the underlying password.

> [!PLAIN]
> This works because of how NTLM challenge-response authentication is built: the server never actually asks for your password, it asks for proof you know the hash derived from it. If you already have that hash, you can produce that proof without the password at all.

## Pass the Ticket (PtT)

The Kerberos equivalent, using a stolen Ticket Granting Ticket (TGT) or service ticket instead of a hash. An attacker with a captured TGT can inject it into their own session (commonly via tools like Mimikatz's `sekurlsa::tickets`) and authenticate to any service that ticket is valid for, for as long as the ticket remains unexpired — again, without needing the account's actual password.

> [!IMPORTANT]
> **"Overpass-the-hash"** is the bridge between these two: using a captured NTLM hash to *request a legitimate Kerberos ticket*, then using Pass-the-Ticket with that freshly-obtained ticket. It's a distinct, commonly-seen variation worth recognizing by name — an attacker converting one stolen credential type into the other.

## Normal baseline

Legitimate Kerberos and NTLM authentication both leave a fairly consistent signature: a logon event whose source system, logon type, and authentication package match the user's actual established pattern — the same workstation they always use, during hours consistent with their history, via the domain's normal authentication path.

## Red flags

- **NTLM logon (Logon Type 3) with no corresponding domain-controller Kerberos authentication for that same session** — Pass-the-Hash frequently forces NTLM specifically because the attacker never had a real Kerberos-eligible credential to begin with.
- **The same account authenticating to multiple systems in rapid succession, from a source host inconsistent with its normal pattern** — the classic lateral-movement signature both techniques produce.
- **A Kerberos ticket used for authentication with an unusually long remaining lifetime relative to when the account's actual interactive logon occurred** — a sign the ticket was captured and reused later, not obtained through the normal logon that session implies.
- **Overpass-the-hash specifically**: an NTLM authentication event immediately followed by Kerberos ticket requests for the same account, absent a normal interactive logon in between.

> [!CAUTION]
> Neither technique requires cracking anything or knowing a real password — that's exactly why credential-strength policies (complexity requirements, rotation schedules) do nothing to prevent either one. The actual mitigation is reducing hash/ticket exposure in the first place: Credential Guard, restricting where privileged accounts can interactively log on, and the [LSASS protections covered in Level 5](#/lesson/l3-09-lsass-memory-analysis).

## How to collect it

Windows Security Event ID 4624 (successful logon) filtered to Logon Type 3 (network) combined with Event ID 4768/4769 (Kerberos TGT/service ticket requests) lets you cross-reference whether a session's authentication actually matches its claimed path. Sysmon and EDR telemetry showing LSASS access immediately preceding either logon type is the strongest corroborating signal available.

## ATT&CK mapping

Both are sub-techniques of [Use Alternate Authentication Material (T1550)](https://attack.mitre.org/techniques/T1550/): [Pass the Hash (T1550.002)](https://attack.mitre.org/techniques/T1550/002/) and [Pass the Ticket (T1550.003)](https://attack.mitre.org/techniques/T1550/003/), both filed under Lateral Movement. Directly related to [DCSync](#/lesson/l7-06-dcsync-detection) and [Golden/Silver Ticket](#/lesson/l7-10-golden-silver-ticket) elsewhere in this level — all four techniques exploit the same underlying reality that Windows authentication trusts possession of specific secret material over re-proving identity from scratch each time.

## Sources

- MITRE ATT&CK — [T1550.002 Pass the Hash](https://attack.mitre.org/techniques/T1550/002/), [T1550.003 Pass the Ticket](https://attack.mitre.org/techniques/T1550/003/)
- [Microsoft Learn — Mitigating Pass-the-Hash and other credential theft](https://learn.microsoft.com/en-us/windows-server/security/securing-privileged-access/securing-privileged-access)
- Windows Internals (Russinovich, Solomon, Ionescu) — logon sessions and credential storage
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
