Full packet capture answers every question and is affordable for almost nobody at scale. NetFlow answers fewer questions, costs orders of magnitude less to store, and is therefore **still there** when an investigation starts weeks after the activity. That tradeoff decides more investigations than the technical difference between the two.

## What a flow record contains

Source and destination IP, source and destination port, protocol, packet count, byte count, start and end time, and TCP flags. **No payload.**

## The retention argument

Full PCAP at any real link speed fills storage in days. Flow records are perhaps a hundred bytes per conversation, which means **months** of history for the cost of hours of PCAP.

This connects directly to [order of volatility](#/lesson/l1-02-order-of-volatility): the value of an evidence source is not only its detail but how long it survives. A perfect record that expired before you looked is worth less than a partial one that is still there. It is also why [the exfiltration playbook](#/lesson/l8-07-playbook-data-exfiltration) treats egress log collection as a first-hour task.

## What you can do without payload

**Volume analysis.** Byte counts work identically against encrypted and cleartext traffic. You cannot see *what* left, but you can establish that 40 GB went to a given destination over six hours — which is frequently the number that determines notification scope.

**Beaconing detection.** Inter-arrival regularity and consistent transfer sizes, the same analysis as [proxy triage](#/lesson/l7-02-proxy-firewall-triage), applied to flows.

**Lateral movement mapping.** This is where flow data is uniquely strong. Workstation-to-workstation SMB is abnormal in most environments — endpoints normally talk to servers, not to each other. A single workstation initiating connections to fifty peers on 445 is a pattern flow data shows clearly and endpoint telemetry shows only host by host.

**Long-duration connections** and **port/protocol anomalies** — traffic on a port with no business use, or a flow whose duration and shape do not match its port's expected protocol.

## The blind spot most environments have

Most organizations collect flow at the **perimeter** — north-south traffic crossing the boundary. Lateral movement is **east-west**, between internal hosts, and it never crosses that boundary.

> [!WARNING]
> An environment collecting only perimeter flow can see the initial callout and the eventual exfiltration while being completely blind to everything between them. Internal flow collection — at core switches, or via cloud VPC/NSG flow logs — is what makes the middle of an intrusion visible.

## What flow cannot tell you

It cannot tell you **what** left, only how much. That limitation maps directly onto the three-tier scope statement in [the exfiltration playbook](#/lesson/l8-07-playbook-data-exfiltration): flow data supports "a transfer of this size went to this destination at this time," which is a defensible upper bound, not a content inventory. Reporting it as more than that is where scope statements go wrong.

## Normal baseline

Endpoints talk to servers and to the internet, not to each other. Flow volumes follow business hours. Destinations and ports match known applications. Long-lived flows belong to a small, nameable set of services.

## Red flags

- **Workstation-to-workstation connections**, particularly on 445, 3389, or 5985.
- **Large sustained outbound volume** to a single external destination, especially outside business hours.
- **Regular-interval flows with consistent byte counts** — beaconing.
- **A flow on a port with no known business use**, or a long-lived flow on a port that should see short transactions.
- **An internal host connecting to an unusually large number of internal peers** — scanning or lateral spread.

## How to collect it

**SiLK** and **nfdump** are the established analysis toolsets for NetFlow/IPFIX. **Zeek's `conn.log`** provides equivalent connection metadata with richer protocol context where Zeek sensors exist. In cloud environments, **VPC Flow Logs** and **NSG Flow Logs** are the direct equivalents and carry the same retention advantage. Collect internally as well as at the perimeter, or accept the blind spot knowingly.

## ATT&CK mapping

Supports detection across [Command and Control (TA0011)](https://attack.mitre.org/tactics/TA0011/), [Lateral Movement (TA0008)](https://attack.mitre.org/tactics/TA0008/), and [Exfiltration (TA0010)](https://attack.mitre.org/tactics/TA0010/).

## Sources

- [RFC 7011 — IPFIX Protocol Specification](https://www.rfc-editor.org/rfc/rfc7011)
- [Zeek](https://zeek.org/)
- SANS FOR572 — Advanced Network Forensics
