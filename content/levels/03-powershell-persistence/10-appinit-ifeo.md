Two older mechanisms that keep appearing in real intrusions, for opposite reasons: one because it is broadly disabled and therefore unmonitored, the other because it is a legitimate debugging feature that nobody audits.

## AppInit_DLLs

```
HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Windows\AppInit_DLLs
HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Windows\LoadAppInit_DLLs
```

Any DLL listed in `AppInit_DLLs` is loaded into **every process that loads `user32.dll`** — which is nearly every interactive process on the system. `LoadAppInit_DLLs` must be `1` for the mechanism to be active.

This is **disabled by default on systems with Secure Boot enabled**, which covers most modern hardware. It remains worth checking, because "mostly dead" mechanisms are exactly the ones nobody has a detection for, and older or specially-configured systems still honour it.

## Image File Execution Options

IFEO is a legitimate debugging feature with a straightforward abuse:

```
HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Image File Execution Options\<exe name>\Debugger
```

Set `Debugger` for a given executable name, and **Windows launches the debugger instead, passing the original executable as an argument**. The intended use is attaching a debugger automatically at process start. The abuse is that the "debugger" can be anything.

A related key runs a program when a target process *exits* rather than starts:

```
HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\SilentProcessExit\<exe name>\MonitorProcess
```

## The accessibility backdoor

The best-known IFEO abuse targets Windows' accessibility tools, which are reachable **from the lock screen, before anyone authenticates**:

- `sethc.exe` — Sticky Keys, triggered by pressing Shift five times
- `utilman.exe` — Ease of Access, triggered by Win+U

Setting the IFEO `Debugger` value for either to `cmd.exe` produces a **SYSTEM command prompt on an unauthenticated lock screen**. The older variant simply replaces the binary on disk with `cmd.exe`, which is why comparing those files' hashes against known-good is worth doing independently of the registry check.

> [!WARNING]
> This is a physical-access and RDP-facing technique that requires no credentials at all to use once planted. On any host reachable over RDP, it is a standing remote backdoor.

## Normal baseline

`LoadAppInit_DLLs` is `0` and `AppInit_DLLs` is empty. IFEO subkeys exist for a number of executables by default, but a **`Debugger` value** is rare outside a developer workstation with an actual debugging configuration. `sethc.exe` and `utilman.exe` match their known-good Microsoft hashes and have no IFEO entry.

## Red flags

- **Any `Debugger` value under an IFEO subkey** on a non-developer system — this is close to binary in practice.
- **An IFEO or SilentProcessExit entry naming an accessibility binary** (`sethc.exe`, `utilman.exe`, `osk.exe`, `magnify.exe`, `narrator.exe`, `displayswitch.exe`, `atbroker.exe`).
- **`sethc.exe` or `utilman.exe` whose hash does not match the Microsoft original**, or whose file size matches `cmd.exe`.
- **`AppInit_DLLs` non-empty, or `LoadAppInit_DLLs` set to `1`**, on any modern system.
- **An IFEO entry naming a security product's executable** — a `Debugger` value pointing at a non-existent path prevents that binary from launching at all, which is defence evasion rather than persistence.

## How to collect it

Enumerate IFEO subkeys and look specifically for `Debugger` values — the subkeys themselves are numerous and mostly benign, so the value is the filter. Check `AppInit_DLLs` and `LoadAppInit_DLLs` directly. Hash the accessibility binaries in `System32` against known-good references. Autoruns surfaces both AppInit and IFEO entries. Registry key `LastWriteTime` dates the modification.

## ATT&CK mapping

[Event Triggered Execution: Image File Execution Options Injection (T1546.012)](https://attack.mitre.org/techniques/T1546/012/), [AppInit DLLs (T1546.010)](https://attack.mitre.org/techniques/T1546/010/), and [Accessibility Features (T1546.008)](https://attack.mitre.org/techniques/T1546/008/).

## Sources

- MITRE ATT&CK — T1546.008, T1546.010, T1546.012
- [Microsoft Learn — AppInit_DLLs in Windows 7 and later](https://learn.microsoft.com/en-us/windows/win32/dlls/secure-boot-and-appinit-dlls)
