# DFIR Analysis Academy

<h3 align="center">
  <a href="https://ironbranded.github.io/Microsoft-DFIR-Academy/" target="_blank" rel="noopener noreferrer">
    🟢 FIND YOUR DFIR WAY 🟢
  </a>
</h3>

## Objective

A free, self-paced, interactive curriculum for **enterprise digital forensics and incident response** — built to take someone from zero to competent across Windows endpoints, memory, Active Directory, hybrid/cloud identity, email, and network forensics, not just serve as a lookup reference.

Built for SOC analysts, incident responders, and threat hunters. Every lesson is sourced from SANS course material and posters, Microsoft (internals, cloud, and MSTIC documentation), and 13cubed — cited directly where a specific claim depends on it, not just gestured at in general. This academy is **not** written for criminal-prosecution workflows; evidence-handling guidance throughout is scoped to what enterprise IR actually needs, not chain-of-custody requirements for court.

## Chapters covered

Eight levels, novice through advanced. Each lesson is either fully written (`ready`) or scoped with a real title, summary, and objectives awaiting a full write-up (`coming-soon`) — see `content/manifest.json` for the authoritative, current status of every lesson.

| Level | Title | Difficulty | Focus |
|---|---|---|---|
| 1 | Foundations | Novice | Mindset, methodology, and the frameworks every later level assumes |
| 2 | Windows Endpoint Forensics | Beginner | Execution evidence and filesystem artifacts — what ran, what touched disk |
| 3 | PowerShell & Persistence | Beginner | Decoding what actually executed, and how attackers survive a reboot |
| 4 | Active Directory & Domain Controllers | Intermediate | Domain compromise, credential theft, and the double-reset recovery discipline |
| 5 | Windows Memory Forensics | Intermediate–Advanced | What only exists while the machine is running |
| 6 | Cloud Identity, Email & the Defender Suite | Intermediate–Advanced | Entra ID, hybrid identity, email header forensics, and Microsoft's own telemetry |
| 7 | Network Forensics & Anti-Forensics | Advanced | Log- and flow-level network evidence, and what survives an attacker's cleanup |
| 8 | Capstone: Playbooks & Case Studies | Advanced | Everything above, run end to end against realistic scenarios |

A **Reference hub** (Glossary, Tool Directory, Windows IR Quick Reference, Sources) and three **curated tracks** (Incident Responder Fast Track, Cloud & Hybrid Identity Track, Domain Compromise Track) sit alongside the levels for readers who want a shorter path through specific material.

## License

MIT — see [`LICENSE`](LICENSE). Free to use, modify, and redistribute, including commercially, with the original copyright notice retained.

The lesson/level engine (progress tracking, quizzes, search, markdown rendering) is adapted from IronBranded's [Malware Analysis Academy](https://ironbranded.github.io/Malware-Analysis-Academy/), also MIT-licensed. The DFIR content itself is original writing, restructured and re-authored lesson by lesson from this project's earlier, MkDocs-based form into this interactive format.

## How to use it locally

No install, no build step, no dependencies:

```bash
cd DFIR-Analysis-Academy
python3 -m http.server 8000
```

Then open `http://localhost:8000`. A local server is required rather than opening `index.html` directly — the app fetches lesson content and JSON as separate files, which browsers block over the `file://` protocol.
