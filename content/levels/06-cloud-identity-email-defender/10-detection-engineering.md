A hunt query finds something once, when someone runs it. A detection rule finds it every time, automatically, including at 3am on a public holiday. This lesson is about the gap between the two, which is mostly not a technical gap.

## The lifecycle

**Hypothesis → hunt → validate → tune → deploy → measure → retire.**

The steps teams skip are *tune* and *retire*, and both are why detection programs decay. An untuned rule floods the queue until analysts learn to ignore it, which is worse than not having it. A rule nobody retires keeps firing on a technique the environment no longer exposes.

## Promoting a hunt query to a rule

In Defender XDR, a custom detection rule is an Advanced Hunting query with requirements attached: it must return the columns needed to identify **when** (`Timestamp`), **which record** (`ReportId`), and **which entity** (`DeviceId`, `AccountObjectId`, or similar). Without entity columns the platform cannot attach the alert to anything or take automated action on it.

Frequency is a real tradeoff — more frequent means faster detection and more load, and the right answer depends on how quickly the technique causes damage.

## False positives are the actual work

> [!IMPORTANT]
> A rule that fires 200 times a day with a 1% true-positive rate is worse than no rule at all. It consumes analyst attention, trains people to dismiss that alert name on sight, and provides false assurance that the technique is covered. Tuning is not polish applied after deployment — it is the precondition for deployment.

**Tune narrowly.** If a legitimate application triggers a rule, exclude *that binary from that path with that parent* — not the whole directory, not the whole product, and never the whole rule. Broad exclusions are how coverage silently disappears; they are also exactly what an attacker exploits, per the [exclusion-after-block pattern](#/lesson/l6-19-attack-surface-reduction).

Document every exclusion with its reason and a review date. Undocumented exclusions accumulate until nobody knows what the rule actually still covers.

## Build at the right altitude

[The Pyramid of Pain](#/lesson/l1-04-pyramid-of-pain) is the design principle. A rule matching a hash is trivially evaded. A rule matching `winword.exe` spawning a script interpreter requires the adversary to change how they operate. Both have a place — the first is cheap and catches commodity volume, the second survives a capable adversary — but knowing which you are building matters more than building either.

## Sigma: portability

**Sigma** is a tool-agnostic detection rule format with converters for most SIEM and EDR query languages. Writing detections in Sigma means the logic is reviewable in one place, version-controlled once, and deployable to whatever platform the environment uses now or migrates to later. For an environment with more than one query language in play, it is the difference between maintaining one rule and maintaining four.

## Detection-as-code

Treat detection content like software: version control, peer review before deployment, a test corpus of known-true and known-false events, and CI validation that a change does not break existing rules. This is the practice that separates a detection *program* from a collection of rules somebody wrote.

## Measuring

Track true-positive rate per rule, time from event to alert, and [ATT&CK coverage](#/lesson/l1-03-attack-primer) by tactic — with the caveat from that lesson that percentage coverage is a poor headline metric. The most useful number is usually the simplest: which rules have never produced a true positive, and why.

## Red flags in your own program

- **A rule with no documented owner or review date.**
- **Broad exclusions** — directory-wide or product-wide — added to silence noise.
- **Rules that have never fired**, which are either perfectly tuned or quietly broken, and nobody has checked which.
- **Detection logic existing only in one platform's console**, unversioned and unreviewed.
- **Alert volume growing without a corresponding change in true positives.**

## Sources

- [Microsoft Learn — Custom detection rules](https://learn.microsoft.com/en-us/defender-xdr/custom-detection-rules)
- [Sigma — Generic Signature Format for SIEM Systems](https://github.com/SigmaHQ/sigma)
- MITRE ATT&CK
