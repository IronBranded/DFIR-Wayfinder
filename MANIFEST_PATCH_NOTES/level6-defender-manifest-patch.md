# Level 6 rework — manifest changes

Reflects your three answers: keep `l6-01` in full, keep Level 3's Cloud Persistence lessons (`l3-13`–`l3-18`) untouched, split email (generic stays, M365-specific leaves).

## 1. Remove these 9 lesson objects from `06-cloud-identity-email-defender.lessons[]`

`l6-02-sign-in-vs-audit-logs`, `l6-03-conditional-access-investigation`, `l6-04-identity-protection-risk`, `l6-05-hybrid-sync-mechanics`, `l6-06-entra-connect-as-target`, `l6-12-defender-cloud-apps-oauth`, `l6-14-cloud-discovery-entra-enumeration`, `l6-15-mailbox-message-trace-forensics`, `l6-16-legacy-authentication-ca-bypass`, `l6-17-sharepoint-onedrive-exfiltration`.

**One judgment call I made without a direct question for it:** I kept `l6-11-defender-for-identity-mapping` rather than removing it alongside `l6-12`. Reading its actual summary — mapping Defender for Identity's alert catalog onto DCSync and Golden Ticket, which are core Level 4 content — it's closer to "the Defender suite's view of AD attacks you already teach" than to cloud-identity-log investigation, unlike Defender for Cloud Apps (pure SaaS/CASB, no such tie-in). Easy to reverse if you'd rather it go too.

**Content-migration note:** `l6-15` (leaving) has a fully-written "Offline mailbox artifacts: PST, OST, and MBOX" section that's genuinely platform-agnostic — not M365-specific. When `l6-08-message-source-attachments` (staying, still `coming-soon`) gets written, that section is worth carrying over into it rather than losing it with the rest of `l6-15`. I didn't write `l6-08` this round to keep scope contained, but flagging it now so it doesn't get lost in the move.

## 2. Level 6 metadata — replace the level object's header fields

```json
{
  "id": "06-cloud-identity-email-defender",
  "number": 6,
  "title": "Email Forensics, Hybrid Response & Microsoft Defender",
  "tagline": "A mailbox, a hybrid identity, and the endpoint security product doing the most work on every host in this academy's scope.",
  "difficulty": "Intermediate-Advanced",
  "description": "The hybrid account-compromise runbook this academy is built around, email header/message forensics, and Microsoft Defender's antivirus and endpoint-protection mechanics -- how it operates, mitigates, quarantines, and what an attempt to evade or disable it looks like forensically. Deep Entra/Conditional Access/hybrid-sync investigation now lives in a separate cloud-DFIR project; this level keeps only what's genuinely hybrid or endpoint-adjacent."
}
```

