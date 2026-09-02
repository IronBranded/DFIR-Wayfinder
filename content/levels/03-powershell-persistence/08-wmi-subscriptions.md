WMI event subscription persistence is the mechanism that most often survives a competent cleanup, because there is no file to delete and no autostart entry to find. The persistence lives inside the WMI repository as three linked objects, and an investigator who does not specifically query for them will not encounter them at all.

## The three objects

A WMI subscription is always a trio, and all three must exist for it to fire:

1. **`__EventFilter`** — the trigger, expressed as a WQL query. Commonly "within 60 seconds of a process starting," or "at a particular time," or "when a user logs on."
2. **`EventConsumer`** — the action. Two subclasses matter: **`CommandLineEventConsumer`** (runs a command line) and **`ActiveScriptEventConsumer`** (runs VBScript or JScript inline). Both are legitimate WMI features.
3. **`__FilterToConsumerBinding`** — the link between them. Without the binding, the other two objects do nothing.

All three live in the **`root\subscription`** namespace, and physically in the WMI repository at `C:\Windows\System32\wbem\Repository\OBJECTS.DATA`.

> [!IMPORTANT]
> The payload can be embedded entirely inside the consumer as a script or command line. When it is, deleting the original dropper accomplishes nothing — the code lives in the repository and executes from there. This is what "fileless persistence" means concretely, and it is why WMI subscriptions survive cleanups that successfully remove everything else.

## Detection

`Microsoft-Windows-WMI-Activity/Operational` carries the native events, of which **5861** is the one to know: it records the registration of a permanent event consumer, including the consumer's details. 5859 and 5860 cover related subscription activity.

Sysmon covers this more cleanly, with a dedicated event per object:

| Sysmon ID | Object |
|---|---|
| 19 | WmiEventFilter activity |
| 20 | WmiEventConsumer activity |
| 21 | WmiEventConsumerToFilter activity |

Seeing all three in sequence is a subscription being installed, start to finish — which is why [Sysmon deployment](#/lesson/l1-11-sysmon-deployment) meaningfully changes what is detectable here.

## Normal baseline

Legitimate WMI subscriptions exist and are not rare — SCCM/Configuration Manager, Intune, and several monitoring and inventory products use them by design. The baseline is knowing which management tooling is deployed and what it registers, so the question becomes "is this consumer one of ours" rather than "does a subscription exist."

## Red flags

- **An `ActiveScriptEventConsumer` containing inline VBScript or JScript** — legitimate management tooling overwhelmingly favours command-line consumers pointing at signed binaries.
- **A `CommandLineEventConsumer` invoking `powershell.exe`, `mshta.exe`, or an encoded command.**
- **A filter triggering on process start, logon, or a short recurring interval**, paired with a consumer that has nothing to do with monitoring.
- **A subscription whose consumer name imitates a Microsoft or management-tool naming convention** but does not match anything actually deployed.
- **Any subscription registered inside a suspected intrusion window** — the 5861 or Sysmon 19/20/21 timestamps date the installation.

## How to collect it

Live, query the namespace directly:

```
Get-WmiObject -Namespace root\Subscription -Class __EventFilter
Get-WmiObject -Namespace root\Subscription -Class __EventConsumer
Get-WmiObject -Namespace root\Subscription -Class __FilterToConsumerBinding
```

Read all three and reconcile them — an orphaned filter or consumer with no binding is inert but still evidence. Autoruns includes a WMI tab covering subscriptions. Offline, the repository file itself can be parsed with `python-cim` or similar tooling, which is the only option when the host cannot be queried live.

## ATT&CK mapping

Maps to [Event Triggered Execution: Windows Management Instrumentation Event Subscription (T1546.003)](https://attack.mitre.org/techniques/T1546/003/).

## Sources

- MITRE ATT&CK — T1546.003
- [Microsoft Learn — Receiving a WMI event](https://learn.microsoft.com/en-us/windows/win32/wmisdk/receiving-a-wmi-event)
