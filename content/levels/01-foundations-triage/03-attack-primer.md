Every lesson in this academy ends with an ATT&CK mapping. This lesson explains what those identifiers actually mean, so the mappings read as structure rather than decoration.

## Tactics, techniques, sub-techniques

**Tactics** are the adversary's **goal** — the *why*. Enterprise ATT&CK defines fourteen, roughly following an intrusion's shape: Reconnaissance, Resource Development, Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, Credential Access, Discovery, Lateral Movement, Collection, Command and Control, Exfiltration, Impact.

**Techniques** are the **how** — a specific way to achieve a tactic.

**Sub-techniques** are narrower variants of a technique.

## Reading an ID

```
T1055        Process Injection                    (technique)
T1055.012    Process Injection: Process Hollowing (sub-technique)
TA0004       Privilege Escalation                 (tactic)
M1040        Behavior Prevention on Endpoint      (mitigation)
G0016        APT29                                (group)
S0154        Cobalt Strike                        (software)
```

The dot notation is a hierarchy, not a version number. `T1055.012` is one specific way of doing `T1055`, which is why [the injection techniques lesson](#/lesson/l3-06-injection-techniques) lists several sub-technique IDs under a single parent.

A technique can serve **multiple tactics**. Process Injection appears under both Defense Evasion and Privilege Escalation, because the same action accomplishes both. Techniques are not slots in a linear sequence.

## The parts most people skip

**Data Sources** — each technique lists what telemetry can detect it. This is the most directly useful section for a defender and the least read: it answers "what would I need to be logging to see this," which converts an ATT&CK reference into a concrete instrumentation gap. It is exactly the reasoning behind [Sysmon deployment](#/lesson/l1-12-sysmon-deployment).

**Mitigations** — what prevents the technique, not just what detects it.

**Procedure examples** — real observed uses by named groups, which turn an abstract technique into something concrete enough to write a detection against.

## What ATT&CK is not

> [!IMPORTANT]
> ATT&CK is a shared vocabulary and a coverage-reasoning tool. It is **not** a maturity model, a checklist, or a score. "We cover 80% of ATT&CK" is close to meaningless — techniques are not equally weighted, not equally relevant to any given environment, and coverage of a technique does not mean coverage of every procedure implementing it.

It also is not exhaustive. It is a catalogue of *observed* adversary behaviour, which lags real-world novelty by definition. Something absent from ATT&CK is not thereby impossible.

## How it is actually used

- **Communication** — "this is T1003.001" is unambiguous in a way "they dumped creds" is not, across teams and vendors.
- **Coverage mapping** — identifying which tactics your telemetry genuinely covers versus assumes, which is what [the coverage map lesson](#/lesson/l1-10-attack-coverage-map) builds directly.
- **Detection engineering** — writing rules against a technique's data sources rather than against one sample's indicators.
- **Threat modelling** — starting from the groups and software known to target your sector.

## Sources

- [MITRE ATT&CK](https://attack.mitre.org/)
- [MITRE ATT&CK — Getting Started](https://attack.mitre.org/resources/get-started/)
