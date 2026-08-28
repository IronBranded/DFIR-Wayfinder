[Mailbox & Message-Trace Forensics](#/lesson/l6-15-mailbox-message-trace-forensics) covers email. This lesson covers the other place a compromised M365 account's data actually leaves the building: SharePoint and OneDrive, where an attacker with a working session can pull an entire document library without ever touching a mailbox.

## The audit events that matter

- **`FileDownloaded`** — the standard direct-download event, fired when a user (or an automated tool acting as that user) downloads a file through the normal browser or client path.
- **`FileSyncDownloadedFull`** — fired by the OneDrive sync client replicating server content to a local machine. Legitimate constantly, but also a way to pull an entire library's worth of content that reads, on its surface, like routine sync activity rather than a deliberate bulk download.
- **`SharingSet`** / **`AnonymousLinkCreated`** — external sharing events, a second, separate exfiltration path that doesn't require a download at all: create a link, and the data leaves via whoever the link reaches.

> [!IMPORTANT]
> Security researchers have documented a specific evasion here worth knowing: fetching files via SharePoint's client object model (CSOM) rather than a normal browser download can generate a **`FileAccessed`** event instead of `FileDownloaded` — meaning a detection rule built to watch `FileDownloaded` alone can miss automated, large-scale content retrieval entirely. Monitor unusual `FileAccessed` volume alongside `FileDownloaded`, not instead of it.

## Normal baseline

`FileDownloaded` and `FileSyncDownloadedFull` events occur constantly across any active M365 tenant — the baseline is volume and pattern per user, not the presence of these events at all. A given user's normal download activity is small, spread across a working day, and touches files consistent with their actual role.

## Red flags

- **A high volume of `FileDownloaded` events from a single user in a short time window** — one well-known detection pattern flags more than roughly 50 files downloaded by one user within a single hour, a threshold well outside normal interactive browsing behavior.
- **A folder downloaded as a `.zip`**, identifiable by its distinct User-Agent (`OneDriveMpc-Transform_Zip/1.0`) rather than the standard browser User-Agent — a detail worth knowing specifically because it tells you the *method*, which matters for scoping how much data actually left.
- **Unusually high `FileAccessed` volume with no corresponding `FileDownloaded` events** — potentially the CSOM-based evasion pattern rather than genuinely benign browsing.
- **`AnonymousLinkCreated` or `SharingSet` events targeting sensitive document libraries**, especially from an account with no history of external-sharing activity.
- **Any of the above immediately following unfamiliar `MailItemsAccessed` activity** covered in the [mailbox forensics lesson](#/lesson/l6-15-mailbox-message-trace-forensics) — an attacker who's already established they can read mail is a strong candidate to also be pulling files from the same compromised session.

## How to collect it

`Search-UnifiedAuditLog` with `-RecordType SharePointFileOperation -Operations "FileDownloaded"` (or `FileAccessed`, `FileSyncDownloadedFull`, `SharingSet`, `AnonymousLinkCreated` as needed) is the direct query path:

```powershell
Search-UnifiedAuditLog -StartDate (Get-Date).AddDays(-7) -EndDate (Get-Date) `
  -RecordType SharePointFileOperation -Operations FileDownloaded -ResultSize 5000
```

Grouping results by user and hour, then filtering for counts exceeding a reasonable per-user threshold, is the practical way to surface mass-download activity rather than reviewing individual events one at a time.

## ATT&CK mapping

Maps to [Data from Cloud Storage (T1530)](https://attack.mitre.org/techniques/T1530/) for the download/sync path and [Exfiltration Over Web Service (T1567)](https://attack.mitre.org/techniques/T1567/) or its sharing-link variant for the external-sharing path — both are the direct evidence source behind [the Data Exfiltration playbook](#/lesson/l8-07-playbook-data-exfiltration), which assumes exactly this kind of artifact-level detail is already understood before an investigator opens it.
