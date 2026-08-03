"""
Pre-build step: scans every markdown file for internal links, builds a
reverse index, and injects/updates a "Referenced From" section in each
target file. Idempotent - safe to re-run on every build (used in CI before
`mkdocs build`). Marker comments delineate the generated block so re-runs
replace rather than duplicate it.
"""
import re, os, glob

DOCS = 'docs'
START = '<!-- BACKLINKS:START -->'
END = '<!-- BACKLINKS:END -->'
LINK_RE = re.compile(r'\[([^\]]+)\]\(((?:\.\./|\./|[a-zA-Z0-9_-])[^)#]*\.md)(#[^)]*)?\)')


def all_md_files():
    return sorted(glob.glob(os.path.join(DOCS, '**', '*.md'), recursive=True))


def resolve(source_path, link_target):
    base = os.path.dirname(source_path)
    resolved = os.path.normpath(os.path.join(base, link_target))
    return resolved


def strip_existing_block(content):
    pattern = re.compile(re.escape(START) + r'.*?' + re.escape(END) + r'\n?', re.DOTALL)
    return pattern.sub('', content)


def strip_front_matter(content):
    if content.startswith('---\n'):
        end = content.find('\n---\n', 4)
        if end != -1:
            return content[:end + 5], content[end + 5:]
    return '', content


def main():
    files = all_md_files()
    backlinks = {f: set() for f in files}

    for f in files:
        with open(f, encoding='utf-8') as fh:
            content = fh.read()
        content = strip_existing_block(content)  # don't let prior runs' output seed the index
        for match in LINK_RE.finditer(content):
            target = resolve(f, match.group(2))
            if target in backlinks and target != f:
                backlinks[target].add(f)

    updated = 0
    for f in files:
        with open(f, encoding='utf-8') as fh:
            content = fh.read()
        fm, body = strip_front_matter(content)
        body = strip_existing_block(body)

        sources = sorted(backlinks[f])
        if not sources:
            new_content = fm + body
        else:
            lines = [START, '## Referenced From', '']
            for s in sources:
                rel = os.path.relpath(s, os.path.dirname(f)).replace(os.sep, '/')
                with open(s, encoding='utf-8') as sh:
                    s_content = sh.read()
                h1 = re.search(r'^#\s+(.+)$', strip_front_matter(s_content)[1], re.MULTILINE)
                label = h1.group(1).strip() if h1 else os.path.basename(s)
                lines.append(f'- [{label}]({rel})')
            lines.append('')
            lines.append(END)
            block = '\n'.join(lines) + '\n\n'

            sources_marker = '\n## Sources'
            if sources_marker in body:
                idx = body.index(sources_marker)
                new_body = body[:idx].rstrip() + '\n\n' + block + body[idx:].lstrip('\n')
            else:
                new_body = body.rstrip() + '\n\n' + block
            new_content = fm + new_body

        if new_content != content:
            with open(f, 'w', encoding='utf-8') as fh:
                fh.write(new_content)
            updated += 1

    print(f"Backlinks: updated {updated} of {len(files)} files")


if __name__ == '__main__':
    main()
