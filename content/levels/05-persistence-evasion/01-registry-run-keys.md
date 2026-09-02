The oldest persistence mechanism on Windows is still the most common one, for a reason that has nothing to do with sophistication: it requires no privileges beyond writing to the current user's own registry, it survives reboot, and on a busy machine the value sits among a dozen legitimate entries that nobody has audited in years.

## The keys

Four paths carry the bulk of it, in both `HKLM` (all users, requires admin) and `HKCU` (current user, no admin needed):

```
HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce
HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Run
HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\RunOnce
```

**`RunOnce` deletes its value after executing it** — which cuts both ways. It gives an attacker a self-cleaning launcher, and it means the artifact may be gone by the time you look, leaving the registry key's `LastWriteTime` as the only trace.

On 64-bit Windows, 32-bit software uses the `Wow6432Node` variants:

```
HKLM\SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\Run
```

These are genuinely separate keys, and checking only the native path misses anything a 32-bit installer wrote.

## The timestamp that pins the install

Registry **keys** carry a `LastWriteTime`; registry **values** do not. That means a Run key's `LastWriteTime` tells you when a value was last added, modified, or removed under it — which, when the key otherwise contains only long-standing vendor entries, effectively dates the persistence installation. It is one of the few timestamps in this artifact class, and it correlates directly against process execution and [Prefetch](#/lesson/l4-01-prefetch) evidence from the same window.

## Normal baseline

Legitimate Run entries are vendor updaters (`OneDrive`, `Teams`, Adobe, Java), security agents, hardware utilities (audio, touchpad, graphics), and cloud-sync clients. They point at signed binaries under `C:\Program Files`, `C:\Program Files (x86)`, or a vendor directory under `%LOCALAPPDATA%` for per-user installs. Value names generally match the product. On a managed fleet the set is broadly consistent machine to machine, which makes outlier comparison a viable hunt on its own.

## Red flags

- **An interpreter as the executable** — `powershell.exe`, `wscript.exe`, `mshta.exe`, `cmd.exe`, or `rundll32.exe` with an unusual export.
- **`-enc` / `-EncodedCommand`**, which is a [decode job](#/lesson/l3-14-powershell-obfuscation) and almost never legitimate in a Run key.
- **A path under `%TEMP%`, `%APPDATA%\Roaming`, or `C:\Users\Public`** — legitimate software installs to Program Files or a vendor-named LocalAppData folder, not loose in a temp directory.
- **A value name mimicking a Microsoft component** but pointing somewhere Microsoft would never write to.
- **A `LastWriteTime` on the key falling inside a suspected intrusion window**, even if the value itself now looks unremarkable.

## How to collect it

**Autoruns** (Sysinternals) is the practical tool — it covers Run keys plus roughly a hundred other autostart locations, and its **"Hide Microsoft entries"** and **"Verify code signatures"** options collapse a long list into a short one worth reading. Live, `reg query "HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Run"` works for a quick look. Offline, parse `SOFTWARE` and `NTUSER.DAT` with Registry Explorer or RECmd, which is also how you read the key `LastWriteTime` reliably.

## ATT&CK mapping

Maps to [Boot or Logon Autostart Execution: Registry Run Keys / Startup Folder (T1547.001)](https://attack.mitre.org/techniques/T1547/001/).

> [!TIP]
> The Startup folder (`%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup`) belongs to the same ATT&CK sub-technique and is checked the same way — a shortcut or script dropped there runs at logon with no registry write at all.

## Sources

- MITRE ATT&CK — T1547.001
- [Microsoft Learn — Run and RunOnce registry keys](https://learn.microsoft.com/en-us/windows/win32/setupapi/run-and-runonce-registry-keys)
