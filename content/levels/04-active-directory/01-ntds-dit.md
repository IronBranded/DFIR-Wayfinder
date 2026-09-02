`NTDS.dit` is the Active Directory database file, sitting on every domain controller at `C:\Windows\NTDS\ntds.dit`. It holds every object in the domain — and critically, the password hash for every domain account, including every Domain Admin and the [krbtgt account](#/lesson/l4-04-krbtgt-double-reset) that signs every Kerberos ticket in the environment. A single successful extraction is, in practical terms, total domain compromise: not one credential stolen, but all of them at once.

> [!PLAIN]
> "`.dit`" stands for Directory Information Tree. It's an ESE (Extensible Storage Engine) database — the same database engine that historically backed Exchange — which is why it can't simply be opened and read like a text file, and why the extraction methods below exist at all.

## The encryption layer, and why the SYSTEM hive matters

Password hashes inside `NTDS.dit` are encrypted with the **PEK** (Password Encryption Key), and the PEK itself is encrypted using the **boot key** — which lives not in the database but in the `SYSTEM` registry hive. This is why every extraction method below takes *two* inputs: the database and the SYSTEM hive. An attacker who somehow obtained only `NTDS.dit` without the SYSTEM hive has an encrypted database and no way to unlock the hashes inside it.

## Extraction methods, and what each leaves behind

**Volume Shadow Copy** is the classic approach: `NTDS.dit` is locked by the operating system while AD is running, so it can't simply be copied. Creating a shadow copy (via `vssadmin create shadow`, or `ntdsutil`'s "IFM" — Install From Media — snapshot functionality) produces a consistent, copyable point-in-time version. The trace: shadow-copy creation events, and `ntdsutil` or `vssadmin` command lines in process-creation logging.

**`ntdsutil ac i ntds` / `ifm`** creates a full IFM media set — an entirely legitimate, documented Microsoft procedure for building a new DC from media, which is exactly what makes it useful to an attacker. The trace is the command line itself, plus the output directory it creates.

**`secretsdump.py`** (from Impacket) can operate remotely against a DC, or parse an already-obtained `NTDS.dit` plus SYSTEM hive offline. Used remotely, it overlaps heavily with the [DCSync technique](#/lesson/l4-05-dcsync-detection) covered separately — the difference being whether credentials are pulled from the file or requested through replication.

> [!IMPORTANT]
> There is essentially no legitimate operational reason to extract `NTDS.dit` from a live production DC outside of a documented DC-promotion or disaster-recovery procedure. Unlike most artifacts in this academy, the baseline here isn't "know what normal looks like" — it's that *any* occurrence warrants immediate investigation until proven to be planned maintenance.

## What to do once extraction is confirmed

Confirmed `NTDS.dit` extraction means every domain credential must be treated as compromised — every user, every service account, every administrator. It also means the krbtgt hash is compromised, which makes the [double reset](#/lesson/l4-04-krbtgt-double-reset) mandatory rather than precautionary, since an attacker holding that hash can forge [Golden Tickets](#/lesson/l4-06-golden-silver-ticket) indefinitely regardless of how many user passwords get changed.

## Normal baseline

Shadow copies on a DC created only by recognized, scheduled backup software, on a documented schedule. `ntdsutil` invoked only during planned DC promotion or documented recovery work, by a named administrator, inside a change window. No copy of `ntds.dit` existing anywhere outside `C:\Windows\NTDS\` or a controlled backup target.

## Red flags

- **`vssadmin create shadow` or `ntdsutil` executed on a DC** outside a documented change window or by an unexpected account.
- **A copy of `ntds.dit` in a staging location** — `C:\Temp`, a user profile, a share — or bundled into an archive alongside the `SYSTEM` hive, which is the pairing that makes it usable.
- **`SYSTEM` and `NTDS.dit` accessed or copied together in close succession**, since neither is much use to an attacker without the other.
- **Impacket-style tooling artifacts on or against a DC**, particularly service creation or remote-execution traces from `secretsdump`.

## How to collect it

Check for shadow-copy creation in `Microsoft-Windows-VolumeSnapshot-Driver/Operational` and in process-creation logging (Sysmon Event ID 1 / Event ID 4688) for `vssadmin`, `ntdsutil`, `esentutl`, or `diskshadow` command lines on DCs specifically. Hunt for stray `ntds.dit` copies and paired `SYSTEM` hive copies outside their expected paths. Correlate any hit with Event ID 4688's parent process to establish how the command was launched.

## ATT&CK mapping

Maps to [OS Credential Dumping: NTDS (T1003.003)](https://attack.mitre.org/techniques/T1003/003/), with the shadow-copy path also touching [Data from Local System (T1005)](https://attack.mitre.org/techniques/T1005/).

## Sources

- [Microsoft Learn — Active Directory database (ntds.dit)](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/virtual-dc/active-directory-domain-services-overview)
- MITRE ATT&CK — T1003.003: OS Credential Dumping: NTDS
- SANS FOR508 — Advanced Incident Response, Threat Hunting, and Digital Forensics
