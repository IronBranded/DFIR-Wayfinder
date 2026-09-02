A typical Windows host runs somewhere north of two hundred services. That is the entire appeal: a malicious service starts automatically, runs as SYSTEM without any user logged in, restarts itself if it dies, and hides in a list nobody reads end to end.

## Where a service actually lives

Every service is a registry key under `HKLM\SYSTEM\CurrentControlSet\Services\<ServiceName>`, with a handful of values that carry all the forensic weight:

- **`ImagePath`** — the executable, and the single most informative value.
- **`Start`** — `0` boot, `1` system, `2` automatic, `3` manual, `4` disabled.
- **`Type`** — own process, shared process, or kernel driver (`1` means a driver, which is [a different problem entirely](#/lesson/l2-13-byovd-loldrivers)).
- **`ServiceDll`** — under the `Parameters` subkey, for services hosted inside `svchost.exe` rather than running their own executable.

That last one matters more than it looks. A service hosted by `svchost.exe` has an `ImagePath` of `svchost.exe -k <group>` — which looks entirely legitimate, because it is. **The malicious code is in `ServiceDll`**, one level down, and a triage that only reads `ImagePath` will see nothing wrong. This is also why the [process tree baseline](#/lesson/l2-10-process-trees) alone won't catch it: the process genuinely is `svchost.exe` with a genuine `-k` argument and a genuine `services.exe` parent.

## Event ID 7045

**7045** ("A service was installed in the system," System log, source Service Control Manager) is the highest-value single event in this lesson and is logged by default with no audit policy required. It records the service name, image path, service type, and start type at installation.

**7040** records a start-type change — an attacker enabling a previously disabled service, or setting a manual service to automatic. **4697** in the Security log covers service installation too, but depends on audit policy being enabled.

> [!TIP]
> 7045 is also a reliable lateral-movement detection. PsExec works by installing a service on the target — historically named `PSEXESVC`, though the name is trivially changed. A 7045 on a machine nobody administers, at a time nobody was working, is worth a look regardless of what the service claims to be.

## Normal baseline

Services point at signed binaries in `System32`, `SysWOW64`, or a vendor directory under Program Files. Microsoft services have descriptions and display names that match their function. Service names are meaningful rather than random. On a managed fleet, the service list is broadly consistent across machines, so comparing a suspect host against a peer is an effective first pass.

## Red flags

- **An `ImagePath` under `%TEMP%`, `%APPDATA%`, `C:\Users\Public`, or the root of `C:\`.**
- **A `ServiceDll` pointing outside `System32`** — the svchost-hosted variant described above.
- **A random or pseudo-random service name**, or a name imitating a Microsoft service with a spelling variation.
- **Missing description or a description copied verbatim from a real Microsoft service.**
- **An unsigned binary**, or one signed by a certificate unrelated to the service's claimed vendor.
- **A 7045 outside a maintenance window**, particularly followed shortly by service start and network activity.
- **`Type` of `1` (kernel driver) for something claiming to be an application service** — see [BYOVD](#/lesson/l2-13-byovd-loldrivers).

## How to collect it

Query 7045 from the System log first — it is the fastest path to a candidate list and needs no special configuration. Then read the registry key for each candidate, including the `Parameters\ServiceDll` value, which `sc qc` does not show. Offline, parse the `SYSTEM` hive with Registry Explorer, taking care to read the ControlSet that was actually live at boot rather than assuming `ControlSet001`. Autoruns' Services tab applies signature verification across the whole list.

## ATT&CK mapping

Maps to [Create or Modify System Process: Windows Service (T1543.003)](https://attack.mitre.org/techniques/T1543/003/), with the lateral-movement case mapping to [Remote Services: SMB/Windows Admin Shares (T1021.002)](https://attack.mitre.org/techniques/T1021/002/).

## Sources

- MITRE ATT&CK — T1543.003
- [Microsoft Learn — Services registry entries](https://learn.microsoft.com/en-us/windows-hardware/drivers/install/hklm-system-currentcontrolset-services-registry-tree)
- Windows Internals (Russinovich, Solomon, Ionescu) — the Service Control Manager and svchost service hosting
