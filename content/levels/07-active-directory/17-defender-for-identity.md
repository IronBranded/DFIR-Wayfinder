Endpoint EDR sees what happens on a machine. Defender for Identity sees what happens **between** machines and the domain controllers — the authentication and directory traffic that carries every technique in [Level 4](#/lesson/l7-18-ad-attack-chain-overview). That is a different vantage point, and it catches things endpoint telemetry structurally cannot.

## How it sees what it sees

Sensors run on domain controllers (and AD FS/AD CS servers), inspecting network traffic to and from them alongside local event data. Because the detection sits where the authentication actually happens, an attacker operating from an unmanaged host — one with no EDR agent at all — is still visible when they talk to a DC.

## Mapping alerts to what you already know

Defender for Identity's alert catalogue maps closely onto this academy's AD content. Alert names change between product versions, so treat these as the technique each corresponds to rather than exact strings to match:

| Alert concept | Technique |
|---|---|
| Suspected DCSync attack (replication of directory services) | [DCSync](#/lesson/l7-06-dcsync-detection) |
| Suspected Golden Ticket usage — forged authorization data, nonexistent account, ticket anomaly, time anomaly | [Golden Ticket](#/lesson/l7-10-golden-silver-ticket) |
| Suspected Kerberoasting / AS-REP roasting | [Kerberoasting](#/lesson/l7-05-kerberoasting) |
| Suspected identity theft — pass-the-hash, pass-the-ticket, overpass-the-hash | [Pass-the-Hash / Pass-the-Ticket](#/lesson/l7-07-pass-the-hash-pass-the-ticket) |
| Suspected DCShadow attack | [Replication metadata](#/lesson/l7-03-replication-metadata) |
| Reconnaissance — user, group membership, SMB session enumeration | [AD discovery](#/lesson/l7-14-acl-delegation-abuse) |

Notice that the Golden Ticket detections are **plural**, corresponding to different anomalies in a forged ticket — a nonexistent account, an implausible lifetime, inconsistent authorization data. Each is a distinct tell, and knowing which one fired tells you something about how the ticket was forged.

## Honeytokens

Defender for Identity supports designating an account as a **honeytoken**: an identity that is never used for anything legitimate, so *any* authentication involving it is an alert.

This is the same principle as [break-glass sign-in alerting](#/lesson/l5-12-break-glass-abuse) inverted — rather than an account that must exist and must be watched, it is an account that exists only to be watched. A well-placed honeytoken with an attractive name and a plausible group membership is one of the highest-signal, lowest-noise detections available in Active Directory.

## What it does not replace

> [!IMPORTANT]
> An alert names a technique; it does not investigate it. A "Suspected DCSync" alert tells you to go read [Event ID 4662 with the replication GUIDs](#/lesson/l7-06-dcsync-detection), establish which account did it, when it was granted the rights, and what else it touched. The product is a detection layer over techniques you still need to understand — which is why this lesson comes after Level 4 rather than instead of it.

Coverage also depends entirely on **sensor placement**. A domain controller without a sensor is invisible to it, and attackers who find the unmonitored DC will use it.

## Normal baseline

Sensors installed on every domain controller, healthy and reporting. Alert volume is low. Reconnaissance alerts trace to known administrative tooling or authorized scanning. Honeytoken accounts have zero activity.

## Red flags

- **Any honeytoken activity** — a single event is actionable with no further correlation.
- **A domain controller with no sensor**, or a sensor in an unhealthy state.
- **A Golden Ticket alert variant firing** — go straight to the [krbtgt double reset](#/lesson/l7-16-krbtgt-double-reset) decision path.
- **Reconnaissance alerts from a workstation** with no administrative role.
- **Alerts suppressed or excluded** without a documented reason.

## How to collect it

Alerts surface in the Microsoft Defender portal and via the `IdentityDirectoryEvents` and `IdentityLogonEvents` tables in [Advanced Hunting](#/lesson/l1-14-advanced-hunting-kql), which allows correlating identity activity against the `Device*` tables in a single query. Verify sensor coverage against the actual DC inventory rather than the portal's own list.

## ATT&CK mapping

Spans [OS Credential Dumping (T1003)](https://attack.mitre.org/techniques/T1003/), [Steal or Forge Kerberos Tickets (T1558)](https://attack.mitre.org/techniques/T1558/), [Use Alternate Authentication Material (T1550)](https://attack.mitre.org/techniques/T1550/), and [Account Discovery (T1087)](https://attack.mitre.org/techniques/T1087/).

## Sources

- [Microsoft Learn — Microsoft Defender for Identity](https://learn.microsoft.com/en-us/defender-for-identity/)
- MITRE ATT&CK — T1003, T1558
