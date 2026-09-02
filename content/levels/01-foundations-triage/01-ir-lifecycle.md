An incident response engagement doesn't start the moment you open a terminal, and it doesn't end the moment the attacker is kicked out. Both of those feel like the "real work," which is exactly why they're the two moments most responders instinctively treat as the boundaries of the job — and why the phases on either side of them are the ones that get shortchanged under pressure.

The Incident Response lifecycle is six phases, and the version worth internalizing isn't a straight line from left to right. It's a loop: the last phase feeds directly back into the first, which is the whole point.

> [!PLAIN]
> If you've only ever heard "the IR lifecycle" as a diagram in a slide deck, here's what it means in practice: it's the answer to "what do I actually do, in what order, on my worst day at work." Every artifact lesson elsewhere in this academy — Prefetch, the $MFT, LSASS memory — is a tool you reach for *during* one specific phase of this cycle. This lesson is the map that tells you which phase you're in and what "done" looks like before you move to the next one.

## The six phases

**Preparation.** Everything that happens before an incident, so that when one starts, you're not improvising: logging actually turned on and retained long enough to matter, an asset inventory that's accurate, a contact list that doesn't have three people who left the company on it, and — critically — practiced familiarity with exactly the kind of artifacts this academy covers. Preparation is invisible when it's done well, which is exactly why it's the easiest phase to under-invest in.

**Identification.** Confirming that what you're looking at is actually an incident, not a false positive, a scheduled maintenance window, or a misconfigured scanner. This is a judgment call made under incomplete information, and getting it wrong in either direction is costly — declaring an incident that isn't one burns trust and resources; missing one that is costs you the head start every later phase depends on.

**Containment.** Stopping the bleeding without destroying the evidence you'll need for the next two phases. Containment itself splits into short-term (isolate the host, disable the account, block the C2 domain — buy time) and long-term (get back to a stable operating state while eradication is still being planned). The short-term/long-term split matters because treating them as one step is exactly what leads to premature eradication.

**Eradication.** Actually removing the attacker's presence — every persistence mechanism, every backdoor account, every scheduled task. This is where the [Persistence Catalog](#/lesson/l5-01-registry-run-keys) earns its keep: eradication done against an incomplete list of what an attacker planted is eradication that fails, quietly, and you find out three weeks later when they're back.

**Recovery.** Returning systems to normal production with confidence — not hope — that they're clean, then watching them closely for a defined period afterward. Recovery is where "we think we got everything" gets tested against reality.

**Lessons Learned (Post-Incident Activity).** The phase every methodology names and almost every real engagement skips once the pressure is off. Done properly, it's not a blame exercise — it's specifically asking what would have made Preparation better for the *next* incident, which is the loop closing.

> [!NOTE]
> Notice that phase six points directly back at phase one. That's not a coincidence of the diagram — it's the actual design. An organization that never closes this loop relives the same gaps incident after incident.

## The mistake that shows up constantly in real engagements

The single most common real-world failure isn't skipping a phase outright — it's **collapsing Containment and Eradication into one decision**, usually under executive pressure to "just fix it now."

Here's why that's dangerous: eradication actions (killing processes, deleting files, resetting credentials) are frequently loud, and if you take them before containment is solid, you risk tipping off an attacker who still has other footholds you haven't found yet — causing them to accelerate destructive action, or simply go quieter and wait you out. Containment first, confirmed and holding, *then* eradication, is the order for a reason: it converts "we might have stopped this" into "we have stopped this, now we're removing it."

> [!CAUTION]
> If someone asks you mid-incident "why haven't we just removed it yet," the honest answer is often "because we're not confident that's everything, and removing what we've found so far might tell the attacker we're onto them before we've found the rest." That's not indecision — that's the correct sequencing of this lifecycle under pressure.

## Where this maps across the rest of the academy

| Phase | What it looks like in practice | Where in this academy |
|---|---|---|
| Preparation | Logging baselines, the process-tree and artifact baselines you'll compare against later | Level 2 baselines, [Order of Volatility](#/lesson/l1-02-order-of-volatility) |
| Identification | Recognizing a red flag against a known baseline | Every "Red flags" section across Levels 2–7 |
| Containment | Isolate, disable, revoke sessions | [Hybrid Account-Compromise Runbook](#/lesson/l2-04-hybrid-runbook) |
| Eradication | Removing every persistence mechanism found | Level 3's Persistence modules |
| Recovery | Confirmed-clean, monitored return to production | The closing steps of every [Playbook](#/lesson/l8-01-playbook-bec) in Level 8 |
| Lessons Learned | Feeding gaps back into Preparation | [Reporting & Communication](#/lesson/l1-11-reporting-communication) |

Every artifact page you'll read from here forward assumes you know which of these six phases it's supporting. That context is what turns "I found something interesting" into "I know exactly what to do next."

## Sources

- [NIST SP 800-61 Rev. 2 — Computer Security Incident Handling Guide](https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final)
- SANS Incident Handler's Handbook — the six-step PICERL model
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
