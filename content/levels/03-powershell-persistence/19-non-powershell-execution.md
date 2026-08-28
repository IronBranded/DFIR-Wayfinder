Every lesson so far in this level has assumed PowerShell. That assumption is exactly the gap a well-informed attacker exploits: an environment with strong PowerShell logging (Level 3's earlier lessons) pushes attackers toward execution engines that logging effort never covered — VBScript, JScript, and WMI chief among them.

> [!PLAIN]
> None of these are exotic. VBScript and JScript are built into every Windows install via the Windows Script Host (`wscript.exe`, `cscript.exe`) — the same engines that ran `.vbs` login scripts for two decades before PowerShell existed. They never went away.

## VBScript and JScript

Executed via `wscript.exe` (GUI, silent by default) or `cscript.exe` (console), both interpreting `.vbs` or `.js` files directly, or HTA files through `mshta.exe` (see the [LOLBins lesson](#/lesson/l2-12-lolbins) for that specific execution path). A classic delivery chain: a phishing attachment drops a `.vbs` file, `wscript.exe` executes it silently with no visible window, and that script downloads and launches the actual payload — three hops removed from anything PowerShell-specific logging would ever see.

> [!IMPORTANT]
> `wscript.exe` runs completely silently by default — no console window, nothing visibly different to a user who just double-clicked an attachment. That silence is precisely why it's a preferred delivery mechanism over a visible `cmd.exe` or PowerShell window that might prompt a second look.

## WMI as an execution engine

Beyond the enumeration/discovery use covered in [Level 2](#/lesson/l2-11-discovery), WMI can execute commands directly — locally via `wmic process call create`, or remotely against another host entirely via the same interface, without ever touching PowerShell's remoting stack (WinRM) or its logging.

```
wmic /node:target-host process call create "cmd.exe /c whoami"
```

This is genuinely remote code execution over a completely legitimate management protocol, and it's also how [WMI Event Subscription persistence](#/lesson/l3-08-wmi-subscriptions) gets established in the first place — the same interface serving both initial execution and long-term persistence.

## Normal baseline

VBScript and JScript still run legitimately in plenty of enterprise environments — older login scripts, third-party software installers, and some line-of-business tooling that predates PowerShell adoption still rely on them. The baseline is knowing *which* scripts are supposed to exist in your environment (a known, documented set, usually in specific known locations like `NETLOGON` or a software deployment share) rather than treating every `.vbs` execution as inherently suspicious.

## Red flags

- **A `.vbs` or `.js` file executing from a location outside the known, documented set** — a temp folder, a downloads directory, an email attachment path, rather than `NETLOGON` or a recognized deployment share.
- **`wscript.exe` or `cscript.exe` spawned by Outlook, a browser, or an Office application** — a parent-child chain with no legitimate reason to exist, exactly parallel to the `mshta.exe`-from-Office pattern in the LOLBins lesson.
- **`wmic process call create` targeting a remote host**, especially from an account with no prior history of that kind of administrative action.
- **A cluster of WMI activity immediately following the discovery-command pattern** from [Level 2](#/lesson/l2-11-discovery) — an attacker who just enumerated the environment, now using WMI to actually move through it.

> [!WARNING]
> An environment with excellent PowerShell Script Block Logging turned on and zero visibility into Windows Script Host or WMI execution has a real, exploitable blind spot — not a hypothetical one. This is precisely the gap this lesson exists to close.

## How to collect it

Windows Security Event ID 4688 with command-line auditing still catches `wscript.exe`/`cscript.exe` process creation and their arguments. WMI activity specifically is best captured via the dedicated **WMI-Activity/Operational** event log channel, which records WMI method calls (including remote ones) independent of standard process-creation logging.

## ATT&CK mapping

[Visual Basic (T1059.005)](https://attack.mitre.org/techniques/T1059/005/) and [JavaScript (T1059.007)](https://attack.mitre.org/techniques/T1059/007/) are sub-techniques of Command and Scripting Interpreter (T1059) — the same parent technique PowerShell (T1059.001) falls under, confirming these are recognized as siblings, not edge cases. WMI execution maps to [Windows Management Instrumentation (T1047)](https://attack.mitre.org/techniques/T1047/) directly.
