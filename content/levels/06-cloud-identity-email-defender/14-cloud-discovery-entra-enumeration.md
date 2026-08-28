[Level 2's Discovery lesson](#/lesson/l2-11-discovery) covers `whoami`, `net user`, and `nltest` — all local to a single Windows host. Cloud identity has its own enumeration story entirely, run through the exact same APIs legitimate administration uses, and it deserves the same recognition treatment.

## AzureHound: BloodHound's cloud collector

**AzureHound**, part of the BloodHound suite, enumerates Entra ID and Azure resources through the Microsoft Graph API and Azure REST API — the same programmatic interfaces legitimate tooling and administrators use every day. It builds a graph of users, groups, roles, service principals, and their relationships, then feeds that graph into BloodHound to surface attack paths: who can reset whose password, which service principal has enough permission to become a path to Global Administrator, which "harmless" role assignment is actually one hop from full tenant compromise.

> [!PLAIN]
> Nothing about AzureHound requires exploiting anything — it's built on the same Graph API calls any legitimate reporting script uses. That's exactly why it's dangerous in the wrong hands, and exactly why the discovery signature it leaves is more about *volume and pattern* than any individual API call being inherently suspicious.

## What it actually queries

AzureHound's collection modules map directly onto specific, recognizable Graph API calls: listing users, devices, device owners, service principals, and service principal owners chief among them. Run against `/v1.0/users`, `/v1.0/groups`, and `/v1.0/organization` endpoints in rapid succession, this produces a very specific traffic pattern: high request volume, broad object-type coverage, executed in a short window — a shape that's genuinely uncommon for routine day-to-day administration.

## Normal baseline

Legitimate Graph API queries against user/group/role data are typically scoped — a helpdesk tool looking up one user, a provisioning script touching a specific department's group. Broad, high-volume enumeration across the entire tenant's users, groups, devices, and service principals in a tight time window is not a normal administrative pattern, even for genuine tenant-wide reporting, which is typically scheduled, predictable, and runs from a known service principal rather than an interactive user session.

## Red flags

- **A distinctive default User-Agent string** — AzureHound identifies itself as `azurehound/<version>` by default unless an operator deliberately changes it, making this one of the highest-confidence single indicators available for detecting unmodified tool usage.
- **The same User-Agent pattern for SharpHound (on-prem AD) or the generic BloodHound suite**, since attackers frequently run both the AD and cloud collectors in the same operation to map the full hybrid attack surface at once.
- **High-volume GET requests across `/v1.0/users`, `/v1.0/groups`, `/v1.0/devices`, and `/v1.0/servicePrincipals`** in a tight time window, from a single session or token.
- **Enumeration immediately following a suspicious sign-in** — the cloud equivalent of the "discovery cluster right after a foothold" pattern from the [Windows-native Discovery lesson](#/lesson/l2-11-discovery).

> [!WARNING]
> AzureHound doesn't need to run from inside the compromised environment at all — both Graph and Azure REST APIs are reachable externally with a valid token. A stolen or forged token used from an attacker-controlled machine, entirely outside the victim's network, still produces this same enumeration signature.

## How to collect it

Microsoft Graph activity logs surface most AzureHound requests directly and are the primary detection source — filter on the `azurehound` user-agent substring, or on the request-volume pattern if the operator has changed it. **One real gap worth knowing:** some Azure REST API (ARM) read/list operations AzureHound also uses may not appear in standard Azure Activity Logs, meaning Graph activity logging alone doesn't guarantee full visibility — cross-reference against sign-in logs for the same session where possible.

## ATT&CK mapping

Maps to [Account Discovery: Cloud Account (T1087.004)](https://attack.mitre.org/techniques/T1087/004/), [Permission Groups Discovery: Cloud Groups (T1069.003)](https://attack.mitre.org/techniques/T1069/003/), and [Cloud Service Discovery (T1526)](https://attack.mitre.org/techniques/T1526/) — the direct cloud-scoped counterparts to the Windows-native techniques in [Level 2's Discovery lesson](#/lesson/l2-11-discovery). Microsoft's own threat intelligence has publicly attributed AzureHound/BloodHound-suite usage to real nation-state activity (documented against the Russia-affiliated actor tracked as Void Blizzard) — this isn't a hypothetical red-team-only concern.
