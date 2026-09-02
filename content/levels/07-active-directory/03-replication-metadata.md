Almost every detection in this level depends on a Security log — and Security logs get cleared, rotate out, or were never configured to capture the right subcategory in the first place. Replication metadata is different: Active Directory maintains it for its own operational reasons, independently of any audit policy, and it cannot be turned off without breaking replication itself.

## What AD tracks, and why

For every attribute of every object, AD stores a small block of metadata used to resolve conflicts when two DCs change the same thing:

- **Version number** — incremented on each change to that specific attribute.
- **Originating DSA** — which domain controller the change actually came from.
- **Originating change time** — when it happened at that DC.
- **Originating USN** — the update sequence number at that DC.

None of this exists to help investigators. It exists so replication can decide which of two conflicting values wins. That's exactly what makes it trustworthy: an attacker who clears the Security log has not touched any of it.

## What it answers

**When did this actually change?** The originating change time for a specific attribute — `member` on a privileged group, `servicePrincipalName` on a user, `gPCFileSysPath` on a GPO — gives a timestamp even when the corresponding 4728 or 5136 event is long gone.

**How many times has it changed?** A version number of 47 on the `member` attribute of a group that should have been static since 2019 says something happened, even if nothing says what.

**Where did the change come from?** The originating DSA names the DC that processed it, which narrows the investigation to one machine's logs and one site.

## DCShadow: the attack this artifact exposes

**DCShadow** works by registering a rogue domain controller in the directory, pushing malicious changes through legitimate replication, then removing the registration — producing directory changes with no corresponding modification events on any real DC, because no real DC ever processed them.

Replication metadata still records the originating DSA. A change whose originating DSA is not, and never was, a legitimate domain controller is the direct signature — and it is visible in metadata even after the rogue DC object has been cleaned up.

> [!IMPORTANT]
> This is corroborating evidence, not a primary detection. It answers "when and from where" for an object you already suspect. It will not tell you a group membership changed unless you go and ask about that specific object — so it's a targeted follow-up tool, not something to sweep with.

## Normal baseline

Originating DSAs are all legitimate, currently-or-formerly-existing domain controllers. Version numbers on stable, rarely-touched objects stay low. Originating change times align with documented administrative activity and with the corresponding Security log entries.

## Red flags

- **An originating DSA that doesn't correspond to any legitimate DC** — the DCShadow signature.
- **An originating change time with no matching Security log entry**, particularly on a privileged group's `member` attribute.
- **A version number far higher than the object's history should justify** — repeated modification, likely including changes made and then reverted.
- **A change time falling inside a known intrusion window** on an object nobody flagged at the time.

## How to collect it

`repadmin /showobjmeta <DC> "<distinguishedName>"` is the primary command — it dumps per-attribute version, originating DSA, timestamp, and USN for one object. Run it against a specific object of interest: a privileged group, a suspicious user, a modified GPO. `Get-ADReplicationAttributeMetadata -Object <DN> -Server <DC>` is the PowerShell equivalent and is easier to filter and pipe.

## ATT&CK mapping

This is evidence-source content supporting many techniques rather than mapping to one. The DCShadow case specifically maps to [Rogue Domain Controller (T1207)](https://attack.mitre.org/techniques/T1207/), and the artifact's core value is countering [Indicator Removal: Clear Windows Event Logs (T1070.001)](https://attack.mitre.org/techniques/T1070/001/).

> [!TIP]
> Any time this academy says "check the Security log for Event ID X" and the log doesn't go back far enough, this is the fallback worth reaching for — it won't replace the event, but it will usually establish whether and when the change happened.

## Sources

- [Microsoft Learn — repadmin /showobjmeta](https://learn.microsoft.com/en-us/troubleshoot/windows-server/active-directory/track-changes-active-directory-objects)
- MITRE ATT&CK — T1207: Rogue Domain Controller
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
