[ATT&CK](#/lesson/l1-03-attack-primer) describes *what* an adversary does. The Diamond Model describes *who and what is involved* and, more usefully, **how to get from one to the others**. It is a pivoting framework, and pivoting is what turns a single indicator into an understood intrusion.

![The Diamond Model: Adversary, Capability, Infrastructure and Victim vertices with the investigative pivots between them, highlighting Infrastructure to other Victims as the scoping pivot](assets/img/diagrams/diamond-model.svg)

## The four vertices

Every intrusion event connects four things:

- **Adversary** — the actor
- **Capability** — the tooling, malware, technique
- **Infrastructure** — the domains, IPs, servers, accounts used to deliver and control
- **Victim** — the targeted organization, person, or asset

The model's claim is that these are always connected: an adversary uses a capability over some infrastructure against a victim.

## Pivoting is the whole point

Given one vertex, you can move to the others. This is the practical technique:

**Victim → Infrastructure.** What did the compromised host connect to? [Proxy logs, DNS, NetFlow](#/lesson/l6-02-proxy-firewall-triage).

**Infrastructure → Capability.** What was hosted or delivered from that infrastructure? Passive DNS, sample repositories.

**Infrastructure → Infrastructure.** What other domains resolve to that IP? What other IPs has that domain used? This is often the highest-yield pivot — one C2 address expands into a set.

**Capability → Adversary.** Who is known to use this tooling? [Mutex names](#/lesson/l3-08-mutex-analysis) and [C2 fingerprints](#/lesson/l6-04-c2-framework-fingerprinting) both pivot here.

**Infrastructure → other Victims.** Which of your other hosts contacted any of the expanded infrastructure set? This is the pivot that converts one compromised machine into an accurate scope.

That last one is the reason this belongs in a foundations level. Scoping is a pivoting exercise, and doing it systematically rather than opportunistically is what makes the difference between finding one host and finding all of them.

## Meta-features

Each event also carries context: **timestamp**, **phase** (which stage of the intrusion), **result**, **direction**, **methodology**, and **resources**. Linked events sharing meta-features form **activity threads** — chains that reconstruct a campaign rather than a moment.

## Attribution is optional

> [!IMPORTANT]
> The Adversary vertex is the hardest to fill and, for enterprise DFIR, usually the least necessary. You can pivot productively across Capability, Infrastructure, and Victim — and scope, contain, and remediate completely — without ever naming a group. Attribution is a threat-intelligence output, not an incident-response prerequisite, and treating it as one delays the work that actually matters.

## How it sits alongside other frameworks

| Framework | Describes |
|---|---|
| **Kill Chain** | Phases of an intrusion, in sequence |
| **ATT&CK** | Techniques, by tactic |
| **Diamond Model** | Entities and the relationships between them |

They are complementary. A single event can be located in a kill chain phase, mapped to an ATT&CK technique, and expressed as a Diamond event with four vertices — each view answering a different question.

## Sources

- Caltagirone, Pendergast, Betz — "The Diamond Model of Intrusion Analysis" (2013)
- MITRE ATT&CK
