Every technique in this level so far has had a moment where something clearly wrong happens — a database extracted, a ticket forged, a template abused. This one doesn't. ACL abuse is a chain of individually legitimate permission grants, each one defensible in isolation, that together produce a path from an ordinary user account to Domain Admin without a single exploit, malware sample, or anomalous binary anywhere in it.

## The rights that matter

Active Directory permissions are granular, and a handful of them are effectively equivalent to control:

| Right | What it enables |
|---|---|
| `GenericAll` | Full control — everything below, and more |
| `GenericWrite` | Write any attribute, including `servicePrincipalName` (enabling [Kerberoasting](#/lesson/l4-08-kerberoasting)) or script paths |
| `WriteDacl` | Rewrite the object's own ACL — grant yourself `GenericAll`, then proceed |
| `WriteOwner` | Take ownership, then grant yourself anything |
| `ForceChangePassword` | Reset the target's password without knowing the current one |
| `AddMember` / `Self` | Add accounts to a group, including yourself |

Note that `WriteDacl` and `WriteOwner` are each a one-step path to `GenericAll`. There is no meaningful security distinction between "can modify permissions" and "has all permissions."

## Chaining

The escalation almost never comes from one grant. It comes from a sequence:

> A helpdesk group holds `ForceChangePassword` over a mid-tier service account. That service account holds `GenericWrite` over a security group. That group is nested inside a group that holds `WriteDacl` on an OU containing privileged workstations.

No individual link looks like a finding in an access review. Each was granted for a real operational reason, probably years apart, probably by different people. The path only exists when you traverse all of them — which is exactly what attackers do and what most access reviews structurally cannot.

**BloodHound** exists for this reason. It collects directory ACLs and group nesting, models them as a graph, and answers "shortest path from here to Domain Admins" — turning an intractable manual review into a query. It is equally a defender's tool and an attacker's, and the same graph answers both questions.

## Shadow admins

The recurring finding this produces: accounts with **effective** control over privileged objects that appear in **no** privileged group. They pass every "who is in Domain Admins" review cleanly, because the answer is "not them." Their power comes from ACLs, not membership — and ACLs are what almost nobody enumerates.

> [!PLAIN]
> "Effective permissions" means what an account can actually do once you account for direct grants, group membership, nested groups, and inheritance from parent containers — as opposed to what its own object obviously says. The gap between the two is where shadow admins live.

## Detection

The core event is **5136** (a directory service object was modified), which fires on ACL changes and records the modified security descriptor in SDDL form. Two practical difficulties: 5136 requires directory service change auditing to be enabled, and SDDL is dense enough that raw events are hard to triage by eye — which is why the standing-exposure hunt below usually matters more than the event-level detection.

## Normal baseline

Delegated permissions correspond to documented administrative roles, granted at OU level rather than scattered across individual objects, to purpose-built groups rather than individual users. Effective control over privileged objects belongs only to accounts whose privileged status is visible in group membership. A current BloodHound-style graph exists and its shortest paths to Domain Admins are known and accepted.

## Red flags

- **A new `GenericAll`, `GenericWrite`, `WriteDacl`, or `WriteOwner` grant** on a privileged object or OU without a change record.
- **A shadow admin** — effective control over privileged objects from an account in no privileged group.
- **An ACL grant to an individual user account** rather than a group, which is unusual in mature environments and often signals either an attacker or an undocumented shortcut.
- **`servicePrincipalName` written onto an account by a principal other than the account itself** — this is `GenericWrite` being converted into a Kerberoasting opportunity.
- **A permission granted and then removed shortly afterward** — the ESC4-style pattern, applied to any object.

## How to collect it

Query Event ID 5136 on DCs for ACL modifications on privileged objects and OUs. For the standing-exposure hunt, run **BloodHound** (with SharpHound collection) and examine inbound control edges on Tier 0 objects — Domain Admins, the domain object itself, DC computer accounts, AdminSDHolder, and certificate templates. `Get-ACL "AD:\<distinguishedName>"` inspects a specific object directly when you need to verify a single result rather than survey.

## ATT&CK mapping

Maps to [Account Manipulation (T1098)](https://attack.mitre.org/techniques/T1098/) and [Domain Policy Modification (T1484)](https://attack.mitre.org/techniques/T1484/), with the discovery phase corresponding to [Permission Groups Discovery: Domain Groups (T1069.002)](https://attack.mitre.org/techniques/T1069/002/).

> [!TIP]
> This is the last technique lesson in the level. [The capstone](#/lesson/l4-14-ad-attack-chain-overview) puts the whole sequence together — and ACL abuse is usually the connective tissue between stages, the quiet step that turns a foothold into the access needed for everything else.

## Sources

- MITRE ATT&CK — T1098: Account Manipulation
- [Microsoft Learn — Active Directory access control](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/security-best-practices/implementing-least-privilege-administrative-models)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
