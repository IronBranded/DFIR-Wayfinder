David Bianco's Pyramid of Pain answers a question most detection programs never explicitly ask: **when we build a detection, how much does it actually cost the adversary to evade it?** The answer varies enormously, and the variance explains why some detections stay useful for years and others are dead within hours.

## The six levels

From the bottom — trivial for an adversary to change — to the top:

| Level | Adversary cost to change |
|---|---|
| **Hash values** | Trivial |
| **IP addresses** | Easy |
| **Domain names** | Simple |
| **Network / host artifacts** | Annoying |
| **Tools** | Challenging |
| **TTPs** | Tough |

**Hashes** change with a single byte. Recompile, repack, append a null — the hash is new and every hash-based detection is blind. **IP addresses** cost the price of a new VPS. **Domains** require registration, which takes a little money and a little time. **Host and network artifacts** — a distinctive User-Agent, a registry key name, a filename pattern, a mutex — require the adversary to modify their tooling. **Tools** require finding or building replacements. **TTPs** — the actual behaviours — require changing how they operate, which is expensive, slow, and often requires retraining people.

## Why this academy is deliberately TTP-heavy

Read any "Red flags" section in this academy and notice what it contains. Not hashes. Not IP addresses. Behaviours:

- `lsass.exe` with a child process — [any credential dumping tool](#/lesson/l5-08-lsass-memory-analysis) triggers this, regardless of which one
- `w3wp.exe` spawning a command interpreter — [every web shell](#/lesson/l8-09-playbook-web-shell), regardless of implementation
- A `$SI` timestamp earlier than its `$FN` — [every timestomping tool](#/lesson/l2-02-mft-timestomping) that uses the standard API
- A replication request from a non-DC account — [every DCSync implementation](#/lesson/l4-05-dcsync-detection)

These sit at the top of the pyramid. An adversary evading them has to stop dumping LSASS, stop using web shells, stop timestomping — not just recompile.

## The nuance that gets lost

> [!IMPORTANT]
> The pyramid is not an argument for ignoring the bottom. Hash and IP detections are **cheap to build, cheap to run, and catch the majority of commodity activity at scale**. They are excellent value. The error is mistaking them for *resilient* — building a detection program that is entirely bottom-of-pyramid and believing it covers a capable adversary.

The practical position is both: cheap indicators for volume, behavioural detections for adversaries who care about not being caught.

## Where each artifact sits

This academy's own artifacts map across the pyramid, and knowing where each sits tells you how much to trust it against a determined attacker:

- [Amcache SHA-1](#/lesson/l2-04-amcache) — hash level. Excellent for pivoting, trivially defeated by recompilation.
- [C2 infrastructure from memory](#/lesson/l5-09-network-memory-artifacts) — IP/domain level. Perishable but immediately actionable.
- [Mutex names](#/lesson/l5-07-mutex-analysis) — host artifact level. More durable than a hash precisely because there is rarely a reason to vary them.
- [Process tree anomalies](#/lesson/l2-10-process-trees) — TTP level. The most durable detections in this academy.

## Applied to your own program

Ask of any detection: *what does the adversary have to change to evade this?* If the answer is "recompile," the detection is worth having but not worth relying on. If the answer is "stop stealing credentials from LSASS," it will still be working next year.

## Sources

- David Bianco — "The Pyramid of Pain" (2013)
- MITRE ATT&CK — the TTP layer this framework points toward
