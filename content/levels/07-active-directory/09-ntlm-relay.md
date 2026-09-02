NTLM relay doesn't crack anything and doesn't steal a hash in the sense [Pass-the-Hash](#/lesson/l7-07-pass-the-hash-pass-the-ticket) does. It exploits a narrower, older flaw: NTLM authentication was never designed to bind a session to *where* it's happening, only *who's* authenticating — so an attacker sitting in the middle can simply forward a real authentication attempt to a different destination than the victim intended, in real time, without ever seeing the underlying password or hash in a crackable form.

## How the relay actually works

Three pieces, chained:

1. **A way to trigger authentication.** Often opportunistic — **Responder** poisons broadcast name-resolution protocols (LLMNR, NBT-NS, mDNS): when a host mistypes a share name or a stale DNS entry fails, it falls back to broadcasting "who is `\\fileserv01`?" and Responder simply answers "me." The victim authenticates directly to the attacker. Where opportunistic poisoning isn't fast enough, coercion primitives force it on demand — **PetitPotam** and **PrinterBug**, the same techniques covered in the [Kerberos Delegation lesson](#/lesson/l7-08-kerberos-delegation-abuse), work here too.
2. **A relay tool.** **ntlmrelayx** (part of Impacket) takes that captured authentication attempt and forwards it — live, in real time — to a different target the victim never intended to authenticate to.
3. **A target that accepts it.** If the destination doesn't enforce SMB signing, or LDAP signing and channel binding, the relayed authentication is accepted as valid, and the attacker is now authenticated as the victim on a system of the attacker's choosing.

> [!PLAIN]
> This is not password cracking and not credential theft in the traditional sense — the attacker never possesses a usable copy of the hash afterward. The authentication attempt itself is what gets relayed, live, once, to wherever the attacker points it.

## Normal baseline

LLMNR and NBT-NS traffic is itself often present in unhardened networks as legacy name-resolution fallback — its mere existence isn't the red flag. SMB and LDAP signing, when enforced domain-wide, make the entire relay chain fail at the final step regardless of how successfully the first two steps went, which is exactly why enforcement (not just detection) is the durable fix here.

## Red flags

- **A single host suddenly answering an unusually high volume of LLMNR/NBT-NS broadcast queries** — the signature of active Responder poisoning.
- **PetitPotam or PrinterBug coercion traffic** directed at a Domain Controller or file server from a host with no administrative reason to be issuing it.
- **NTLM authentication (Logon Type 3) succeeding against a target that does not enforce signing**, especially from a source IP that doesn't match the authenticating account's normal working pattern.
- **A burst of authentication attempts against LDAP** immediately following coercion-tool traffic — the LDAP-relay variant, frequently used to grant the relayed account replication rights or write access to `msDS-AllowedToActOnBehalfOfOtherIdentity` directly (bridging straight into [RBCD](#/lesson/l7-08-kerberos-delegation-abuse)).

> [!WARNING]
> LDAP relay specifically can be used to directly configure Resource-Based Constrained Delegation on a target computer object — meaning a successful NTLM relay chain can end in exactly the RBCD attack path covered in the previous lesson, with no separate credential-theft step in between at all.

## How to collect it

Windows Event ID 4624 filtered to Logon Type 3, cross-referenced against source IP and the authenticating account's established pattern, is the primary host-side signal. Network-side, monitoring for the specific coercion protocols (MS-EFSRPC, MS-RPRN traffic to unexpected destinations) and unusually high LLMNR/NBT-NS query volume from a single source are the earliest-available signals — often visible before the relay itself ever succeeds.

## ATT&CK mapping

[Man-in-the-Middle: LLMNR/NBT-NS Poisoning and SMB Relay (T1557.001)](https://attack.mitre.org/techniques/T1557/001/) covers the poisoning-and-relay chain directly; [Forced Authentication (T1187)](https://attack.mitre.org/techniques/T1187/) covers the coercion primitives that trigger it on demand — the same technique underlying unconstrained delegation abuse in the previous lesson.

**The durable fix, not just detection:** require SMB signing and LDAP signing plus channel binding domain-wide, and disable LLMNR/NBT-NS/mDNS broadcast name resolution where legacy compatibility doesn't require it. Get those two controls right and there's nothing left for `ntlmrelayx` to relay to, regardless of how successful the poisoning or coercion step was.

## Sources

- MITRE ATT&CK — [T1557.001 LLMNR/NBT-NS Poisoning and SMB Relay](https://attack.mitre.org/techniques/T1557/001/)
- [Microsoft Learn — Mitigating NTLM relay attacks (Extended Protection for Authentication and SMB signing)](https://learn.microsoft.com/en-us/security-updates/securityadvisories/2009/973811)
- [Microsoft Security Blog — coerced authentication and relay tradecraft (MSTIC)](https://www.microsoft.com/en-us/security/blog/)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
