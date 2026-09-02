Detection (the first lesson in this module) and enforcement (the second) both stop short of the question this lesson answers: once something is caught, what actually happens to it, and what's left over for an investigator afterward?

## Quarantine: what actually happens to a caught file

A file Defender quarantines isn't deleted — it's moved into a local quarantine store and encoded in a proprietary format specifically so it can't be accidentally executed or read by anything other than Defender itself. That encoding is also why quarantined samples aren't directly usable for further analysis without help: **DeXRAY**, a SANS-published open-source tool built for exactly this, decodes a quarantined item back to its original bytes for safe offline analysis — a genuinely useful capability when the quarantined item itself is the best available sample of whatever an attacker tried to run.

> [!TIP]
> A quarantine action (Event ID 1117 with a Quarantine or Remove action type, from [the detection lesson](#/lesson/l2-05-defender-av-mechanics)) is often the single fastest way to get a real sample of what an attacker attempted, since it's already been located and isolated by Defender before an analyst even started looking.

## Automated Investigation & Remediation (AIR)

**AIR** is Defender's automated response layer — when configured, it investigates an alert the way an analyst would (examining related entities, correlating with other signals) and takes remediation action automatically or pending approval, depending on the configured **automation level**. Three levels exist: no automation (not recommended — Microsoft's own guidance is explicit that this reduces a device's security posture), semi-automated (remediation actions wait for approval in the Action Center), and full automation (remediation happens immediately).

> [!IMPORTANT]
> This is a lesson where the platform itself changed recently enough to matter for how you read older evidence. (cite index="24-1">As of September 1, 2026, Automated Investigation and Response no longer runs as a separate investigation experience or is available for manual triggering in Microsoft Defender for Endpoint</cite> — (cite index="30-1">its detection and response capabilities are now embedded directly in Defender's always-on antivirus protection stack and run automatically, with a full antivirus scan replacing what used to be a manually-triggered AIR investigation</cite>. Practically: an incident timeline reconstructed from *before* this date may show a standalone AIR investigation record; one reconstructed from after it will show remediation folded directly into ordinary antivirus/detection events instead — the protection itself didn't go away, but where you go looking for evidence of it changed. (cite index="24-1">This change applies specifically to Defender for Endpoint — Defender for Office 365's AIR capabilities are unaffected</cite>.

## Live Response: the manual complement

Where AIR is automated, **Live Response** is Microsoft Defender for Endpoint's built-in remote investigation and remediation shell — a responder-initiated, live connection to a managed device that can run built-in and custom scripts, collect forensic artifacts, and take direct remediation action, without needing separate remote-access tooling or exposing RDP. For a cloud-managed fleet, this is often the fastest way to get hands-on a specific endpoint mid-investigation, and it generates its own audit trail of exactly what commands a responder ran and when.

## Normal baseline

Automation level is set to full or semi-automated fleet-wide (not "no automation," per Microsoft's own guidance above), the Action Center shows a steady, reviewed stream of pending/completed remediations rather than an accumulating backlog of unapproved actions, and any legacy playbooks or scripts that used to trigger AIR manually have been updated to account for the September 2026 change.

## Red flags

- **A large backlog of pending, unapproved remediation actions in the Action Center** — either nobody is reviewing them, or a broken integration is generating far more alerts than expected.
- **A remediation action reversed (undone) shortly after being applied**, with no documented justification — worth treating as its own investigative thread, not just noise.
- **Live Response sessions initiated from an account with no prior history of IR tooling use**, or outside normal change-management hours — the same capability that helps a legitimate responder also helps an attacker who has compromised a privileged account with access to it.
- **Automation level set to "no automation" fleet-wide with no documented reason** — a configuration choice Microsoft explicitly advises against.

## How to collect it

The Action Center in the Microsoft Defender portal is the primary source for AIR history — pending and completed actions, with the option to review and reverse. Live Response session activity is similarly logged in the portal, tied to the analyst account that initiated it. `MpCmdRun.exe -Restore -ListAll` lists locally quarantined items directly on a host when portal access isn't available; DeXRAY handles the decode step once a sample is retrieved.

## ATT&CK mapping

This lesson covers response capability rather than a specific attacker technique. Abuse of legitimate remote-administration tooling — which a compromised Live Response session would represent — falls under [Remote Access Software (T1219)](https://attack.mitre.org/techniques/T1219/) if the responder account itself is the compromised element.

## Sources

- [Microsoft Learn — Automated investigations in Microsoft Defender](https://learn.microsoft.com/en-us/defender-endpoint/automated-investigations)
- [Microsoft Learn — View and manage actions in the Action center](https://learn.microsoft.com/en-us/defender-xdr/m365d-autoir-actions)
- [Microsoft Learn — Investigate entities using live response](https://learn.microsoft.com/en-us/defender-endpoint/live-response)
- SANS FOR528 — Ransomware for Incident Responders (DeXRAY)
