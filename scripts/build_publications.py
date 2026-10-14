#!/usr/bin/env python3
"""Build the Publications list in index.html from publications.bib (Python 3.9+, standard library only).

    python3 scripts/build_publications.py

Everything between <!-- PUBLICATIONS:START --> and <!-- PUBLICATIONS:END --> in index.html is replaced.
Authors are written "Last, First and Last, First" in the .bib and shown as "First Last".
Custom BibTeX fields: pdf, code, arxiv, project, video, thumb (an image path; no thumb = no thumbnail),
selected (anything = highlighted), venue_short (the venue line shown on the page; default: booktitle/journal).
Custom fields are removed from the BibTeX shown on the page.
Running it twice gives the same result.
"""
import html, os, re, sys

MY_NAME = 'Madhav Iyengar'   # this author is shown in bold; set it to your real name as it appears in the .bib file

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BIB, PAGE = os.path.join(ROOT, 'publications.bib'), os.path.join(ROOT, 'index.html')
START, END = '<!-- PUBLICATIONS:START -->', '<!-- PUBLICATIONS:END -->'
CUSTOM = ['pdf', 'code', 'arxiv', 'project', 'video', 'thumb', 'selected', 'venue_short']
LINKS = [('pdf', 'PDF'), ('code', 'Code'), ('arxiv', 'arXiv'), ('project', 'Project'), ('video', 'Video')]

# ---------- tiny BibTeX parser ----------
def parse_bib(text):
    text = re.sub(r'(?m)^\s*%.*$', '', text)
    entries, i = [], 0
    while True:
        m = re.compile(r'@(\w+)\s*\{\s*([^,\s]+)\s*,').search(text, i)
        if not m: break
        depth, j = 1, m.end()
        while j < len(text) and depth:
            depth += {'{': 1, '}': -1}.get(text[j], 0); j += 1
        body = text[m.end():j - 1]
        fields, k = [], 0
        while True:
            fm = re.compile(r'\s*(\w+)\s*=\s*').search(body, k)
            if not fm: break
            k, ch = fm.end(), body[fm.end():fm.end() + 1]
            if ch == '{':
                d, e = 1, k + 1
                while e < len(body) and d:
                    d += {'{': 1, '}': -1}.get(body[e], 0); e += 1
                val, k = body[k + 1:e - 1], e
            elif ch == '"':
                e = body.index('"', k + 1); val, k = body[k + 1:e], e + 1
            else:
                em = re.compile(r'[,\s}]').search(body, k); e = em.start() if em else len(body); val, k = body[k:e], e
            fields.append((fm.group(1).lower(), re.sub(r'\s+', ' ', val.strip())))
            c = re.compile(r',').search(body, k)
            k = c.end() if c else len(body)
        entries.append({'type': m.group(1).lower(), 'key': m.group(2), 'fields': fields})
        i = j
    return entries

# ---------- LaTeX -> text ----------
ACC = {'"': {'a': 'ä', 'o': 'ö', 'u': 'ü', 'A': 'Ä', 'O': 'Ö', 'U': 'Ü', 'e': 'ë', 'i': 'ï'},
       "'": {'a': 'á', 'e': 'é', 'i': 'í', 'o': 'ó', 'u': 'ú', 'A': 'Á', 'E': 'É', 'O': 'Ó', 'U': 'Ú'},
       '`': {'a': 'à', 'e': 'è', 'u': 'ù', 'o': 'ò', 'i': 'ì'}, '^': {'a': 'â', 'e': 'ê', 'o': 'ô', 'i': 'î', 'u': 'û'},
       '~': {'n': 'ñ', 'a': 'ã', 'o': 'õ', 'N': 'Ñ'}, 'c': {'c': 'ç', 'C': 'Ç'}, 'v': {'s': 'š', 'c': 'č', 'z': 'ž', 'S': 'Š', 'C': 'Č', 'Z': 'Ž'}}
def unlatex(s):
    s = re.sub(r'\{?\\([\"\'`^~])\{?\\?([A-Za-z])\}?\}?', lambda m: ACC[m.group(1)].get(m.group(2), m.group(2)), s)
    s = re.sub(r'\{?\\([cv])\s*\{?([A-Za-z])\}?\}?', lambda m: ACC[m.group(1)].get(m.group(2), m.group(2)), s)
    s = s.replace('\\&', '&').replace('\\%', '%').replace('\\_', '_').replace('\\#', '#').replace('~', '\u00a0').replace('--', '\u2013')
    s = s.replace('{', '').replace('}', '')
    return re.sub(r'\\[a-zA-Z]+\s*', '', s).strip()

def authors_of(s):
    out = []
    for a in re.split(r'\s+and\s+', s):
        a = unlatex(a)
        if ',' in a:
            last, first = [p.strip() for p in a.split(',', 1)]
            a = (first + ' ' + last).strip()
        out.append(a)
    return out

# ---------- HTML ----------
def esc(s): return html.escape(s, quote=True)

def render(e):
    f = dict(e['fields'])
    title = esc(unlatex(f.get('title', '')))
    names = [esc(a) for a in authors_of(f.get('author', ''))]
    names = ['<strong>%s</strong>' % n if n == esc(MY_NAME) else n for n in names]
    venue = unlatex(f.get('venue_short') or f.get('booktitle') or f.get('journal') or f.get('publisher') or f.get('howpublished') or '')
    year = f.get('year', '')
    venue_html = '<em>%s</em>' % esc(venue)
    if e['type'] == 'article' and year and year not in venue: venue_html += ', ' + esc(year)
    links = ' '.join('<a href="%s">%s</a>' % (esc(f[k]), lab) for k, lab in LINKS if f.get(k))
    thumb = ('<img class="thumb" src="%s" alt="" width="168" height="116" loading="lazy">' % esc(f['thumb'])
             if f.get('thumb') else '')
    # BibTeX shown on the page: the entry without the custom fields
    rows = [(k, v) for k, v in e['fields'] if k not in CUSTOM]
    w = max([len(k) for k, _ in rows] or [0])
    bib = '@%s{%s,\n%s\n}' % (e['type'], e['key'], ',\n'.join('  %s = {%s}' % (k.ljust(w), v) for k, v in rows))
    cls = 'pub pub-selected' if f.get('selected') else 'pub'
    return '''        <article class="%s">%s
          <div class="pub-body">
            <h3>%s</h3>
            <p class="authors">%s</p>
            <p class="venue">%s</p>
            <div class="pub-links">
              %s
              <details class="bibtex"><summary>BibTeX</summary>
<pre>%s</pre></details>
            </div>
          </div>
        </article>''' % (cls, ('\n          ' + thumb) if thumb else '', title, ', '.join(names), venue_html, links, esc(bib))

def main():
    with open(BIB, encoding='utf-8') as fh: entries = parse_bib(fh.read())
    entries.sort(key=lambda e: -int((re.search(r'\d{4}', dict(e['fields']).get('year', '0')) or [0])[0] if re.search(r'\d{4}', dict(e['fields']).get('year', '0')) else 0))
    block = '\n\n'.join(render(e) for e in entries)
    with open(PAGE, encoding='utf-8') as fh: page = fh.read()
    if START not in page or END not in page: sys.exit('Markers %s ... %s not found in index.html' % (START, END))
    a, b = page.index(START) + len(START), page.index(END)
    new = page[:a] + '\n\n' + block + '\n\n        ' + page[b:]
    if new != page:
        with open(PAGE, 'w', encoding='utf-8') as fh: fh.write(new)
    print('%d publication(s) written to index.html' % len(entries))

if __name__ == '__main__':
    main()
