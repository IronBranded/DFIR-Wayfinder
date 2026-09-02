Active Directory Certificate Services turns a certificate into a valid domain credential. That is its purpose — smart card logon, machine authentication, PKINIT all depend on it. The security consequence is that a certificate template misconfiguration is not a PKI problem, it is a domain privilege escalation path, and most environments have never audited their templates at all.

> [!IMPORTANT]
> The property that makes AD CS abuse uniquely painful for responders: **a certificate remains valid until it expires**, typically one or two years, and a password reset does nothing to it. An attacker holding a certificate for a Domain Admin keeps domain access through every credential rotation in your incident response. Revocation, not password reset, is the remediation.

## ESC1 — the template that lets you name yourself

The classic misconfiguration. A certificate template that simultaneously:

1. Allows the **enrollee to supply the subject** (the `ENROLLEE_SUPPLIES_SUBJECT` flag), meaning the requester chooses the identity in the Subject Alternative Name;
2. Includes an EKU permitting **client authentication**;
3. Grants **enrollment rights to a broad group** such as Domain Users; and
4. Does **not** require manager approval or authorized signatures.

Any domain user can then request a certificate specifying a Domain Admin's UPN in the SAN, and the CA will issue it. The certificate authenticates as that admin. No exploit, no credential theft — the template was configured to allow exactly this.

## ESC4 — write access to the template itself

The attacker doesn't need a vulnerable template if they can *make* one. Write permissions over a certificate template object (`GenericAll`, `GenericWrite`, `WriteDacl`, `WriteOwner`) allow reconfiguring a benign template into an ESC1-vulnerable one, exploiting it, then reverting the change.

This is the [ACL abuse](#/lesson/l7-14-acl-delegation-abuse) pattern applied to PKI, and the revert step is what makes it easy to miss: a point-in-time template audit run afterward shows nothing wrong. The evidence is in the change events, not the current state.

## ESC8 — relaying to the web enrollment endpoint

The AD CS **Web Enrollment** interface (`http://<ca>/certsrv`) accepts NTLM authentication and, by default, does not enforce channel binding or signing. An attacker coerces a machine account — a domain controller is the high-value target — into authenticating to a host they control, then [relays that authentication](#/lesson/l7-09-ntlm-relay) to the web enrollment endpoint and obtains a certificate for the coerced machine.

A certificate for a DC computer account leads directly to a TGT for that DC, and from there to [DCSync](#/lesson/l7-06-dcsync-detection) and the entire credential database.

## Detection

Certificate Services auditing produces the relevant events, but **only if "Issue and manage certificate requests" auditing is enabled** on the CA — worth confirming before relying on any of it:

| Event | Meaning |
|---|---|
| 4886 | Certificate Services received a certificate request |
| 4887 | Certificate Services approved a request and issued a certificate |
| 4888 | Certificate Services denied a certificate request |
| 4898 | Certificate Services loaded a template |
| 4891 | A configuration entry in Certificate Services changed |

A significant limitation worth knowing: the Windows event log does not record every attribute or extension from the certificate signing request, so the SAN that makes an ESC1 request malicious may not be visible in the event itself. The CA's own database holds the fuller record, and `certutil -view` is how you read it.

For ESC8 specifically, watch for HTTP POST traffic to the CA on port 80 alongside a **4768** (TGT requested) for a domain controller computer account — a DC obtaining a TGT via a certificate it did not request itself.

## Normal baseline

Templates permitting enrollee-supplied subjects are either absent or tightly scoped with manager approval required. Enrollment rights are granted to specific, purpose-built groups rather than Domain Users. Web Enrollment is disabled, or HTTPS-only with Extended Protection for Authentication enforced. Certificate issuance volume and requester identities match known device and user provisioning patterns.

## Red flags

- **A 4887 issuing a certificate to a requester with no business need for it**, particularly on a client-authentication template.
- **A certificate issued for a domain controller or privileged account** that the account itself did not request.
- **A 5136 modifying a certificate template object** under `CN=Certificate Templates,CN=Public Key Services,CN=Services,CN=Configuration` — especially a modification followed by a reversion, which is the ESC4 signature.
- **NTLM authentication from a domain controller machine account to the CA web endpoint.**
- **Any template combining enrollee-supplied subject, client authentication EKU, and broad enrollment rights** — a standing exposure, whether or not it has been used yet.

## How to collect it

Audit templates with **Certipy** (`certipy find -vulnerable`) or **Certify**, which enumerate exactly the misconfiguration classes above and flag them by ESC number. Query 4886/4887 on the CA and reconcile requesters against expected provisioning. Read the fuller request detail from the CA database with `certutil -view`. Check template object modifications via 5136 on DCs, falling back to [replication metadata](#/lesson/l7-03-replication-metadata) if the log has rotated.

## ATT&CK mapping

Maps to [Steal or Forge Authentication Certificates (T1649)](https://attack.mitre.org/techniques/T1649/), with ESC8 also involving [Adversary-in-the-Middle: LLMNR/NBT-NS Poisoning and SMB Relay (T1557.001)](https://attack.mitre.org/techniques/T1557/001/).

> [!TIP]
> Remediation here is genuinely different from the rest of this level: fix the template, **and revoke every certificate issued from it during the exposure window**. Password resets and even a [krbtgt double reset](#/lesson/l7-16-krbtgt-double-reset) leave issued certificates entirely untouched.

## Sources

- [Microsoft Learn — Audit Certification Services](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-10/security/threat-protection/auditing/audit-certification-services)
- "Certified Pre-Owned" (Will Schroeder and Lee Christensen, SpecterOps) — the original ESC taxonomy
- MITRE ATT&CK — T1649: Steal or Forge Authentication Certificates
