The registry an investigator sees in `regedit` is a runtime construction — several files merged, with symbolic links papering over the seams. Reading a registry offline from a disk image means dealing with the underlying files directly, and a few structural facts determine whether that reading is correct or quietly wrong.

## Where the hives actually are

| Hive | Path | Contains |
|---|---|---|
| `SYSTEM` | `C:\Windows\System32\config\` | Services, ControlSets, device config |
| `SOFTWARE` | `C:\Windows\System32\config\` | Installed software, Run keys, policies |
| `SAM` | `C:\Windows\System32\config\` | Local accounts |
| `SECURITY` | `C:\Windows\System32\config\` | LSA secrets, policy |
| `NTUSER.DAT` | `C:\Users\<user>\` | Per-user settings, UserAssist, HKCU Run |
| `UsrClass.dat` | `C:\Users\<user>\AppData\Local\Microsoft\Windows\` | Per-user classes, most [ShellBags](#/lesson/l4-09-shellbags) |
| `Amcache.hve` | `C:\Windows\AppCompat\Programs\` | [File inventory with hashes](#/lesson/l4-02-amcache) |

## Transaction logs are not optional

Each hive has `.LOG1` and `.LOG2` companions holding changes not yet flushed into the hive itself. A hive copied from a running system — or from an image taken without a clean shutdown — is **dirty**, and the most recent changes exist only in those logs.

> [!WARNING]
> Copying only the hive file and not its transaction logs silently loses the newest data, which is frequently exactly the data an investigation cares about. Registry Explorer detects dirty hives and offers to replay the logs; take it up on that rather than dismissing the prompt.

## ControlSets: the mistake worth not making

`HKLM\SYSTEM\CurrentControlSet` does not exist on disk. It is a runtime pointer to one of several numbered sets — `ControlSet001`, `ControlSet002`, and so on. Which one was live is recorded in:

```
SYSTEM\Select\Current           the ControlSet that was active
SYSTEM\Select\LastKnownGood     the last-known-good set
```

Reading `ControlSet001` because it is first in the list is a real and common error. It is frequently correct and occasionally not, and when it is wrong the service configuration, [ShimCache](#/lesson/l4-03-shimcache), and LSA settings you read all belong to a configuration that was not in effect.

## Timestamps: keys yes, values no

Registry **keys** carry a `LastWriteTime`. **Values do not.** A key's timestamp reflects the last time any value under it was added, changed, or removed — which, as covered in [Run key persistence](#/lesson/l5-01-registry-run-keys), is what lets you date a modification within an otherwise-static key.

## Deleted keys

Removing a key marks its space unallocated rather than overwriting it. Deleted keys and values frequently remain recoverable from hive slack until that space is reused — which means an attacker who cleaned up their persistence may have left it recoverable.

## Normal baseline

Hives are present at their expected paths with matching transaction logs. `Select\Current` names a ControlSet that exists. Key structures match what the installed OS version and software would produce.

## Red flags

- **A hive `LastWriteTime` clustering around a suspected intrusion window** on keys that should be static.
- **Recoverable deleted keys** under autorun locations — persistence that was installed and then removed.
- **A `Select\Current` value pointing at an unexpected ControlSet**, or ControlSets whose service configurations differ materially from each other.
- **Missing transaction logs** where the hive is dirty — either an incomplete collection or deliberate interference.

## How to collect it

**Registry Explorer** (GUI) and **RECmd** (command line), both Eric Zimmerman tools, handle dirty hives, log replay, and deleted-key recovery. Collect the hive **plus** both `.LOG` files every time. On a live system the `config` hives are locked, so acquire them via a forensic image, a shadow copy, or a tool that reads locked files. Confirm `Select\Current` before reading anything ControlSet-scoped.

## ATT&CK mapping

Evidence-source content supporting the registry-based techniques throughout Levels 2 and 3.

## Sources

- [Eric Zimmerman's tools — Registry Explorer / RECmd](https://ericzimmerman.github.io/)
- [Microsoft Learn — Registry hives](https://learn.microsoft.com/en-us/windows/win32/sysinfo/registry-hives)
- SANS FOR500 — Windows Forensic Analysis
- Windows Internals (Russinovich, Solomon, Ionescu) — registry hive structure and the configuration manager
- 13cubed — registry forensics (YouTube)
