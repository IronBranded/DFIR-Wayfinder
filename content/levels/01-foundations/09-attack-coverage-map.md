This academy covers artifacts one at a time. A coverage map turns that into a single tactic-level view of what you can actually detect — and, more importantly, what you cannot. The value is almost entirely in the second half.

## Scoring honestly

The failure mode is scoring by **tool ownership** rather than **demonstrated capability**. "We have an EDR, so Credential Access is covered" is how a coverage map becomes a document that reassures people while describing nothing real.

Four levels produce an honest map:

| Level | Meaning |
|---|---|
| **No visibility** | The telemetry does not exist. Nothing could detect this. |
| **Telemetry, no detection** | The data is collected but nothing looks at it |
| **Detection exists** | A rule fires on this |
| **Detection validated** | Someone executed the technique and the detection fired |

The gap between the third and fourth is where most programs quietly live. An untested detection is a hypothesis about your own environment, and hypotheses about detection are wrong more often than anyone expects — a rule that references a field name that changed, or an event type the current agent version no longer emits, looks identical to a working rule until someone tests it.

## Validating

**Atomic Red Team** provides small, scoped tests mapped directly to ATT&CK techniques — execute the technique in a controlled way, confirm whether the detection fires. **Purple team exercises** do the same at greater depth with an actual operator. Either turns "detection exists" into "detection validated," which is the only transition that changes what the map means.

## The Navigator

**ATT&CK Navigator** renders coverage as a colour-coded layer over the matrix, exportable and version-controllable as a JSON layer file. Multiple layers can be compared — current coverage against a threat-model layer for the groups relevant to your sector, for instance, which immediately shows which gaps actually matter.

> [!WARNING]
> Be sceptical of vendor-supplied coverage layers. They typically mark a technique covered if the product **could** detect it in some configuration, not whether it does in yours, with your policy, at your log levels. Treat a vendor layer as a claim to test, not a measurement to adopt.

## Naming gaps openly

A documented gap is a decision — someone weighed it and accepted the risk, and it can be revisited when priorities change. An undocumented gap is a surprise during an incident, discovered at the worst possible time.

This is why the honest map is more useful than the flattering one, and why coverage should never be reported as a percentage. As [the ATT&CK primer](#/lesson/l1-03-attack-primer) puts it, techniques are not equally weighted or equally relevant. Prioritize gaps by relevance to your threat model, not by how many red cells remain.

## Building one from this academy

Each lesson's ATT&CK mapping section names the techniques it covers. Aggregating them produces a content coverage layer — which is not the same as *your* detection coverage, but is a starting structure. The step that matters is replacing "this academy teaches it" with "we detect it here, and we have tested that."

## Red flags in your own map

- **Coverage scored by tool inventory** rather than tested detections.
- **A vendor layer adopted without validation.**
- **No distinction between "detection exists" and "detection validated."**
- **Coverage reported as a percentage** to an audience that will treat it as a maturity score.
- **Gaps present in the data but absent from any risk register.**

## Sources

- [MITRE ATT&CK Navigator](https://mitre-attack.github.io/attack-navigator/)
- [Atomic Red Team](https://atomicredteam.io/)
- MITRE ATT&CK