(Folder path stays `content/levels/06-cloud-identity-email-defender/` — renaming it would churn every existing `contentPath`/`quizPath` for lessons that aren't changing. Not worth the risk for a cosmetic rename.)

## 3. New manifest entries

```json
{
  "id": "l6-13-automated-investigation-remediation",
  "module": "Microsoft Defender for Endpoint",
  "title": "Automated Investigation, Remediation & Live Response",
  "summary": "Quarantine mechanics, what AIR actually automates, the September 2026 change that folded it into always-on antivirus, and Live Response as the manual complement.",
  "estimatedMinutes": 22,
  "status": "ready",
  "tags": ["defender", "air", "quarantine", "live-response"],
  "contentPath": "content/levels/06-cloud-identity-email-defender/13-automated-investigation-remediation.md",
  "quizPath": "content/levels/06-cloud-identity-email-defender/13-automated-investigation-remediation.quiz.json",
  "objectives": [
    "Explain why a quarantined file requires a decoding tool like DeXRAY before it can be analyzed further",
    "State what changed for AIR specifically on September 1, 2026, and what stayed the same",
    "Explain why Microsoft's own guidance advises against the \"no automation\" AIR level",
    "Identify Live Response as a manual, auditable complement to AIR's automation"
  ]
}
```

```json
{
  "id": "l6-18-defender-av-mechanics",
  "module": "Microsoft Defender for Endpoint",
  "title": "Defender AV & MDE: Core Mechanics",
  "summary": "The three protection layers, passive vs. active mode, and the 1116/1117 detection-and-action event pair that anchors most Defender-driven timelines.",
  "estimatedMinutes": 20,
  "status": "ready",
  "tags": ["defender", "mde", "event-ids"],
  "contentPath": "content/levels/06-cloud-identity-email-defender/18-defender-av-mechanics.md",
  "quizPath": "content/levels/06-cloud-identity-email-defender/18-defender-av-mechanics.quiz.json",
  "objectives": [
    "Name the three protection layers and which one intercepts fileless, in-memory activity specifically",
    "Interpret a 1116 event with no matching 1117 remediation correctly",
    "Distinguish passive mode from active mode and why it changes how you read the event pair",
    "Explain why zero detection history across a fleet is itself worth investigating"
  ]
}
```

```json
{
  "id": "l6-19-attack-surface-reduction",
  "module": "Microsoft Defender for Endpoint",
  "title": "Attack Surface Reduction & Tamper Protection",
  "summary": "The named rule that blocks LSASS credential theft directly, the 1121/1122 block-vs-audit event pair, and why Tamper Protection is built to resist even a local administrator.",
  "estimatedMinutes": 20,
  "status": "ready",
  "tags": ["defender", "asr", "tamper-protection", "t1562.001"],
  "contentPath": "content/levels/06-cloud-identity-email-defender/19-attack-surface-reduction.md",
  "quizPath": "content/levels/06-cloud-identity-email-defender/19-attack-surface-reduction.quiz.json",
  "objectives": [
    "Name the ASR rule that directly protects the LSASS-access surface covered in Level 5",
    "Distinguish what a 1121 event confirms versus what a 1122 event only suggests",
    "Explain why Tamper Protection specifically targets the local-administrator threat model",
    "Recognize the exclusion-added-right-after-a-block pattern as deliberate evasion"
  ]
}
```

```json
{
  "id": "l6-20-observable-evasion-bypass",
  "module": "Microsoft Defender for Endpoint",
  "title": "Observable Evasion & Bypass Techniques",
  "summary": "What an attempt to disable, blind, or route around Defender looks like forensically -- PowerShell tampering, BYOVD as EDR-blinding, registry-based disabling, and Tamper Protection bypass attempts, tied back to Level 2 and Level 3.",
  "estimatedMinutes": 24,
  "status": "ready",
  "tags": ["defender", "evasion", "t1562.001", "byovd"],
  "contentPath": "content/levels/06-cloud-identity-email-defender/20-observable-evasion-bypass.md",
  "quizPath": "content/levels/06-cloud-identity-email-defender/20-observable-evasion-bypass.quiz.json",
  "objectives": [
    "Distinguish kernel-level EDR-blinding (BYOVD) from user-mode tampering, and why Tamper Protection only stops the latter",
    "Explain why a silent gap in Defender's log is a stronger signal than a logged 5001 disable event",
    "Identify the registry-based disabling route as a separate blind spot from PowerShell-focused monitoring",
    "Explain why a failed tampering attempt against a Tamper-Protected host still warrants full investigation"
  ]
}
```

## 4. Rescope, don't rewrite yet — `l6-09` and `l6-10`

Both stay `coming-soon` for now; when written, narrow their scope. Suggested summary replacements so the manifest reflects the new intent even before the content exists:

- `l6-09-advanced-hunting-kql` summary → `"Querying Defender's Device* tables directly (DeviceProcessEvents, DeviceNetworkEvents, DeviceFileEvents, DeviceRegistryEvents, DeviceImageLoadEvents) -- the query patterns that come up constantly enough to memorize."`
- `l6-10-detection-engineering` summary → `"Turning a one-off endpoint hunt query into a standing Sigma-style detection rule that fires automatically on the next occurrence."`

## 5. Updated `cloud-identity-track`

Five of the original ten lessons survive; renamed and re-described to match:

```json
{
  "id": "hybrid-identity-email-track",
  "title": "Hybrid Identity & Email Compromise Track",
  "description": "The hybrid account-compromise runbook, email-based attack forensics, and the cloud-touching persistence techniques attackers use most often against both.",
  "icon": "cloud",
  "estimatedHours": 2.4,
  "lessonIds": [
    "l6-01-hybrid-runbook",
    "l6-07-email-headers-authentication",
    "l6-08-message-source-attachments",
    "l3-14-oauth-consent-grants",
    "l3-16-mailbox-forwarding-rules"
  ]
}
```

## 6. Not touched this round

- `sources.md` — no structural change needed; "Microsoft Cloud" as a source category still covers Defender's cloud-managed portal, just not Entra/M365 identity content anymore. Worth a small wording pass later, not urgent.
- The `app.js` homepage bug (stale Malware Analysis Academy copy, dead `l7-02-cert-roadmap` link, "seven levels" text) flagged two turns ago — still open, still needs the complete file before I touch it.
- `l6-08` itself — still `coming-soon`; the PST/OST/MBOX migration note above is the main thing to carry into it when it's written.
