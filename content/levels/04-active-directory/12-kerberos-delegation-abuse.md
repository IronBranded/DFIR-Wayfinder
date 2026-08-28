Golden Ticket forges a TGT from a stolen krbtgt hash. Kerberos delegation abuse doesn't forge anything — it abuses a legitimate feature, working entirely within Kerberos's own rules, to get the domain to hand an attacker exactly the same kind of access anyway.

> [!PLAIN]
> Delegation exists to solve a real problem: a web front-end needs to authenticate to a backend database *as the connecting user*, not as itself. Kerberos delegation is Microsoft's answer to that. Every variant below is that same legitimate feature, at a different scope of trust.

## Unconstrained delegation

A service account (or computer account) flagged `TRUSTED_FOR_DELEGATION` can impersonate *any* user to *any* service in the domain. When a user authenticates to that service, the Domain Controller includes the user's own TGT inside the service ticket — and the service caches that TGT in memory. Compromise the account or host, and every TGT it has ever cached is sitting there for the taking.

> [!IMPORTANT]
> Domain Controllers periodically authenticate to hosts with unconstrained delegation enabled as part of routine domain operation. A compromised unconstrained-delegation host frequently holds a **Domain Controller's own TGT** — turning one misconfigured member server into a direct path to full domain compromise.

Combined with a **coercion primitive** — PetitPotam (abusing the MS-EFSRPC `EfsRpcOpenFileRaw` function) or the "Printer Bug" (MS-RPRN) — an attacker can force a Domain Controller to authenticate to an unconstrained-delegation host on demand, rather than waiting for it to happen naturally.

## Constrained delegation

The scoped-down successor: an account's `msDS-AllowedToDelegateTo` attribute lists the *specific* services it's permitted to delegate to, rather than "anything." Meaningfully safer, but a compromised constrained-delegation account still grants impersonation rights to every service in that list — worth enumerating, not assuming safe just because it isn't unconstrained.

## Resource-Based Constrained Delegation (RBCD)

The newest, and the one most easily abused from a low-privilege starting position. Instead of the delegating account declaring what it can delegate *to*, the **target resource** declares who's allowed to delegate *to it*, via `msDS-AllowedToActOnBehalfOfOtherIdentity`. The attack path:

1. An attacker with `GenericWrite` (or equivalent) on a target computer object's `msDS-AllowedToActOnBehalfOfOtherIdentity` attribute — findable via BloodHound as a `GenericWrite`/`WriteProperty` edge — writes that attribute to name an account they control.
2. Any domain user can create a machine account by default (`MachineAccountQuota`, default value **10**) — the attacker creates one, controls its password.
3. Using that machine account and a tool like Rubeus's S4U extension, the attacker requests a service ticket impersonating any user — including a Domain Admin — to the target resource, and the KDC issues it, because the target resource itself said this was allowed.

No credential theft required anywhere in that chain — only a writable attribute and the default ability to create a machine account.

## Normal baseline

Unconstrained delegation is legitimately required by a small number of specific multi-tier applications, and legitimate use is genuinely rare outside them — most non-DC hosts carrying `TRUSTED_FOR_DELEGATION` have no real operational need for it. `msDS-AllowedToActOnBehalfOfOtherIdentity` on a computer object is normally either unset or set once, deliberately, as part of a documented application deployment — not something that changes on its own.

> [!TIP]
> Delegation flags map to a small, documented, known set of applications with a real business reason — not scattered across arbitrary hosts, and not changing outside a known maintenance window.

## Red flags

- **Any non-DC host carrying `TRUSTED_FOR_DELEGATION`** without a documented, current business justification.
- **A write to `msDS-AllowedToActOnBehalfOfOtherIdentity`** outside a known change window — this is RBCD staging, full stop.
- **A newly created machine account** (Event ID 4741) followed shortly by a delegation-attribute write on an unrelated computer object.
- **Coerced-authentication indicators** — PetitPotam or Printer Bug traffic — targeting a Domain Controller from a non-administrative host.

## How to collect it

Event ID 4742 and 4738 (computer/user account attribute modifications) surface delegation-attribute changes directly. Event ID 4741 flags new machine account creation — the RBCD prerequisite. BloodHound's own AD collector (SharpHound) enumerates every delegation relationship in a domain in one pass, which is the practical way to audit this at scale rather than checking hosts individually.

## ATT&CK mapping

The coercion primitives (PetitPotam, Printer Bug) map to [Forced Authentication (T1187)](https://attack.mitre.org/techniques/T1187/), under Credential Access. Delegation abuse itself sits alongside [Pass-the-Hash/Pass-the-Ticket](#/lesson/l4-11-pass-the-hash-pass-the-ticket) as alternate-authentication-material abuse under Lateral Movement — all three exploit the same underlying reality that Kerberos trusts possession of the right ticket or the right attribute over re-proving identity from scratch.

**Mitigations worth knowing, not just the attack:** Protected Users group membership and the "Account is sensitive and cannot be delegated" flag for every Tier-0 account prevent their TGTs from ever being forwarded, neutralizing capture even on a compromised delegation host. Reducing `MachineAccountQuota` to 0 removes the RBCD prerequisite entirely for standard users.
