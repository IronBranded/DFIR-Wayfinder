Group Policy exists to push configuration to every machine in a domain. That is also, precisely, a domain-wide remote code execution mechanism with a built-in distribution network and full administrative authority — one that runs by design, on a schedule, with no exploit involved at any stage.

## The two halves of a GPO

Every Group Policy Object exists in two places simultaneously, and understanding the split is what makes the artifacts below readable:

- **The directory half** — an object under `CN=Policies,CN=System,DC=...` holding metadata, links, and the `gPCFileSysPath` attribute pointing to the second half.
- **The SYSVOL half** — the actual files, under `\\<domain>\SYSVOL\<domain>\Policies\{GUID}\`, replicated to every domain controller and **readable by every authenticated user in the domain**.

That last point matters more than it sounds. SYSVOL is world-readable by design, because every machine needs to fetch its policy. Anything an administrator puts there, an attacker with any domain account can also read.

## Abuse path one: writing to a GPO

An attacker with write access to a GPO linked to an OU gets code execution on every machine in that OU, at the privilege level Group Policy runs with. The usual mechanisms are an **Immediate Scheduled Task** (`ScheduledTasks.xml`), a **startup or logon script** (dropped in the `Scripts\Startup` folder plus a `scripts.ini` entry), or a **registry-based** policy change.

This is the payoff for the [ACL abuse](#/lesson/l4-10-acl-delegation-abuse) covered later in this level: `GenericWrite` or `WriteDacl` on a single, obscure, unmonitored GPO can be worth more than membership in a privileged group, and looks far less alarming in an access review.

## Abuse path two: reading secrets out of SYSVOL

**Group Policy Preferences (GPP)** historically allowed administrators to set local account passwords through policy, storing them in `Groups.xml` in a `cpassword` field — encrypted with an AES key Microsoft published in its own documentation. **MS14-025** removed the ability to create new ones, but it did not retroactively clean up existing files. Legacy `Groups.xml`, `Services.xml`, `ScheduledTasks.xml`, and `Printers.xml` files containing `cpassword` values still sit in the SYSVOL of plenty of long-lived domains, readable by any authenticated user.

> [!WARNING]
> Searching SYSVOL for `cpassword` is a five-minute check that should be run in every environment, whether or not there's an active incident. If it returns anything, those credentials should be treated as compromised — they have been readable domain-wide for as long as the file has existed.

## Normal baseline

GPO modifications originate from known administrators, from admin workstations, inside change windows, with a corresponding change record. GPO version numbers increment in step with documented changes. No `cpassword` values anywhere in SYSVOL. Startup script folders contain only scripts that someone can account for.

## Red flags

- **A GPO version increment with no corresponding change record** — something changed the policy and nobody logged it.
- **A new `ScheduledTasks.xml` or startup script in a GPO folder**, particularly in a GPO that hasn't been touched in years.
- **`gPCFileSysPath` modified** to point at a path other than the GPO's own SYSVOL folder.
- **A GPO linked to a new OU**, especially one containing domain controllers or privileged workstations.
- **Any `cpassword` value present in SYSVOL** — standing exposure regardless of incident context.

## How to collect it

Event ID **5136** (a directory service object was modified) on DCs captures GPO object changes, including `gPCFileSysPath` and link modifications; **5137** and **5141** cover creation and deletion. For the file half, compare SYSVOL policy folder contents and timestamps against a known-good baseline, and check `GPT.INI` version numbers against the directory object's `versionNumber` — a mismatch means one half changed without the other. Hunt `cpassword` directly with `Get-ChildItem \\<domain>\SYSVOL -Recurse -Include *.xml | Select-String cpassword`.

## ATT&CK mapping

Maps to [Domain or Tenant Policy Modification: Group Policy Modification (T1484.001)](https://attack.mitre.org/techniques/T1484/001/), with the SYSVOL credential exposure mapping to [Unsecured Credentials: Group Policy Preferences (T1552.006)](https://attack.mitre.org/techniques/T1552/006/).

> [!TIP]
> If a GPO change has no change record and the Security log doesn't reach far enough back to confirm when it happened, [replication metadata](#/lesson/l4-03-replication-metadata) — the next lesson — can often answer that question from AD itself.

## Sources

- MITRE ATT&CK — T1484.001 and T1552.006
- [Microsoft Learn — Group Policy overview](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/component-updates/group-policy-basics)
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
