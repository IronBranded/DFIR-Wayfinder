import re, os, glob

MODULE_TAG = {
    '00-foundations': 'Foundations',
    '01-windows-endpoint': 'Windows Endpoint',
    '02-active-directory': 'Active Directory',
    '03-memory-forensics': 'Memory Forensics',
    '04-powershell-forensics': 'PowerShell',
    '05-persistence': 'Persistence',
    '06-cloud-identity': 'Cloud Identity',
    '07-defender-suite': 'Defender Suite',
    'network-analysis': 'Network Analysis',
    'anti-forensics': 'Anti-Forensics',
    '08-playbooks': 'Playbook',
    'case-studies': 'Case Study',
    'practice-drills': 'Practice Drill',
}

ATTACK_RE = re.compile(r'\bT1\d{3}(?:\.\d{3})?\b')

def process(path):
    with open(path, encoding='utf-8') as f:
        content = f.read()

    # Skip if front matter already exists
    if content.startswith('---\n'):
        return None

    # Skip bare index/landing pages with no real technical content signal,
    # but still tag them by module for discoverability
    rel = os.path.relpath(path, 'docs')
    parts = rel.split(os.sep)
    module_dir = parts[0]

    tags = []
    module_tag = MODULE_TAG.get(module_dir)
    if module_tag:
        tags.append(module_tag)

    # Persistence entries get an extra Endpoint/Cloud split tag
    if module_dir == '05-persistence':
        if '/cloud' in path or 'oauth' in path or 'mailbox' in path or 'saml' in path or 'break-glass' in path or 'backdoor-app' in path:
            tags.append('Cloud')
        elif rel != '05-persistence/index.md':
            tags.append('Endpoint')

    attack_ids = sorted(set(ATTACK_RE.findall(content)))
    tags.extend(attack_ids)

    if not tags:
        return None

    front_matter = "---\ntags:\n" + "".join(f"  - {t}\n" for t in tags) + "---\n\n"
    with open(path, 'w', encoding='utf-8') as f:
        f.write(front_matter + content)
    return tags

changed = []
for path in sorted(glob.glob('docs/**/*.md', recursive=True)):
    result = process(path)
    if result:
        changed.append((path, result))

print(f"Tagged {len(changed)} files")
for path, tags in changed[:8]:
    print(f"  {path}: {tags}")
print("  ...")
