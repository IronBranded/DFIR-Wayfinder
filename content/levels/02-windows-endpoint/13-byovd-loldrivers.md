Every driver in this lesson is legitimately signed by Microsoft or a real hardware vendor. That signature is precisely the problem: Windows Driver Signature Enforcement checks that a driver is properly signed, not that it's *safe* — and a signed driver with a known, exploitable vulnerability passes that check just as cleanly as a genuinely trustworthy one.

> [!PLAIN]
> BYOVD — Bring Your Own Vulnerable Driver — means exactly what it says: the attacker doesn't write malicious kernel code and try to sneak it past signature checks. They bring an *already-signed, already-vulnerable* driver, install it, exploit its known flaw, and get kernel-mode code execution through a door that was never supposed to be a door.

## Why this specifically targets EDR and antivirus

BYOVD is not an initial-access technique — it requires the attacker already have local administrator privileges on the target, typically obtained through a completely separate technique earlier in the intrusion. What it buys, once that privilege exists, is kernel-mode execution: code running below and outside the reach of any user-mode security product. From there, an attacker can terminate, blind, or unhook EDR and antivirus processes entirely — not evade them, disable them outright. This has become a signature move of ransomware crews and APT actors alike specifically because it's more reliable than trying to slip malware past a product that's still actively watching.

## Normal baseline

Legitimate drivers load from `%SystemRoot%\System32\drivers\`, correspond to actual installed hardware or software, and — on any given host — form a small, stable, predictable set that barely changes between reboots. New driver loads are rare events on a healthy endpoint outside of patch cycles or new hardware installation.

> [!TIP]
> A driver load event is inherently high-signal precisely because it's rare. Unlike process creation, which happens constantly, a genuinely new, previously-unseen driver loading on a production endpoint is worth a look regardless of what else is happening.

## Red flags

- **A driver loading from `%TEMP%`, `%AppData%`, a user profile directory, or removable media** — legitimate drivers simply don't install from these locations.
- **A driver hash matching the [LOLDrivers](https://www.loldrivers.io/) database** — the community-maintained catalog of known-vulnerable, known-abused signed drivers. Even a properly signed driver on this list is not one that should be loading.
- **Named, previously-abused drivers by name or hash** — `VBoxDrv.sys` (exploited by ZeroCleare and Turla), `mimidrv.sys` (Mimikatz's own driver), or any driver tied to a revoked certificate.
- **A driver load immediately preceded by a suspicious process chain**, or immediately followed by EDR/antivirus processes terminating or going silent — the actual attack sequence, not just the driver load in isolation.
- **A `bcdedit.exe` execution modifying boot configuration** to disable code integrity checks or enable test-signing mode, often a precursor step to loading a driver that wouldn't otherwise pass signature enforcement.

## How to collect it

**Sysmon Event ID 6 (Driver Loaded)** is the primary detection surface — it logs every kernel driver load including hash, path, and signing status, and is the only practical way to catch this at the moment it happens rather than after the fact. Windows Event ID 3004/3033 flag Driver Signature Enforcement failures or bypasses directly. Because BYOVD's entire purpose is often killing the security tooling that would otherwise generate telemetry, the driver-load event itself may be the last reliable signal before visibility goes dark — which makes ingesting Sysmon Event ID 6 into a SIEM for asynchronous hash lookups against LOLDrivers, rather than relying on real-time endpoint alerting alone, a genuinely important architectural choice, not just a nice-to-have.

## ATT&CK mapping

BYOVD maps to [Exploitation for Privilege Escalation (T1068)](https://attack.mitre.org/techniques/T1068/) and commonly overlaps with [Impair Defenses: Disable or Modify Tools (T1562.001)](https://attack.mitre.org/techniques/T1562/001/) once the driver is loaded and used to kill security products. **HVCI (Hypervisor-Protected Code Integrity / Memory Integrity)**, enforced at the hypervisor level below the OS, and Microsoft's own Vulnerable Driver Blocklist are the two mitigations that actually prevent this rather than just detect it after the fact.
