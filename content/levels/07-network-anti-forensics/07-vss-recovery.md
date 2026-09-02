Windows takes point-in-time snapshots of volumes for its own reasons — System Restore, backup software, some installers. Those snapshots preserve files as they existed at the moment they were taken, which frequently means **before** an attacker deleted, modified, or encrypted anything.

## How it works

The Volume Shadow Copy Service uses **copy-on-write** at the block level. When a block is about to change, the original is copied into the shadow storage area first. A snapshot is therefore not a full duplicate of the volume — it is the current volume plus the set of blocks that have changed since the snapshot was taken.

That has a practical consequence: shadow copies are relatively cheap, and multiple snapshots can coexist covering weeks of history on a normal workstation.

## What this recovers

**Files before ransomware encryption.** The single best-known use, and the reason [`vssadmin delete shadows /all /quiet`](#/lesson/l2-15-vss-deletion-ransomware-precursor) is a near-universal ransomware precursor.

**Event logs before clearing.** A shadow copy predating a [log clear](#/lesson/l7-06-log-artifact-recovery) contains the intact `.evtx`. This is one of the strongest recovery paths available after 1102.

**Registry hives before a persistence mechanism was installed.** This is the underused one. Extract the `SOFTWARE` or `SYSTEM` hive from a shadow copy predating the intrusion, and **diff it against the current hive**. Every added [Run key](#/lesson/l3-05-registry-run-keys), [service](#/lesson/l3-07-windows-services), and modified value appears as a difference — a persistence inventory produced by comparison rather than by hunting.

**Files the attacker deleted**, complete with their original metadata, rather than [carved fragments](#/lesson/l7-04-file-carving).

## The deletion is itself evidence

> [!IMPORTANT]
> Shadow copy deletion is not something normal operation or routine administration does at scale. `vssadmin delete shadows /all /quiet`, `wmic shadowcopy delete`, or `Get-WmiObject Win32_ShadowCopy | Remove-WmiObject` executing on an endpoint is a high-confidence pre-encryption indicator — often the last clear signal before deployment, and one of the most valuable things to alert on in real time.

## Limitations

Snapshots are **deleted automatically under storage pressure**, oldest first, so history is not guaranteed. They may be disabled entirely by policy. And because copy-on-write only preserves changed blocks, a snapshot cannot recover something that never existed at snapshot time.

## Normal baseline

Shadow copies exist and cover a reasonable window, created on a schedule by System Restore or backup software. Their count and age are stable over time. No deletion events outside documented maintenance.

## Red flags

- **Any bulk shadow copy deletion**, particularly with `/quiet`.
- **Shadow copies unexpectedly absent** on a system where policy enables them.
- **A gap in snapshot history** aligning with a suspected intrusion window.
- **Registry differences** between a pre-intrusion shadow copy and the current hive.

## How to collect it

```
vssadmin list shadows
```

Access a shadow copy directly through its device path — `\\?\GLOBALROOT\Device\HarddiskVolumeShadowCopyN\` — or create a symbolic link to it with `mklink /d`. Working from a forensic image, most forensic suites expose shadow copies as separate mountable volumes, which is the cleaner approach.

For the registry diff technique, extract the hive from the shadow copy and compare with **Registry Explorer** or **RECmd** against the live hive, as covered in [registry hives](#/lesson/l2-06-registry-hives).

## ATT&CK mapping

Recovery technique countering [Inhibit System Recovery (T1490)](https://attack.mitre.org/techniques/T1490/) and [Indicator Removal (T1070)](https://attack.mitre.org/techniques/T1070/).

## Sources

- [Microsoft Learn — Volume Shadow Copy Service](https://learn.microsoft.com/en-us/windows-server/storage/file-server/volume-shadow-copy-service)
- MITRE ATT&CK — T1490
