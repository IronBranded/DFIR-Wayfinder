Ransomware runs under more time pressure than anything else in this academy, and the pressure is the problem: recovery decisions cannot wait for a complete investigation, but recovering without investigating first is how organizations get encrypted twice.

## The reframe that matters most

**Encryption is the end of an intrusion, not the beginning.** By the time files are encrypted, the attacker has usually been present for days or weeks — establishing access, moving laterally, obtaining domain privileges, and very often staging and exfiltrating data. The investigation runs *backwards* from the encryption event, and the initial access it finds is what determines whether recovery holds.

## Trigger

Mass file modification alerts. A ransom note. Users reporting inaccessible files. Backup jobs failing unexpectedly — sometimes the earliest signal, since backups are targeted before encryption starts.

## First hour

**1. Isolate from the network — carefully.** Disconnect affected hosts from the network to stop lateral encryption. Resist powering off where you can: [memory holds evidence that disappears with power](#/lesson/l5-01-acquisition), sometimes including keys and always including the process and network state that explains what happened. Network isolation stops the spread; power-off destroys evidence.

**2. Protect the backups before anything else.** Attackers delete shadow copies (`vssadmin delete shadows`) and target backup infrastructure directly. Verify backup integrity and isolate backup systems immediately — a backup you can't restore from converts a recoverable incident into an unrecoverable one.

**3. Determine whether data was exfiltrated.** Double extortion means the encryption may be the *lesser* problem. This changes notification obligations, legal exposure, and negotiation posture entirely, so it belongs in the first hour rather than as a later finding. Run the [exfiltration playbook](#/lesson/l8-07-playbook-data-exfiltration) in parallel.

## Scoping backwards

Identify the encryption binary and its deployment mechanism — very often a GPO, PsExec, or a management tool, meaning the attacker had privileged access. Work back from there to lateral movement, credential theft, and initial access. Assume domain compromise unless you can demonstrate otherwise, and run [that playbook](#/lesson/l8-04-playbook-domain-compromise) alongside this one.

## Recovery decisions that can't wait

**Restore or rebuild?** Restoring from backup returns you to a point in time that may already contain the attacker's access. If you cannot yet say when initial access occurred, you cannot say whether your restore point is clean.

**Credentials.** Assume every credential on every affected system is compromised. Rotation happens before restored systems rejoin the network, not after.

**Payment.** A business and legal decision, not a technical one. The technical input is honest: whether you can recover without it, and whether exfiltrated data makes payment relevant regardless of decryption.

## Closure criteria

Initial access identified and closed — without this, recovery is provisional. Encryption mechanism and deployment path understood. Exfiltration scope determined. Credentials rotated domain-wide. Restored systems verified clean before rejoining. Backups validated and hardened.

## Common mistakes

- Restoring before identifying initial access, leading to re-encryption.
- Powering off hosts and destroying memory evidence.
- Treating it as an endpoint incident when it's almost always a domain incident.
- Missing exfiltration entirely and understating breach-notification scope.

## ATT&CK mapping

[Data Encrypted for Impact (T1486)](https://attack.mitre.org/techniques/T1486/), [Inhibit System Recovery (T1490)](https://attack.mitre.org/techniques/T1490/), [Exfiltration Over C2 Channel (T1041)](https://attack.mitre.org/techniques/T1041/).

## Sources

- MITRE ATT&CK — T1486, T1490
- SANS FOR528 — Ransomware for Incident Responders
