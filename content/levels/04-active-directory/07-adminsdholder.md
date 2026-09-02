Most persistence mechanisms in this academy survive because nobody notices them. This one survives because Active Directory actively restores it — on a schedule, by design, as a security feature working exactly as intended.

## What AdminSDHolder is for

Privileged groups have a problem: if someone modifies the ACL on the Domain Admins group, or on an individual admin account, that change persists silently. Microsoft's answer is **AdminSDHolder** — a template object at `CN=AdminSDHolder,CN=System,DC=...` whose ACL defines what permissions protected objects *should* have.

A background process called **SDProp** runs on the PDC Emulator, by default **every 60 minutes**, and stamps AdminSDHolder's ACL onto every protected object — overwriting whatever is currently there. Protected objects are marked with `adminCount = 1`.

The protected set includes Domain Admins, Enterprise Admins, Schema Admins, Administrators, Account Operators, Backup Operators, Server Operators, Print Operators, Domain Controllers, Read-only Domain Controllers, Replicator, and every member of those groups.

## The inversion

An attacker who modifies the **AdminSDHolder object's own ACL** — adding, say, `GenericAll` for a low-privileged account — has not backdoored one object. They have backdoored the template. Within the hour, SDProp propagates that permission onto every protected object in the domain.

The consequence that makes this genuinely nasty: a defender who notices the rogue permission on Domain Admins and removes it will watch it **come back within 60 minutes**. Cleaning the symptom without cleaning AdminSDHolder itself looks like a failed remediation, or like an attacker with live access re-adding it — when it's actually AD faithfully restoring the template.

> [!WARNING]
> If a permission you removed from a privileged group reappears roughly an hour later, check AdminSDHolder before assuming the attacker is still active in the environment. The self-healing behavior is the tell.

## The orphaned adminCount trail

`adminCount` is set to 1 when an object enters the protected set, but it is **not** automatically reset to 0 when the object leaves it. An account removed from Domain Admins two years ago still carries `adminCount = 1`, along with an ACL that no longer inherits normally from its OU.

For an investigator, that's a useful historical record: every object with `adminCount = 1` that is *not* currently in a protected group was privileged at some point. Some of those are stale administrative leftovers worth cleaning up. Some are an attacker's earlier foothold.

## Normal baseline

The AdminSDHolder ACL matches a documented baseline and changes only through deliberate, recorded administrative action. Objects with `adminCount = 1` correspond to current members of protected groups, plus a known, explainable set of historical leftovers. SDProp runs on schedule without error.

## Red flags

- **Any modification to the AdminSDHolder object's ACL** without a change record — this is the highest-signal item in the lesson.
- **A permission removed from a privileged group reappearing within about an hour.**
- **`adminCount = 1` on an account with no current or documented historical privileged membership** — worth explaining before dismissing.
- **A non-standard principal holding rights on AdminSDHolder** — the whole attack in one finding.

## How to collect it

Event ID **5136** on domain controllers captures modifications to the AdminSDHolder object; filter by its distinguished name specifically and treat any hit as investigable. Audit the current ACL with `Get-ACL "AD:\CN=AdminSDHolder,CN=System,DC=<domain>,DC=<tld>"`. Enumerate the historical trail with `Get-ADObject -LDAPFilter "(adminCount=1)" -Properties adminCount, memberOf` and reconcile each result against current protected-group membership. If a 5136 is missing because the log rotated, [replication metadata](#/lesson/l4-03-replication-metadata) on the AdminSDHolder object will still show when its ACL last changed and from which DC.

## ATT&CK mapping

Maps to [Account Manipulation (T1098)](https://attack.mitre.org/techniques/T1098/) and [Domain or Tenant Policy Modification (T1484)](https://attack.mitre.org/techniques/T1484/) — persistence achieved by modifying the directory's own security infrastructure rather than by planting anything.

## Sources

- [Microsoft Learn — Protected accounts and groups in Active Directory](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/plan/security-best-practices/appendix-c--protected-accounts-and-groups-in-active-directory)
- MITRE ATT&CK — T1098: Account Manipulation
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
